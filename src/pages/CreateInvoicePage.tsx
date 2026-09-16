import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Plus, X, ChevronDown, User, Package,
  Trash2, CreditCard, Banknote, Smartphone, Building2,
  FileText, CheckCircle2, AlertCircle, Info, ArrowLeft,
  Calendar, Hash, StickyNote, Eye, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockCustomers, mockProducts } from '../data/mockData';
import type { Customer, Product, Invoice } from '../types';
import InvoicePreviewModal from '../components/invoice/InvoicePreviewModal';
import type { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  id: string;
  productId: string;
  name: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;   // flat ₹ discount
  gstRate: number;    // percentage (0, 5, 12, 18, 28)
}

type PaymentMode = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'pending';
type PaymentType = 'full' | 'partial' | 'pending';

// ─── Utilities ────────────────────────────────────────────────────────────────
const fc = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

const fInt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const uid = () => Math.random().toString(36).slice(2, 9);

const TODAY = new Date().toISOString().slice(0, 10);
const DUE_15 = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

// Line item calculations
const lineSubtotal = (item: LineItem) => (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
const lineDiscounted = (item: LineItem) => Math.max(0, lineSubtotal(item) - (Number(item.discount) || 0));
const lineGst = (item: LineItem) => (lineDiscounted(item) * (Number(item.gstRate) || 0)) / 100;
const lineTotal = (item: LineItem) => lineDiscounted(item) + lineGst(item);

const GST_RATES = [0, 5, 12, 18, 28];

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');
  const { addInvoice, customers } = useApp();

  // Invoice meta
  const [invoiceNo] = useState(`INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`);
  const [invoiceDate, setInvoiceDate] = useState(TODAY);
  const [dueDate, setDueDate] = useState(DUE_15);
  const [placeOfSupply, setPlaceOfSupply] = useState('Karnataka (29)');
  const [notes, setNotes] = useState('Thank you for your business! Goods once sold are not returnable.');

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (customerIdParam) {
      const custList = customers && customers.length > 0 ? customers : mockCustomers;
      return custList.find(c => c.id === customerIdParam) || null;
    }
    return null;
  });
  const [custSearch, setCustSearch] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [addingCust, setAddingCust] = useState(false);

  // New customer quick-form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: uid(),
      productId: 'p-1',
      name: 'Office Chair Ergonomic Pro',
      hsnCode: '9401',
      unit: 'pcs',
      quantity: 1,
      unitPrice: 12500,
      discount: 0,
      gstRate: 18,
    }
  ]);
  const [prodSearch, setProdSearch] = useState('');
  const [showProdDropdown, setShowProdDropdown] = useState(false);

  // Payment
  const [payMode, setPayMode] = useState<PaymentMode>('cash');
  const [payType, setPayType] = useState<PaymentType>('full');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const custRef = useRef<HTMLDivElement>(null);

  const custList = customers && customers.length > 0 ? customers : mockCustomers;
  const filteredCusts = custList.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone.includes(custSearch)
  );

  const filteredProds = mockProducts.filter(p =>
    (p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
     p.sku.toLowerCase().includes(prodSearch.toLowerCase())) &&
    !items.find(i => i.productId === p.id)
  );

  // ── Item helpers ────────────────────────────────────────────────────────
  const addProduct = useCallback((p: Product) => {
    setItems(prev => [...prev, {
      id: uid(),
      productId: p.id,
      name: p.name,
      hsnCode: p.hsnCode || '9403',
      unit: p.unit || 'pcs',
      quantity: 1,
      unitPrice: p.price,
      discount: 0,
      gstRate: p.gstRate || 18,
    }]);
    setProdSearch('');
    setShowProdDropdown(false);
  }, []);

  const addCustomItem = () => {
    setItems(prev => [...prev, {
      id: uid(),
      productId: `custom-${Date.now()}`,
      name: '',
      hsnCode: '9983',
      unit: 'pcs',
      quantity: 1,
      unitPrice: 1000,
      discount: 0,
      gstRate: 18,
    }]);
  };

  const updateItem = useCallback(<K extends keyof LineItem>(id: string, key: K, val: LineItem[K]) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Summary calculations ────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + lineSubtotal(i), 0);
  const totalDisc = items.reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const taxable = Math.max(0, subtotal - totalDisc);
  const totalGst = items.reduce((s, i) => s + lineGst(i), 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const rawGrandTotal = taxable + totalGst;
  const finalTotal = Math.round(rawGrandTotal);
  const roundOff = finalTotal - rawGrandTotal;

  const paidAmount = payType === 'full'
    ? finalTotal
    : payType === 'pending'
      ? 0
      : Math.min(finalTotal, Number(amountPaid) || 0);
  const balanceDue = Math.max(0, finalTotal - paidAmount);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!customer && !addingCust) {
      e.customer = 'Select or add a customer';
    }
    if (addingCust && !newCustName.trim()) {
      e.custName = 'Customer name is required';
    }
    if (addingCust && !newCustPhone.trim()) {
      e.custPhone = 'Phone number is required';
    }
    if (items.length === 0) {
      e.items = 'Add at least one product or item';
    }
    const emptyName = items.find(i => !i.name.trim());
    if (emptyName) {
      e.items = 'All line items must have a name';
    }
    if (payType === 'partial' && (!amountPaid || Number(amountPaid) <= 0)) {
      e.amountPaid = 'Enter the amount paid';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getEffectiveCustomer = () => {
    if (customer) {
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        gstin: customer.gstin,
        address: `${customer.address}, ${customer.city}`,
      };
    }
    return {
      id: `cust-${Date.now()}`,
      name: newCustName.trim() || 'Walk-in Customer',
      phone: newCustPhone.trim() || '+91 98765 43210',
      gstin: newCustGstin.trim() || undefined,
      address: newCustAddress.trim() || 'Bengaluru, Karnataka',
    };
  };

  const currentPreviewData: TaxInvoiceData = {
    invoiceNumber: invoiceNo,
    invoiceDate,
    dueDate,
    customerName: addingCust ? (newCustName || 'New Customer') : (customer?.name || 'Customer'),
    customerPhone: addingCust ? newCustPhone : customer?.phone,
    customerGstin: addingCust ? newCustGstin : customer?.gstin,
    customerAddress: addingCust ? newCustAddress : (customer ? `${customer.address}, ${customer.city}` : undefined),
    placeOfSupply,
    items: items.map(i => ({
      productName: i.name || 'Unnamed Item',
      hsnCode: i.hsnCode,
      unit: i.unit,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      gstRate: i.gstRate,
      total: lineTotal(i),
    })),
    subtotal,
    discount: totalDisc,
    taxableAmount: taxable,
    cgst,
    sgst,
    gst: totalGst,
    roundOff,
    total: finalTotal,
    paid: paidAmount,
    balance: balanceDue,
    status: payType === 'full' ? 'paid' : payType === 'pending' ? 'pending' : 'partial',
    paymentMethod: payMode === 'cash' ? 'Cash' : payMode === 'upi' ? 'UPI' : payMode === 'card' ? 'Card' : 'Bank Transfer',
    notes,
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setGenerating(true);

    const effCust = getEffectiveCustomer();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNo,
      customerId: effCust.id,
      customerName: effCust.name,
      customerPhone: effCust.phone,
      customerGstin: effCust.gstin,
      customerAddress: effCust.address,
      date: invoiceDate,
      dueDate,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.unitPrice,
        discount: i.discount,
        gstRate: i.gstRate,
        total: lineTotal(i),
        hsnCode: i.hsnCode,
      })),
      subtotal,
      discount: totalDisc,
      gst: totalGst,
      total: finalTotal,
      paid: paidAmount,
      balance: balanceDue,
      status: payType === 'full' ? 'paid' : payType === 'pending' ? 'pending' : 'paid',
      paymentMethod: payMode === 'cash' ? 'Cash' : payMode === 'upi' ? 'UPI' : payMode === 'card' ? 'Card' : 'Bank Transfer',
      notes,
    };

    addInvoice(newInvoice);
    await new Promise(r => setTimeout(r, 900));

    navigate('/billing/success', {
      state: {
        ...currentPreviewData,
        customerName: effCust.name,
        customerPhone: effCust.phone,
        status: newInvoice.status,
      }
    });
  };

  const handleDraft = async () => {
    setSaving(true);
    const effCust = getEffectiveCustomer();
    const draftInvoice: Invoice = {
      id: `inv-draft-${Date.now()}`,
      invoiceNumber: invoiceNo,
      customerId: effCust.id,
      customerName: effCust.name || 'Draft Customer',
      customerPhone: effCust.phone || '',
      date: invoiceDate,
      dueDate,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.name || 'Item',
        quantity: i.quantity,
        unit: i.unit,
        price: i.unitPrice,
        discount: i.discount,
        gstRate: i.gstRate,
        total: lineTotal(i),
        hsnCode: i.hsnCode,
      })),
      subtotal,
      discount: totalDisc,
      gst: totalGst,
      total: finalTotal,
      paid: 0,
      balance: finalTotal,
      status: 'draft',
      notes,
    };

    addInvoice(draftInvoice);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    navigate('/billing');
  };

  return (
    <div className="animate-fade-in">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/billing')}
            className="btn-secondary gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="page-title text-xl sm:text-2xl">Create Invoice</h1>
            <p className="page-subtitle flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3.5 h-3.5 text-primary-500" />
              <span className="font-mono text-primary-700 font-semibold">{invoiceNo}</span>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-600 font-medium text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> GST Ready
              </span>
            </p>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={handleDraft}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? <Spinner /> : <FileText className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="btn-secondary text-primary-700 hover:text-primary-800 border-primary-200 hover:bg-primary-50"
          >
            <Eye className="w-4 h-4" />
            Preview Invoice
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary px-6 shadow-md shadow-primary-600/20"
          >
            {generating ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
            Generate Invoice
          </button>
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN (Main Form) ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Invoice Meta */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Invoice Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className="input-base pl-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Payment Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="input-base pl-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Place of Supply</label>
                <select
                  value={placeOfSupply}
                  onChange={e => setPlaceOfSupply(e.target.value)}
                  className="input-base text-sm"
                >
                  <option value="Karnataka (29)">Karnataka (29)</option>
                  <option value="Tamil Nadu (33)">Tamil Nadu (33)</option>
                  <option value="Maharashtra (27)">Maharashtra (27)</option>
                  <option value="Delhi (07)">Delhi (07)</option>
                  <option value="Telangana (36)">Telangana (36)</option>
                  <option value="Andhra Pradesh (37)">Andhra Pradesh (37)</option>
                  <option value="Kerala (32)">Kerala (32)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Customer Section ──────────────────────────────────────── */}
          <Section
            title="Customer Details"
            icon={<User className="w-4 h-4 text-primary-600" />}
            error={errors.customer}
          >
            {!addingCust ? (
              <div className="space-y-3">
                {/* Selected Customer Card */}
                {customer && (
                  <div className="flex items-center justify-between gap-3 p-4 bg-primary-50/70 border border-primary-200 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mt-0.5">
                          <span>{customer.phone}</span>
                          {customer.gstin && (
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-primary-200 text-primary-800 font-semibold">
                              GST: {customer.gstin}
                            </span>
                          )}
                          <span>{customer.city}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCustomer(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Change customer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Customer Search & Quick Add */}
                {!customer && (
                  <div className="space-y-3">
                    <div className="relative" ref={custRef}>
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search existing customer by name or phone..."
                        value={custSearch}
                        onChange={e => { setCustSearch(e.target.value); setShowCustDropdown(true); }}
                        onFocus={() => setShowCustDropdown(true)}
                        className="input-base pl-10 text-sm"
                      />
                      {showCustDropdown && custSearch && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-30 mt-1 max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {filteredCusts.length > 0 ? filteredCusts.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setCustomer(c);
                                setCustSearch('');
                                setShowCustDropdown(false);
                                setErrors(prev => ({ ...prev, customer: '' }));
                              }}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-primary-50/60 text-left transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {c.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                                <p className="text-xs text-slate-500">{c.phone} {c.gstin ? `· GST: ${c.gstin}` : ''}</p>
                              </div>
                              <span className="text-xs text-primary-600 font-medium">Select</span>
                            </button>
                          )) : (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">
                              No existing customer matches &quot;{custSearch}&quot;
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCust(true);
                          setErrors(prev => ({ ...prev, customer: '' }));
                        }}
                        className="btn-secondary w-full border-dashed text-primary-700 border-primary-200 hover:border-primary-400 hover:bg-primary-50/50 justify-center text-xs font-semibold py-2.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Customer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Quick Add Customer Form */
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Customer Details</p>
                  <button
                    type="button"
                    onClick={() => setAddingCust(false)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search Existing
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandra"
                      value={newCustName}
                      onChange={e => {
                        setNewCustName(e.target.value);
                        setErrors(prev => ({ ...prev, custName: '' }));
                      }}
                      className={`input-base text-sm ${errors.custName ? 'input-error' : ''}`}
                    />
                    {errors.custName && <ErrorMsg msg={errors.custName} />}
                  </div>

                  <div>
                    <label className="label-text">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newCustPhone}
                      onChange={e => {
                        setNewCustPhone(e.target.value);
                        setErrors(prev => ({ ...prev, custPhone: '' }));
                      }}
                      className={`input-base text-sm ${errors.custPhone ? 'input-error' : ''}`}
                    />
                    {errors.custPhone && <ErrorMsg msg={errors.custPhone} />}
                  </div>

                  <div>
                    <label className="label-text">GSTIN <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="29AABCK1234L1Z5"
                      value={newCustGstin}
                      onChange={e => setNewCustGstin(e.target.value.toUpperCase())}
                      className="input-base text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="label-text">Address / City</label>
                    <input
                      type="text"
                      placeholder="Indiranagar, Bengaluru"
                      value={newCustAddress}
                      onChange={e => setNewCustAddress(e.target.value)}
                      className="input-base text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ── Products & Services Section ───────────────────────────── */}
          <Section
            title="Products & Services"
            icon={<Package className="w-4 h-4 text-primary-600" />}
            error={errors.items}
          >
            {/* Search Catalog + Add Custom Item */}
            <div className="flex items-center gap-2.5 mb-4 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search catalog by product name or SKU..."
                  value={prodSearch}
                  onChange={e => { setProdSearch(e.target.value); setShowProdDropdown(true); }}
                  onFocus={() => setShowProdDropdown(true)}
                  className="input-base pl-10 text-sm"
                />

                {showProdDropdown && prodSearch && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-30 mt-1 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredProds.length > 0 ? filteredProds.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          addProduct(p);
                          setErrors(prev => ({ ...prev, items: '' }));
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-primary-50/60 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                          <p className="text-xs text-slate-400">
                            {p.sku} · {fc(p.price)} · HSN: {p.hsnCode} · GST {p.gstRate}% · Stock: {p.stock}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      </button>
                    )) : (
                      <div className="px-4 py-3 text-sm text-slate-400 text-center">
                        No product found in catalog matching &quot;{prodSearch}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={addCustomItem}
                className="btn-secondary gap-1 text-xs font-semibold py-2.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Item
              </button>
            </div>

            {/* Line Items Table (Desktop) */}
            {items.length > 0 && (
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2 w-20 text-center">HSN</th>
                      <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                      <th className="py-2.5 px-2 w-28 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-2 w-24 text-right">Disc (₹)</th>
                      <th className="py-2.5 px-2 w-24 text-center">GST %</th>
                      <th className="py-2.5 px-3 w-28 text-right font-bold">Total (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            placeholder="Product / service name"
                            className="w-full font-semibold text-slate-800 text-xs border border-transparent hover:border-slate-200 focus:border-primary-500 rounded px-1.5 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={e => updateItem(item.id, 'hsnCode', e.target.value)}
                            className="w-16 font-mono text-xs text-center border border-transparent hover:border-slate-200 focus:border-primary-500 rounded py-1 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-14 text-center font-semibold text-xs border border-slate-200 rounded py-1 focus:outline-none focus:border-primary-500"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-24 text-right font-mono text-xs border border-slate-200 rounded py-1 px-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={e => updateItem(item.id, 'discount', Number(e.target.value))}
                            className="w-20 text-right font-mono text-xs text-emerald-700 border border-slate-200 rounded py-1 px-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <select
                            value={item.gstRate}
                            onChange={e => updateItem(item.id, 'gstRate', Number(e.target.value))}
                            className="text-xs font-semibold bg-white border border-slate-200 rounded py-1 px-1 focus:outline-none focus:border-primary-500"
                          >
                            {GST_RATES.map(r => (
                              <option key={r} value={r}>{r}%</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {fInt(lineTotal(item))}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Line Items Cards (Mobile View 375px) */}
            <div className="sm:hidden space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Product / service name"
                      className="font-bold text-slate-900 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-primary-500 focus:outline-none w-full pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="input-base py-1 px-1.5 text-xs text-center mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Rate ₹</span>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="input-base py-1 px-1.5 text-xs text-right mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Disc ₹</span>
                      <input
                        type="number"
                        min={0}
                        value={item.discount}
                        onChange={e => updateItem(item.id, 'discount', Number(e.target.value))}
                        className="input-base py-1 px-1.5 text-xs text-right mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">GST</span>
                      <select
                        value={item.gstRate}
                        onChange={e => updateItem(item.id, 'gstRate', Number(e.target.value))}
                        className="input-base py-1 px-1 text-xs mt-0.5"
                      >
                        {GST_RATES.map(r => (
                          <option key={r} value={r}>{r}%</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                    <span className="text-slate-400 text-[11px]">HSN: {item.hsnCode}</span>
                    <span className="font-bold text-slate-900">Total: {fc(lineTotal(item))}</span>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No items added to this invoice yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Search catalog or add a custom line item.</p>
              </div>
            )}
          </Section>

          {/* ── Notes & Terms ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <label className="label-text flex items-center gap-1.5 mb-2">
              <StickyNote className="w-4 h-4 text-slate-400" />
              Notes / Terms & Conditions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Thank you for your business! Goods once sold are not returnable."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-base resize-none text-sm"
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN (Pricing Calculations + Payment) ─────────── */}
        <div className="space-y-5">

          {/* Invoice Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sticky top-20">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Invoice Summary & Calculations
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <SummaryRow label="Subtotal (Gross)" value={fc(subtotal)} />
              {totalDisc > 0 && (
                <SummaryRow label="Total Discount" value={`- ${fc(totalDisc)}`} valueClass="text-emerald-600 font-semibold" />
              )}
              <SummaryRow label="Taxable Amount" value={fc(taxable)} />
              <SummaryRow label="CGST (Central Tax)" value={fc(cgst)} muted />
              <SummaryRow label="SGST (State Tax)" value={fc(sgst)} muted />
              <SummaryRow label="Total GST" value={fc(totalGst)} valueClass="text-primary-700 font-semibold" />
              {Math.abs(roundOff) > 0.001 && (
                <SummaryRow label="Round Off" value={`${roundOff > 0 ? '+' : ''}${roundOff.toFixed(2)}`} muted />
              )}
            </div>

            {/* Grand Total Highlight */}
            <div className="py-3 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Grand Total</span>
              <span className="font-mono font-black text-2xl text-primary-700">
                {fc(finalTotal)}
              </span>
            </div>

            {/* ── Payment Section ──────────────────────────────────────── */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Details</p>

              {/* Payment Type Selector */}
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { val: 'full', label: 'Full Paid' },
                  { val: 'partial', label: 'Partial' },
                  { val: 'pending', label: 'Pending' },
                ] as { val: PaymentType; label: string }[]).map(pt => (
                  <button
                    key={pt.val}
                    type="button"
                    onClick={() => setPayType(pt.val)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      payType === pt.val
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* Partial Amount Input */}
              {payType === 'partial' && (
                <div>
                  <label className="label-text">Amount Received (₹)</label>
                  <input
                    type="number"
                    min={0}
                    max={finalTotal}
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter partial amount"
                    className={`input-base text-sm font-mono ${errors.amountPaid ? 'input-error' : ''}`}
                  />
                  {errors.amountPaid && <ErrorMsg msg={errors.amountPaid} />}
                </div>
              )}

              {/* Payment Mode */}
              {payType !== 'pending' && (
                <div>
                  <label className="label-text mb-1.5 block">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { val: 'cash', icon: <Banknote className="w-3.5 h-3.5" />, label: 'Cash' },
                      { val: 'upi', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'UPI QR' },
                      { val: 'card', icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Card' },
                      { val: 'bank_transfer', icon: <Building2 className="w-3.5 h-3.5" />, label: 'Bank' },
                    ] as { val: PaymentMode; icon: React.ReactNode; label: string }[]).map(pm => (
                      <button
                        key={pm.val}
                        type="button"
                        onClick={() => setPayMode(pm.val)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          payMode === pm.val
                            ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {pm.icon}
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reconciliation box */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Amount Paid:</span>
                  <span className="font-mono text-emerald-700">{fc(paidAmount)}</span>
                </div>
                {balanceDue > 0 && (
                  <div className="flex justify-between font-bold">
                    <span className="text-rose-600">Balance Due:</span>
                    <span className="font-mono text-rose-600">{fc(balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="mt-5 space-y-2 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary w-full h-11 shadow-md shadow-primary-600/20"
              >
                {generating ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
                Generate Invoice
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="btn-secondary h-10 text-primary-700 border-primary-200 hover:bg-primary-50"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleDraft}
                  disabled={saving}
                  className="btn-secondary h-10"
                >
                  {saving ? <Spinner /> : <FileText className="w-4 h-4" />}
                  Save Draft
                </button>
              </div>
            </div>
          </div>

          {/* GST Breakup Info Card */}
          {items.length > 0 && (
            <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4 text-xs">
              <p className="font-bold text-primary-900 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary-600" />
                GST Slab Breakdown
              </p>
              <div className="space-y-1.5">
                {Array.from(new Set(items.map(i => i.gstRate))).sort((a, b) => a - b).map(rate => {
                  const rateItems = items.filter(i => i.gstRate === rate);
                  const taxVal = rateItems.reduce((s, i) => s + lineDiscounted(i), 0);
                  const slabGst = rateItems.reduce((s, i) => s + lineGst(i), 0);
                  return (
                    <div key={rate} className="flex justify-between text-primary-800">
                      <span>{rate}% on {fc(taxVal)}</span>
                      <span className="font-mono font-semibold">{fc(slabGst)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (375px) ──────────────────── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="btn-secondary flex-1 h-11 text-xs font-bold"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex-[2] h-11 text-xs font-bold shadow-md"
        >
          {generating ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
          Generate — {fc(finalTotal)}
        </button>
      </div>
      <div className="lg:hidden h-28" />

      {/* ── Tax Invoice Live Preview Modal ───────────────────────────── */}
      <InvoicePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        invoiceData={currentPreviewData}
      />
    </div>
  );
};

// ─── Small Components ─────────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ title, icon, error, children }) => (
  <div className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
    error ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200/80'
  }`}>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
      {error && (
        <span className="ml-auto text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
    {children}
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
  muted?: boolean;
}> = ({ label, value, valueClass, muted }) => (
  <div className="flex justify-between items-center text-xs">
    <span className={muted ? 'text-slate-400 pl-2' : 'text-slate-600'}>{label}</span>
    <span className={`font-mono ${valueClass || 'text-slate-800'}`}>{value}</span>
  </div>
);

const ErrorMsg: React.FC<{ msg: string }> = ({ msg }) => (
  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" />
    {msg}
  </p>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default CreateInvoicePage;

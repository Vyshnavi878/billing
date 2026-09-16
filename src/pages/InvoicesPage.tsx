import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Printer, Download, Ban, Clock, CheckCircle2,
  XCircle, Receipt, Filter, ChevronDown, Calendar, CreditCard,
  User, RotateCcw, ArrowRight, X, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Invoice } from '../types';
import InvoicePreviewModal from '../components/invoice/InvoicePreviewModal';
import RecordPaymentModal from '../components/invoice/RecordPaymentModal';
import type { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const fDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Filter Types
type StatusFilter = 'all' | 'paid' | 'partial' | 'pending' | 'cancelled';
type DateRangePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, recordPayment } = useApp();

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals
  const [previewData, setPreviewData] = useState<TaxInvoiceData | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Unique customers and payment methods for filter dropdowns
  const customerNames = useMemo(() => {
    return Array.from(new Set(invoices.map(i => i.customerName))).sort();
  }, [invoices]);

  const paymentMethods = useMemo(() => {
    const methods = new Set<string>();
    invoices.forEach(i => {
      if (i.paymentMethod) methods.add(i.paymentMethod.toUpperCase());
    });
    return Array.from(methods).sort();
  }, [invoices]);

  // Counts for status tabs
  const counts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      partial: invoices.filter(i => i.status === 'partial').length,
      pending: invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length,
      cancelled: invoices.filter(i => i.status === 'cancelled').length,
    };
  }, [invoices]);

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return invoices.filter(inv => {
      // 1. Search filter
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.includes(q);

      if (!matchSearch) return false;

      // 2. Status filter
      if (statusFilter === 'paid' && inv.status !== 'paid') return false;
      if (statusFilter === 'partial' && inv.status !== 'partial') return false;
      if (statusFilter === 'pending' && inv.status !== 'pending' && inv.status !== 'overdue') return false;
      if (statusFilter === 'cancelled' && inv.status !== 'cancelled') return false;

      // 3. Customer filter
      if (selectedCustomer !== 'all' && inv.customerName !== selectedCustomer) return false;

      // 4. Payment Method filter
      if (selectedPaymentMethod !== 'all' && (inv.paymentMethod || '').toUpperCase() !== selectedPaymentMethod.toUpperCase()) {
        return false;
      }

      // 5. Date range filter
      if (datePreset === 'today' && inv.date !== todayStr) return false;
      if (datePreset === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
        if (inv.date < weekAgo) return false;
      }
      if (datePreset === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
        if (inv.date < monthAgo) return false;
      }
      if (datePreset === 'custom') {
        if (startDate && inv.date < startDate) return false;
        if (endDate && inv.date > endDate) return false;
      }

      return true;
    });
  }, [invoices, search, statusFilter, datePreset, startDate, endDate, selectedCustomer, selectedPaymentMethod]);

  const openPreview = (inv: Invoice) => {
    const data: TaxInvoiceData = {
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.date,
      dueDate: inv.dueDate,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      customerGstin: inv.customerGstin,
      customerAddress: inv.customerAddress,
      items: inv.items.map(item => ({
        productName: item.productName,
        hsnCode: item.hsnCode || '9403',
        unit: item.unit || 'pcs',
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        gstRate: item.gstRate,
        total: item.total,
      })),
      subtotal: inv.subtotal,
      discount: inv.discount,
      gst: inv.gst,
      total: inv.total,
      paid: inv.paid,
      balance: inv.balance,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      notes: inv.notes,
    };
    setPreviewData(data);
  };

  const handlePrint = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    openPreview(inv);
    setTimeout(() => window.print(), 300);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedCustomer('all');
    setSelectedPaymentMethod('all');
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    datePreset !== 'all' ||
    selectedCustomer !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    Boolean(search.trim());

  const getStatusBadge = (inv: Invoice) => {
    switch (inv.status) {
      case 'paid':
        return (
          <span className="badge badge-success inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'partial':
        return (
          <span className="badge badge-warning inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Partially Paid
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-warning inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="badge badge-danger inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <XCircle className="w-3 h-3" /> Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-slate-200 text-slate-800 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return <span className="badge badge-slate text-[11px] font-bold uppercase">{inv.status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-black text-slate-900 tracking-tight">Invoice Management</h1>
          <p className="page-subtitle text-slate-500 mt-0.5">
            Track, filter, record payments, and manage store sales invoices.
          </p>
        </div>
        <button
          id="create-invoice-btn"
          onClick={() => navigate('/billing/create')}
          className="btn-primary shadow-md shadow-primary-600/25 px-5"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* ── Primary Status Filter Tabs ────────────────────────────────── */}
      <div className="flex items-center bg-slate-100/90 rounded-2xl p-1.5 gap-1.5 overflow-x-auto scrollbar-none w-fit max-w-full">
        {([
          { key: 'all', label: 'All Invoices' },
          { key: 'paid', label: 'Paid' },
          { key: 'partial', label: 'Partially Paid' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancelled', label: 'Cancelled' },
        ] as { key: StatusFilter; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              statusFilter === tab.key
                ? 'bg-primary-50 text-primary-700'
                : 'bg-slate-200/70 text-slate-600'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice number, customer name, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-10 text-xs sm:text-sm py-2.5"
            />
          </div>

          {/* Quick Date Range Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={datePreset}
                onChange={e => setDatePreset(e.target.value as DateRangePreset)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`btn-secondary gap-1.5 text-xs py-2 px-3 ${showAdvancedFilters ? 'border-primary-400 bg-primary-50/50 text-primary-700' : ''}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Details</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn-ghost text-xs text-rose-600 hover:text-rose-700 gap-1 py-1.5 px-2.5"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Advanced Filters Drawer (Date Range, Customer, Payment Method) ── */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
            {/* Customer Filter */}
            <div>
              <label className="label-text mb-1 block">Filter by Customer</label>
              <select
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className="input-base text-xs py-2"
              >
                <option value="all">All Customers ({customerNames.length})</option>
                {customerNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="label-text mb-1 block">Filter by Payment Method</label>
              <select
                value={selectedPaymentMethod}
                onChange={e => setSelectedPaymentMethod(e.target.value)}
                className="input-base text-xs py-2"
              >
                <option value="all">All Payment Methods</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Custom Date Pickers */}
            {datePreset === 'custom' ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="label-text mb-1 block">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="input-base text-xs py-1.5"
                  />
                </div>
                <div className="flex-1">
                  <label className="label-text mb-1 block">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="input-base text-xs py-1.5"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-end text-slate-400 pb-2">
                <span>Showing {filteredInvoices.length} of {invoices.length} total store invoices</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop Invoices Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="table-base text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="text-center">Items</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Payment Method</th>
                <th>Payment Status</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'paid' || inv.balance === 0;
                const isCancelled = inv.status === 'cancelled';
                const itemsCount = inv.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Invoice Number */}
                    <td>
                      <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                        {inv.invoiceNumber}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <p className="text-slate-700 font-medium">{fDate(inv.date)}</p>
                      <p className="text-[11px] text-slate-400">Due {fDate(inv.dueDate)}</p>
                    </td>

                    {/* Customer */}
                    <td>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{inv.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{inv.customerPhone}</p>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="text-center">
                      <span
                        className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700"
                        title={inv.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      >
                        {inv.items.length} item{inv.items.length > 1 ? 's' : ''} ({itemsCount} qty)
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="text-right">
                      <p className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(inv.total)}</p>
                      {inv.balance > 0 && !isCancelled ? (
                        <p className="font-mono text-[11px] font-semibold text-rose-600">
                          Due: {formatCurrency(inv.balance)}
                        </p>
                      ) : isCancelled ? (
                        <p className="text-[10px] text-slate-400 line-through">Voided</p>
                      ) : (
                        <p className="text-[10px] text-emerald-600 font-semibold">Fully settled</p>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="text-center">
                      <span className="font-semibold text-slate-700 uppercase tracking-wide text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {inv.paymentMethod || 'CASH'}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td>
                      {getStatusBadge(inv)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-1 pr-2">
                        {/* Record Payment shortcut if pending */}
                        {!isCancelled && inv.balance > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentInvoice(inv);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Quick preview */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(inv);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Tax Invoice Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Quick print */}
                        <button
                          type="button"
                          onClick={(e) => handlePrint(inv, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {/* View details */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${inv.id}`);
                          }}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors ml-1 font-semibold text-xs flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-400 max-w-sm mx-auto">
                      <Receipt className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-semibold text-slate-600">No invoices found</p>
                      <p className="text-xs text-slate-400 text-center">
                        No records matched your search or active filter settings.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="btn-secondary text-xs px-4 py-2 mt-2 gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Invoices Cards (375x667 Viewport) ────────────────── */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredInvoices.map((inv) => {
            const isCancelled = inv.status === 'cancelled';
            return (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="p-4 active:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
              >
                {/* Header: Number & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                    {inv.invoiceNumber}
                  </span>
                  {getStatusBadge(inv)}
                </div>

                {/* Customer & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{inv.customerName}</p>
                    <p className="text-xs text-slate-400 font-mono">{inv.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-slate-900 text-base">{formatCurrency(inv.total)}</p>
                    {inv.balance > 0 && !isCancelled ? (
                      <p className="font-mono text-[11px] font-bold text-rose-600">Due: {formatCurrency(inv.balance)}</p>
                    ) : isCancelled ? (
                      <p className="text-[10px] text-slate-400 line-through">Voided</p>
                    ) : (
                      <p className="text-[11px] font-semibold text-emerald-600">Paid in full</p>
                    )}
                  </div>
                </div>

                {/* Items & Payment Mode */}
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <span>{inv.items.length} item{inv.items.length > 1 ? 's' : ''}</span>
                  <span>Method: <strong className="uppercase font-semibold">{inv.paymentMethod || 'Cash'}</strong></span>
                  <span>{fDate(inv.date)}</span>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(inv);
                    }}
                    className="text-slate-600 hover:text-primary-600 font-medium flex items-center gap-1 py-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <div className="flex items-center gap-2">
                    {!isCancelled && inv.balance > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentInvoice(inv);
                        }}
                        className="text-emerald-700 font-semibold flex items-center gap-1 py-1 px-2 bg-emerald-50 rounded"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay
                      </button>
                    )}
                    <span className="text-primary-600 font-bold flex items-center gap-0.5">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No matching invoices</p>
              <button
                onClick={resetFilters}
                className="btn-secondary text-xs px-3 py-1.5 mt-2"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tax Invoice Live Preview Modal ───────────────────────────── */}
      <InvoicePreviewModal
        isOpen={Boolean(previewData)}
        onClose={() => setPreviewData(null)}
        invoiceData={previewData}
      />

      {/* ── Quick Record Payment Modal ───────────────────────────────── */}
      <RecordPaymentModal
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onRecordPayment={(payment) => {
          if (paymentInvoice) {
            recordPayment(paymentInvoice.id, payment);
            showToast(`Recorded payment of ${formatCurrency(payment.amount)} on ${paymentInvoice.invoiceNumber}`);
          }
        }}
      />
    </div>
  );
};

export default InvoicesPage;

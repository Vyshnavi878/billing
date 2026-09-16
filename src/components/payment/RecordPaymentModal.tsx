import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, Receipt, FileText, ArrowRight } from 'lucide-react';
import type { Customer, Invoice, Payment } from '../../types';
import { useApp } from '../../context/AppContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
  initialCustomerId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialInvoiceId,
  initialCustomerId,
}) => {
  const { invoices, customers, addPayment } = useApp();

  // Get active unpaid invoices (balance > 0 and not cancelled)
  const pendingInvoices = invoices.filter(i => i.status !== 'cancelled' && i.balance > 0);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<Payment['method']>('upi');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setIsSubmitting(false);
    setDate(new Date().toISOString().slice(0, 10));
    setReference('');
    setNotes('');

    if (initialInvoiceId) {
      const inv = invoices.find(i => i.id === initialInvoiceId);
      if (inv) {
        setSelectedInvoiceId(inv.id);
        setSelectedCustomerId(inv.customerId || '');
        setAmount(inv.balance);
        setPaymentType('full');
        return;
      }
    }

    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
      const custInvs = pendingInvoices.filter(i => i.customerId === initialCustomerId);
      if (custInvs.length > 0) {
        setSelectedInvoiceId(custInvs[0].id);
        setAmount(custInvs[0].balance);
      } else {
        setSelectedInvoiceId('');
        setAmount('');
      }
      setPaymentType('full');
      return;
    }

    // Default to first pending invoice if available
    if (pendingInvoices.length > 0) {
      const first = pendingInvoices[0];
      setSelectedInvoiceId(first.id);
      setSelectedCustomerId(first.customerId || '');
      setAmount(first.balance);
      setPaymentType('full');
    } else {
      setSelectedInvoiceId('');
      setSelectedCustomerId('');
      setAmount('');
    }
  }, [isOpen, initialInvoiceId, initialCustomerId]);

  // When customer selection changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const custInvs = pendingInvoices.filter(i => i.customerId === custId);
    if (custInvs.length > 0) {
      setSelectedInvoiceId(custInvs[0].id);
      setAmount(custInvs[0].balance);
      setPaymentType('full');
    } else {
      setSelectedInvoiceId('');
      setAmount('');
    }
  };

  // When invoice selection changes
  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      if (inv.customerId && inv.customerId !== selectedCustomerId) {
        setSelectedCustomerId(inv.customerId);
      }
      if (paymentType === 'full') {
        setAmount(inv.balance);
      } else if (typeof amount === 'number' && amount > inv.balance) {
        setAmount(inv.balance);
      }
    }
  };

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
  const activeBalance = selectedInvoice ? selectedInvoice.balance : 0;

  // Sync amount when switching payment type
  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setPaymentType(type);
    if (type === 'full' && selectedInvoice) {
      setAmount(selectedInvoice.balance);
    }
  };

  if (!isOpen) return null;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const numAmount = Number(amount) || 0;
  const remainingAfterPayment = Math.max(0, activeBalance - numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setError('Please select an invoice to apply this payment to.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a payment amount greater than ₹0.');
      return;
    }
    if (numAmount > activeBalance) {
      setError(`Amount cannot exceed the pending invoice balance of ${formatCurr(activeBalance)}.`);
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 300));

    addPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId || selectedCustomerId,
      customerName: selectedInvoice.customerName,
      amount: numAmount,
      method,
      date,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'completed',
    });

    setIsSubmitting(false);
    onClose();
  };

  // Eligible invoices for the dropdown
  const customerInvoices = selectedCustomerId
    ? pendingInvoices.filter(i => i.customerId === selectedCustomerId)
    : pendingInvoices;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">Record Payment</h3>
              <p className="text-xs text-slate-300">Accept customer dues & update invoice ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Invoices Notice if none */}
        {pendingInvoices.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800">All Invoices Cleared</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              There are no pending or partially paid invoices in the store. All customer accounts are up to date.
            </p>
            <button onClick={onClose} className="btn-secondary text-xs px-5 py-2">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer & Invoice Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleCustomerChange(e.target.value)}
                  className="input-base text-xs"
                >
                  <option value="">-- All Customers with Dues --</option>
                  {customers
                    .filter(c => pendingInvoices.some(i => i.customerId === c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => handleInvoiceChange(e.target.value)}
                  className="input-base text-xs font-mono font-medium"
                  required
                >
                  <option value="">-- Select Pending Invoice --</option>
                  {customerInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - Due: {formatCurr(inv.balance)} ({inv.customerName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Invoice Due Summary Card */}
            {selectedInvoice && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Customer: <strong className="text-slate-800">{selectedInvoice.customerName}</strong></span>
                  <span className="font-mono text-primary-700 font-semibold">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Bill</span>
                    <span className="font-bold text-slate-700">{formatCurr(selectedInvoice.total)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Already Paid</span>
                    <span className="font-bold text-emerald-600">{formatCurr(selectedInvoice.paid)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current Balance</span>
                    <span className="font-bold font-mono text-rose-600">{formatCurr(selectedInvoice.balance)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Type Toggle: Full vs Partial */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentTypeChange('full')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    paymentType === 'full'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Full Settlement ({formatCurr(activeBalance)})
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentTypeChange('partial')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    paymentType === 'partial'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-400'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Partial Payment
                </button>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={activeBalance}
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={paymentType === 'full'}
                    className="input-base pl-8 font-mono font-bold text-sm"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                {paymentType === 'partial' && selectedInvoice && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pending after this: <span className="font-semibold text-amber-600">{formatCurr(remainingAfterPayment)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="input-base text-xs"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
                  { id: 'card', label: 'Card Swipe', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'other', label: 'Other', icon: <Building2 className="w-4 h-4" /> },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all ${
                      method === m.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm ring-1 ring-indigo-500 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Number & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ref / UTR / Cheque No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-928374 or CHQ-0012"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="input-base text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received via PhonePe"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-base text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-ghost text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedInvoice || numAmount <= 0}
                className="btn-primary text-xs px-6 py-2 gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {isSubmitting ? 'Recording...' : `Confirm ₹${numAmount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

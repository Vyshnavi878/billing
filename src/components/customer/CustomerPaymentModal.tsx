import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Building2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import type { Customer, Invoice } from '../../types';
import { useApp } from '../../context/AppContext';

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  customerInvoices: Invoice[];
}

export const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  customer,
  customerInvoices,
}) => {
  const { recordPayment, showToast } = useApp();

  const pendingInvoices = customerInvoices.filter(i => (i.status === 'pending' || i.status === 'partial') && i.balance > 0);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [payType, setPayType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'>('upi');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedInvoice = pendingInvoices.find(i => i.id === selectedInvoiceId) || pendingInvoices[0];

  useEffect(() => {
    if (pendingInvoices.length > 0) {
      const inv = pendingInvoices[0];
      setSelectedInvoiceId(inv.id);
      setAmount(inv.balance);
    } else {
      setSelectedInvoiceId('');
      setAmount('');
    }
    setError('');
    setReference('');
    setNotes('');
    setPayType('full');
  }, [customer, isOpen]);

  useEffect(() => {
    if (selectedInvoice) {
      if (payType === 'full') {
        setAmount(selectedInvoice.balance);
      }
    }
  }, [selectedInvoiceId, payType]);

  if (!isOpen || !customer) return null;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setError('No pending invoice found to credit payment to.');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (numAmount > selectedInvoice.balance) {
      setError(`Payment cannot exceed invoice balance of ${formatCurr(selectedInvoice.balance)}.`);
      return;
    }

    recordPayment(selectedInvoice.id, {
      amount: numAmount,
      method,
      date,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    showToast(`Received ${formatCurr(numAmount)} for ${selectedInvoice.invoiceNumber}`);
    onClose();
  };

  const totalCustomerBalance = pendingInvoices.reduce((sum, i) => sum + i.balance, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Record Customer Payment
              </h2>
              <p className="text-xs text-slate-400 font-medium">{customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Balance Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-primary-950 p-4 text-white flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Outstanding Dues</p>
            <p className="text-2xl font-black font-mono mt-0.5 text-red-400">{formatCurr(totalCustomerBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Pending Invoices</p>
            <p className="text-lg font-bold mt-0.5">{pendingInvoices.length} bills</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {pendingInvoices.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-900 text-sm">All Invoices Paid Clear!</p>
                <p className="text-xs text-slate-400">This customer has zero outstanding balance.</p>
              </div>
            ) : (
              <>
                {/* Target Invoice Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Credit to Invoice *
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={e => {
                      setSelectedInvoiceId(e.target.value);
                      const inv = pendingInvoices.find(i => i.id === e.target.value);
                      if (inv && payType === 'full') setAmount(inv.balance);
                    }}
                    className="input-base text-xs font-mono font-medium"
                  >
                    {pendingInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — Balance: {formatCurr(inv.balance)} (Total: {formatCurr(inv.total)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full vs Partial Toggle */}
                <div>
                  <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPayType('full');
                        if (selectedInvoice) setAmount(selectedInvoice.balance);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        payType === 'full' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Full Payment ({selectedInvoice ? formatCurr(selectedInvoice.balance) : '₹0'})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayType('partial')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        payType === 'partial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Partial Amount
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max={selectedInvoice ? selectedInvoice.balance : undefined}
                    disabled={payType === 'full'}
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`input-base font-mono text-base font-bold ${payType === 'full' ? 'bg-slate-50 text-slate-700' : ''}`}
                    placeholder="Enter collected amount"
                  />
                  {selectedInvoice && (
                    <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>Max balance: <strong>{formatCurr(selectedInvoice.balance)}</strong></span>
                      {Number(amount) > 0 && (
                        <span>Remaining: <strong className="text-emerald-600">{formatCurr(Math.max(0, selectedInvoice.balance - Number(amount)))}</strong></span>
                      )}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { id: 'cash', label: 'Cash', icon: Banknote },
                      { id: 'card', label: 'Card Swipe', icon: CreditCard },
                      { id: 'bank_transfer', label: 'NEFT / RTGS', icon: Building2 },
                      { id: 'cheque', label: 'Cheque', icon: FileText },
                    ].map(m => {
                      const Icon = m.icon;
                      const isSel = method === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                            isSel
                              ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Receipt Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="input-base text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      UTR / Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/28392182"
                      value={reference}
                      onChange={e => setReference(e.target.value)}
                      className="input-base text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional collection remarks"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Cancel
            </button>
            {pendingInvoices.length > 0 && (
              <button
                type="submit"
                className="btn-primary py-2.5 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Record Payment
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

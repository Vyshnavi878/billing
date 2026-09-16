import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Building2, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';
import type { Invoice } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRecordPayment: (payment: {
    amount: number;
    method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
    date: string;
    reference?: string;
    notes?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'>('upi');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset or set default amount when opened
  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.balance > 0 ? invoice.balance : invoice.total);
      setError('');
      setReference('');
      setNotes('');
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0');
      return;
    }
    if (numAmount > invoice.balance && invoice.balance > 0) {
      setError(`Payment amount cannot exceed remaining balance of ${formatCurr(invoice.balance)}`);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onRecordPayment({
      amount: numAmount,
      method,
      date,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Record Payment</h3>
              <p className="text-xs text-slate-400 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Mini Summary */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Customer</span>
            <span className="font-bold text-slate-900 text-sm">{invoice.customerName}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Remaining Due</span>
            <span className="font-mono font-black text-rose-600 text-sm">{formatCurr(invoice.balance)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="label-text flex items-center justify-between">
              <span>Amount Received (₹) *</span>
              <button
                type="button"
                onClick={() => { setAmount(invoice.balance); setError(''); }}
                className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold"
              >
                Pay Full Due ({formatCurr(invoice.balance)})
              </button>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min={1}
                max={invoice.balance > 0 ? invoice.balance : undefined}
                value={amount}
                onChange={e => {
                  setAmount(e.target.value === '' ? '' : Number(e.target.value));
                  setError('');
                }}
                className="input-base pl-8 text-base font-bold font-mono"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="label-text mb-1.5 block">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { val: 'upi', label: 'UPI / QR', icon: <Smartphone className="w-3.5 h-3.5" /> },
                { val: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
                { val: 'card', label: 'Card Swipe', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { val: 'bank_transfer', label: 'NEFT / RTGS', icon: <Building2 className="w-3.5 h-3.5" /> },
              ] as const).map(pm => (
                <button
                  key={pm.val}
                  type="button"
                  onClick={() => setMethod(pm.val)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    method === pm.val
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

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-base text-xs py-2"
                required
              />
            </div>
            <div>
              <label className="label-text">Transaction / Ref No. (Optional)</label>
              <input
                type="text"
                placeholder="e.g. UPI/28391024 or Cheque #"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="input-base text-xs py-2 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label-text">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Received partial advance, balance next week"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-base text-xs py-2"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-5 text-xs shadow-md shadow-primary-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;

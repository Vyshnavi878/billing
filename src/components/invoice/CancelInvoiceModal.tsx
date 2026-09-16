import React, { useState } from 'react';
import { X, AlertTriangle, Ban } from 'lucide-react';
import type { Invoice } from '../../types';

interface CancelInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onConfirmCancel: (reason: string) => void;
}

const REASONS = [
  'Customer requested cancellation',
  'Duplicate invoice / entered in error',
  'Incorrect billing or customer details',
  'Product out of stock / unable to fulfill order',
  'Customer changed mind before dispatch',
  'Other operational reason',
];

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const fullReason = customDetails.trim()
      ? `${selectedReason}: ${customDetails.trim()}`
      : selectedReason;
    onConfirmCancel(fullReason);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Cancel Invoice</h3>
              <p className="text-xs text-rose-700 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              Are you sure you want to cancel this invoice?
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Cancelling will set the invoice status to <strong>Cancelled</strong> and zero out active payment obligations. This action is permanently logged.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Amount:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurr(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Already Paid:</span>
              <span className="font-mono font-semibold text-emerald-700">{formatCurr(invoice.paid)}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="label-text">Reason for Cancellation *</label>
            <select
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
              className="input-base text-xs py-2 mt-1"
            >
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Additional details */}
          <div>
            <label className="label-text">Additional Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Customer called to change items, will create a fresh bill..."
              value={customDetails}
              onChange={e => setCustomDetails(e.target.value)}
              className="input-base text-xs py-2 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-xs"
              disabled={loading}
            >
              Keep Invoice
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelInvoiceModal;

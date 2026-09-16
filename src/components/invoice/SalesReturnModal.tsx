import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { Invoice, SalesReturnItem } from '../../types';

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onCreateSalesReturn: (data: {
    items: SalesReturnItem[];
    refundMethod: 'cash' | 'upi' | 'store_credit' | 'bank_transfer';
    reason: string;
  }) => any;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onCreateSalesReturn,
}) => {
  const [returnItems, setReturnItems] = useState<Record<string, { qty: number; reason: string }>>({});
  const [refundMethod, setRefundMethod] = useState<'store_credit' | 'cash' | 'upi' | 'bank_transfer'>('store_credit');
  const [generalReason, setGeneralReason] = useState('Customer returned surplus goods');
  const [createdNote, setCreatedNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset when invoice changes
  React.useEffect(() => {
    if (invoice) {
      const initial: Record<string, { qty: number; reason: string }> = {};
      invoice.items.forEach(i => {
        initial[i.productId] = { qty: 0, reason: 'Defective item' };
      });
      setReturnItems(initial);
      setCreatedNote(null);
      setError('');
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const calculateItemRefund = (item: typeof invoice.items[0], returnQty: number) => {
    if (!returnQty || returnQty <= 0) return 0;
    const unitPrice = item.price;
    const gstRate = item.gstRate;
    const subtotal = returnQty * unitPrice;
    const gst = (subtotal * gstRate) / 100;
    return Math.round(subtotal + gst);
  };

  const totalRefundAmount = invoice.items.reduce((total, item) => {
    const returnQty = returnItems[item.productId]?.qty || 0;
    return total + calculateItemRefund(item, returnQty);
  }, 0);

  const handleQtyChange = (productId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(0, Math.min(maxQty, qty));
    setReturnItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        qty: validQty,
      },
    }));
    setError('');
  };

  const handleReasonChange = (productId: string, reason: string) => {
    setReturnItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reason,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItems: SalesReturnItem[] = [];

    invoice.items.forEach(item => {
      const entry = returnItems[item.productId];
      if (entry && entry.qty > 0) {
        selectedItems.push({
          productId: item.productId,
          productName: item.productName,
          quantity: entry.qty,
          unit: item.unit,
          price: item.price,
          gstRate: item.gstRate,
          refundAmount: calculateItemRefund(item, entry.qty),
          reason: entry.reason || generalReason,
        });
      }
    });

    if (selectedItems.length === 0) {
      setError('Please select at least one item and quantity to return.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const result = onCreateSalesReturn({
      items: selectedItems,
      refundMethod,
      reason: generalReason,
    });

    setCreatedNote(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Create Sales Return (Credit Note)</h3>
              <p className="text-xs text-slate-400 font-mono">Invoice: {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen after Creating Note */}
        {createdNote ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">Credit Note Generated!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Sales return has been recorded and credit note created for customer.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Note No:</span>
                <span className="font-mono font-bold text-primary-700">{createdNote.creditNoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">{createdNote.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Amount:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{formatCurr(createdNote.totalRefund)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Method:</span>
                <span className="capitalize font-semibold text-slate-800">{createdNote.refundMethod.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary px-6 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form to select return items */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span>Customer: <strong className="text-slate-900">{invoice.customerName}</strong></span>
              <span>Invoice Total: <strong className="font-mono text-slate-900">{formatCurr(invoice.total)}</strong></span>
            </div>

            {/* Itemized Table */}
            <div>
              <label className="label-text mb-1.5 block">Select Items & Return Quantity</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-2 text-center w-20">Bought</th>
                      <th className="py-2 px-2 text-center w-24">Return Qty</th>
                      <th className="py-2 px-3 text-right w-24">Refund ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => {
                      const cur = returnItems[item.productId] || { qty: 0, reason: '' };
                      const refund = calculateItemRefund(item, cur.qty);
                      return (
                        <tr key={item.productId} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                            <p className="text-[11px] text-slate-400">{formatCurr(item.price)} each · GST {item.gstRate}%</p>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={item.quantity}
                              value={cur.qty}
                              onChange={e => handleQtyChange(item.productId, Number(e.target.value), item.quantity)}
                              className="w-16 text-center font-bold text-xs input-base py-1 px-1"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {refund > 0 ? formatCurr(refund) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Options & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-text">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as any)}
                  className="input-base text-xs py-2 mt-1"
                >
                  <option value="store_credit">Store Credit / Wallet</option>
                  <option value="cash">Cash Refund</option>
                  <option value="upi">UPI Refund</option>
                  <option value="bank_transfer">Bank Transfer (NEFT)</option>
                </select>
              </div>

              <div>
                <label className="label-text">Return Reason</label>
                <input
                  type="text"
                  value={generalReason}
                  onChange={e => setGeneralReason(e.target.value)}
                  placeholder="e.g. Defective or customer change of mind"
                  className="input-base text-xs py-2 mt-1"
                />
              </div>
            </div>

            {/* Refund Total Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Refund (incl. GST)
                </span>
                <span className="text-xs text-emerald-600">Credit note will be issued for this amount</span>
              </div>
              <span className="font-mono font-black text-xl text-emerald-800">
                {formatCurr(totalRefundAmount)}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2 px-4 text-xs"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || totalRefundAmount <= 0}
                className="btn-primary py-2 px-5 text-xs shadow-md shadow-primary-600/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Generate Credit Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SalesReturnModal;

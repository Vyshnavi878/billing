import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import type { Product } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjust: (productId: string, adjustment: {
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string;
  }) => void;
}

const INCREASE_REASONS = [
  'Supplier Purchase / Restock received',
  'Customer Return / Re-shelved',
  'Physical Count Surplus / Found inventory',
  'Opening inventory adjustment',
  'Other Stock Addition',
];

const DECREASE_REASONS = [
  'Damaged / Broken in store',
  'Expired / Unusable Goods',
  'Shop Display / Internal Store Use',
  'Inventory Shrinkage / Missing during audit',
  'Supplier Return (Defective Batch)',
  'Other Stock Deduction',
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onAdjust,
}) => {
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState(INCREASE_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (product) {
      setQuantity('');
      setType('increase');
      setReason(INCREASE_REASONS[0]);
      setNotes('');
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentStock = product.stock;
  const numQty = Number(quantity) || 0;
  const resultingStock = type === 'increase'
    ? currentStock + numQty
    : Math.max(0, currentStock - numQty);

  const resultingStatus = resultingStock === 0
    ? 'out_of_stock'
    : resultingStock <= product.minStock
    ? 'low_stock'
    : 'in_stock';

  const handleTypeChange = (newType: 'increase' | 'decrease') => {
    setType(newType);
    setReason(newType === 'increase' ? INCREASE_REASONS[0] : DECREASE_REASONS[0]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numQty || numQty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    if (type === 'decrease' && numQty > currentStock) {
      setError(`Cannot decrease stock by ${numQty}. Current available stock is only ${currentStock} ${product.unit}.`);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    onAdjust(product.id, {
      type,
      quantity: numQty,
      reason,
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Stock Adjustment</h3>
              <p className="text-xs text-slate-400">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Product</span>
            <span className="font-bold text-slate-900">{product.name}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Current On-Hand Stock</span>
            <span className="font-mono font-black text-slate-900 text-sm">{currentStock} {product.unit}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Adjustment Direction Toggle */}
          <div>
            <label className="label-text mb-1.5 block">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('increase')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  type === 'increase'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-100 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Increase Stock (+)
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('decrease')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  type === 'decrease'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-100 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                Decrease Stock (-)
              </button>
            </div>
          </div>

          {/* Quantity Input & Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="label-text">Adjustment Quantity ({product.unit}) *</label>
              <input
                type="number"
                min={1}
                max={type === 'decrease' ? currentStock : undefined}
                value={quantity}
                onChange={e => {
                  setQuantity(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)));
                  setError('');
                }}
                placeholder="Enter quantity"
                className="input-base text-base font-bold font-mono"
                required
                autoFocus
              />
            </div>

            {/* Live resulting stock box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Resulting Stock:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {resultingStock} {product.unit}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className={`badge text-[10px] font-bold uppercase ${
                  resultingStatus === 'in_stock'
                    ? 'badge-success'
                    : resultingStatus === 'low_stock'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}>
                  {resultingStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="label-text">Adjustment Reason *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-base text-xs sm:text-sm py-2 mt-1"
            >
              {(type === 'increase' ? INCREASE_REASONS : DECREASE_REASONS).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="label-text">Notes / Reference (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. PO #4521 or verified by Rajesh during weekly check"
              className="input-base text-xs sm:text-sm py-2"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-xs font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || numQty <= 0}
              className="btn-primary py-2 px-5 text-xs font-bold shadow-md shadow-primary-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;

import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle2, AlertCircle, Sparkles, Percent, IndianRupee } from 'lucide-react';
import type { Product } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id'>, id?: string) => void;
  existingCategories: string[];
}

const UNITS = ['pcs', 'kg', 'meter', 'ream', 'box', 'set', 'packet', 'liter', 'roll'];
const GST_RATES = [0, 5, 12, 18, 28];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [hsnCode, setHsnCode] = useState('9403');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(productToEdit);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setCostPrice(productToEdit.costPrice);
      setPrice(productToEdit.price);
      setGstRate(productToEdit.gstRate);
      setHsnCode(productToEdit.hsnCode);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setDescription(productToEdit.description || '');
      setErrors({});
    } else {
      // Defaults for Add
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory(existingCategories[0] || 'Furniture');
      setCustomCategory('');
      setUnit('pcs');
      setCostPrice('');
      setPrice('');
      setGstRate(18);
      setHsnCode('9403');
      setStock(10);
      setMinStock(5);
      setDescription('');
      setErrors({});
    }
  }, [productToEdit, isOpen, existingCategories]);

  if (!isOpen) return null;

  // Live margin calculations
  const numSelling = Number(price) || 0;
  const numCost = Number(costPrice) || 0;
  const marginAmt = Math.max(0, numSelling - numCost);
  const marginPct = numSelling > 0 ? ((marginAmt / numSelling) * 100).toFixed(1) : '0';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    if (price === '' || Number(price) < 0) errs.price = 'Valid selling price is required';
    if (costPrice === '' || Number(costPrice) < 0) errs.costPrice = 'Valid purchase price is required';
    if (Number(costPrice) > Number(price) && Number(price) > 0) {
      errs.costPrice = 'Cost price is higher than selling price';
    }
    if (stock === '' || Number(stock) < 0) errs.stock = 'Valid stock is required';
    if (minStock === '' || Number(minStock) < 0) errs.minStock = 'Valid minimum stock is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const finalCategory = category === '__custom__' ? customCategory.trim() || 'General' : category;
    const numStock = Number(stock) || 0;
    const numMinStock = Number(minStock) || 5;
    const status: Product['status'] = numStock === 0 ? 'out_of_stock' : numStock <= numMinStock ? 'low_stock' : 'in_stock';

    onSave(
      {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: finalCategory,
        unit,
        costPrice: Number(costPrice) || 0,
        price: Number(price) || 0,
        gstRate: Number(gstRate) || 18,
        hsnCode: hsnCode.trim() || '9403',
        stock: numStock,
        minStock: numMinStock,
        status,
        description: description.trim() || undefined,
        openingStock: isEdit ? productToEdit?.openingStock : numStock,
      },
      productToEdit?.id
    );

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scale-in my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit ? `Updating ${productToEdit?.name}` : 'Create a new inventory item for your store'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="label-text">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder="e.g. Ergonomic Pro Chair"
                className={`input-base text-xs sm:text-sm ${errors.name ? 'input-error' : ''}`}
                required
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-text">SKU / Product Code *</label>
              <input
                type="text"
                value={sku}
                onChange={e => { setSku(e.target.value.toUpperCase()); setErrors(prev => ({ ...prev, sku: '' })); }}
                placeholder="e.g. FURN-001"
                className={`input-base font-mono text-xs sm:text-sm uppercase ${errors.sku ? 'input-error' : ''}`}
                required
              />
              {errors.sku && <p className="text-[11px] text-red-500 mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label-text">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input-base text-xs sm:text-sm"
              >
                {existingCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ Add Custom Category</option>
              </select>
            </div>

            {category === '__custom__' && (
              <div>
                <label className="label-text">Custom Category Name</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="e.g. Hardware"
                  className="input-base text-xs sm:text-sm"
                />
              </div>
            )}

            <div>
              <label className="label-text">Measurement Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="input-base text-xs sm:text-sm capitalize"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">HSN / SAC Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={e => setHsnCode(e.target.value)}
                placeholder="e.g. 9401"
                className="input-base text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          {/* Pricing & GST */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pricing & Taxation</span>
              {numSelling > 0 && numCost > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Profit Margin: ₹{marginAmt.toLocaleString('en-IN')} ({marginPct}%)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-text">Purchase Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={e => {
                      setCostPrice(e.target.value === '' ? '' : Number(e.target.value));
                      setErrors(prev => ({ ...prev, costPrice: '' }));
                    }}
                    placeholder="0"
                    className={`input-base pl-7 text-xs sm:text-sm font-mono ${errors.costPrice ? 'input-error' : ''}`}
                    required
                  />
                </div>
                {errors.costPrice && <p className="text-[11px] text-red-500 mt-1">{errors.costPrice}</p>}
              </div>

              <div>
                <label className="label-text">Selling Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={e => {
                      setPrice(e.target.value === '' ? '' : Number(e.target.value));
                      setErrors(prev => ({ ...prev, price: '' }));
                    }}
                    placeholder="0"
                    className={`input-base pl-7 text-xs sm:text-sm font-mono font-bold ${errors.price ? 'input-error' : ''}`}
                    required
                  />
                </div>
                {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="label-text">GST Rate (%)</label>
                <select
                  value={gstRate}
                  onChange={e => setGstRate(Number(e.target.value))}
                  className="input-base text-xs sm:text-sm font-semibold"
                >
                  {GST_RATES.map(r => (
                    <option key={r} value={r}>{r}% GST</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">{isEdit ? 'Current Stock Level' : 'Opening Stock'} *</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={e => {
                  setStock(e.target.value === '' ? '' : Number(e.target.value));
                  setErrors(prev => ({ ...prev, stock: '' }));
                }}
                placeholder="0"
                className={`input-base text-xs sm:text-sm font-bold font-mono ${errors.stock ? 'input-error' : ''}`}
                required
              />
              {errors.stock && <p className="text-[11px] text-red-500 mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="label-text">Minimum Stock Level (Alert Threshold) *</label>
              <input
                type="number"
                min={0}
                value={minStock}
                onChange={e => {
                  setMinStock(e.target.value === '' ? '' : Number(e.target.value));
                  setErrors(prev => ({ ...prev, minStock: '' }));
                }}
                placeholder="5"
                className={`input-base text-xs sm:text-sm font-mono ${errors.minStock ? 'input-error' : ''}`}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Alerts when stock drops to or below this quantity</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Product Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed specs, model, warranty or store location notes..."
              className="input-base text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md shadow-primary-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;

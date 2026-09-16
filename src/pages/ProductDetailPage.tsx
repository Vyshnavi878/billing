import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Edit2, Trash2, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle,
  FileText, IndianRupee, Layers, ChevronRight, Plus, Eye, Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductFormModal from '../components/inventory/ProductFormModal';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import type { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, invoices, stockMovements, updateProduct, deleteProduct, adjustStock } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const product = products.find(p => p.id === id || p.sku === id);

  // Invoices containing this product
  const relevantInvoices = useMemo(() => {
    if (!product) return [];
    const list: Array<{
      invoiceId: string;
      invoiceNumber: string;
      date: string;
      customerName: string;
      quantity: number;
      price: number;
      total: number;
      status: string;
    }> = [];

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.productId === product.id || item.productName === product.name) {
          list.push({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            date: inv.date,
            customerName: inv.customerName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            status: inv.status,
          });
        }
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, product]);

  // Total sales quantity
  const totalSalesQty = useMemo(() => {
    return relevantInvoices.reduce((sum, inv) => sum + inv.quantity, 0);
  }, [relevantInvoices]);

  // Total revenue generated
  const totalSalesRevenue = useMemo(() => {
    return relevantInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [relevantInvoices]);

  // Movements for this product
  const productMovements = useMemo(() => {
    if (!product) return [];
    return stockMovements
      .filter(m => m.productId === product.id || m.productName === product.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stockMovements, product]);

  if (!product) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested product does not exist.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="btn-primary mt-4 mx-auto text-xs px-5 py-2.5"
        >
          Return to Inventory
        </button>
      </div>
    );
  }

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const fDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Stock health status
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= product.minStock && product.stock > 0;

  const stockPercent = Math.min(100, Math.round((product.stock / Math.max(product.minStock * 2, 10)) * 100));

  const marginAmt = product.price - product.costPrice;
  const marginPct = product.price > 0 ? ((marginAmt / product.price) * 100).toFixed(1) : '0';

  const costValuation = product.stock * product.costPrice;
  const retailValuation = product.stock * product.price;

  const existingCategories = Array.from(new Set(products.map(p => p.category))).sort();

  const handleDelete = () => {
    deleteProduct(product.id);
    navigate('/inventory');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-24 lg:pb-12">
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Navigation & Title Bar ────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="btn-secondary gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/inventory')}>Inventory</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-semibold">{product.category}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-mono text-slate-700 font-bold">{product.sku}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="page-title text-xl sm:text-2xl">{product.name}</h1>
              <span className={`badge text-xs font-bold uppercase tracking-wider ${
                isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'
              }`}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="btn-primary py-2 px-4 text-xs font-bold shadow-md shadow-primary-600/20"
          >
            <Layers className="w-3.5 h-3.5" />
            Adjust Stock
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary py-2 px-3.5 text-xs font-semibold gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => navigate('/billing/create')}
            className="btn-secondary py-2 px-3.5 text-xs font-semibold text-primary-700 border-primary-200 hover:bg-primary-50 gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            Create Bill
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Stock Meter Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`} />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 font-mono">
              {product.stock} <span className="text-sm font-semibold text-slate-500">{product.unit}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Minimum Threshold: <strong>{product.minStock} {product.unit}</strong>
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOutOfStock ? 'w-0' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(5, stockPercent)}%` }}
            />
          </div>
        </div>

        {/* Total Sales Qty Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Units Sold</span>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {totalSalesQty} <span className="text-sm font-semibold text-slate-500">{product.unit}</span>
          </p>
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Revenue: {formatCurr(totalSalesRevenue)}
          </p>
        </div>

        {/* Profit Margin Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Unit Pricing</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 font-mono">{formatCurr(product.price)}</p>
            <span className="text-xs text-slate-400">MRP</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Cost: {formatCurr(product.costPrice)}</span>
            <span className="font-bold text-emerald-700">Margin: {marginPct}%</span>
          </div>
        </div>

        {/* Stock Valuation Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">On-Hand Valuation</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{formatCurr(costValuation)}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
            <span>Retail Worth:</span>
            <span className="font-mono font-bold text-slate-700">{formatCurr(retailValuation)}</span>
          </div>
        </div>
      </div>

      {/* ── Product Specifications & Description ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-600" />
          Product Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Product Code (SKU)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{product.sku}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Category</span>
            <span className="font-bold text-slate-900 text-sm">{product.category}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">HSN / SAC Code</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{product.hsnCode}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">GST Rate</span>
            <span className="font-bold text-slate-900 text-sm">{product.gstRate}%</span>
          </div>
        </div>

        {product.description && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Description / Store Notes:</span>
            <p className="leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      {/* ── Stock Movement History ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Stock Movement & Adjustment Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {productMovements.length} log entr{productMovements.length === 1 ? 'y' : 'ies'}
          </span>
        </div>

        {productMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Change Qty</th>
                  <th className="py-2.5 px-3 text-center">Stock Level</th>
                  <th className="py-2.5 px-4">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productMovements.map((m) => {
                  const isPos = m.type === 'increase' || m.type === 'return' || m.type === 'initial';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 text-slate-600 font-medium">{fDate(m.date)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          m.type === 'increase'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.type === 'sale'
                            ? 'bg-blue-100 text-blue-800'
                            : m.type === 'return'
                            ? 'bg-purple-100 text-purple-800'
                            : m.type === 'initial'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span className={isPos ? 'text-emerald-700' : 'text-rose-600'}>
                          {isPos ? '+' : '-'}{m.quantity} {product.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {m.previousStock} → <strong>{m.newStock}</strong>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        <p className="font-medium">{m.reason}</p>
                        {m.reference && (
                          <span className="font-mono text-[10px] text-slate-400 block">{m.reference}</span>
                        )}
                        {m.notes && <p className="text-[11px] text-slate-400 italic">{m.notes}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <p>No stock movement entries recorded yet for this product.</p>
          </div>
        )}
      </div>

      {/* ── Recent Invoices Containing This Product ───────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Invoices Billed</h3>
          </div>
          <span className="text-xs text-slate-400">{relevantInvoices.length} bill{relevantInvoices.length === 1 ? '' : 's'}</span>
        </div>

        {relevantInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Invoice No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-center">Qty Billed</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantInvoices.map((inv) => (
                  <tr
                    key={inv.invoiceId}
                    onClick={() => navigate(`/invoices/${inv.invoiceId}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{fDate(inv.date)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {inv.quantity} {product.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurr(inv.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`badge text-[10px] font-bold uppercase ${
                        inv.status === 'paid' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right pr-6">
                      <span className="text-primary-600 font-bold hover:underline flex items-center justify-end gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <p>This product has not been billed on any invoices yet.</p>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <ProductFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        productToEdit={product}
        onSave={(data) => {
          updateProduct({ ...data, id: product.id });
          showToast(`Updated ${data.name} successfully!`);
        }}
        existingCategories={existingCategories}
      />

      <StockAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        product={product}
        onAdjust={(prodId, adj) => {
          adjustStock(prodId, adj);
          showToast(`Stock adjusted (${adj.type === 'increase' ? '+' : '-'}${adj.quantity} ${product.unit})!`);
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{product.name}</strong> ({product.sku}) from inventory?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-primary flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

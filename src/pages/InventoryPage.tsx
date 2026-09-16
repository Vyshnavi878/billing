import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Package, AlertTriangle, Layers, Edit2,
  Trash2, Download, Eye, ChevronRight, TrendingUp, Filter,
  CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Tag,
  History, DollarSign, Sparkles, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductFormModal from '../components/inventory/ProductFormModal';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import type { Product } from '../types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const fDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

type ViewTab = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'categories' | 'history';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, stockMovements, addProduct, updateProduct, deleteProduct, adjustStock } = useApp();

  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Categories list
  const existingCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  // Inventory KPI Overview metrics
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const inStockCount = products.filter(p => p.status === 'in_stock').length;
  const totalCostValuation = products.reduce((s, p) => s + (p.stock * p.costPrice), 0);
  const totalRetailValuation = products.reduce((s, p) => s + (p.stock * p.price), 0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Tab filter
      if (activeTab === 'in_stock' && p.status !== 'in_stock') return false;
      if (activeTab === 'low_stock' && p.status !== 'low_stock') return false;
      if (activeTab === 'out_of_stock' && p.status !== 'out_of_stock') return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Search filter
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.hsnCode.includes(q)
      );
    });
  }, [products, activeTab, selectedCategory, search]);

  // Category breakdown summary
  const categoryStats = useMemo(() => {
    return existingCategories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      const totalUnits = catProducts.reduce((s, p) => s + p.stock, 0);
      const costValue = catProducts.reduce((s, p) => s + (p.stock * p.costPrice), 0);
      const retailValue = catProducts.reduce((s, p) => s + (p.stock * p.price), 0);
      const lowStockInCat = catProducts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
      return {
        category: cat,
        count: catProducts.length,
        totalUnits,
        costValue,
        retailValue,
        lowStockInCat,
      };
    });
  }, [products, existingCategories]);

  const handleExportCsv = () => {
    const header = ['SKU', 'Product Name', 'Category', 'Unit', 'Purchase Price', 'Selling Price', 'Current Stock', 'Min Stock', 'GST Rate', 'Stock Status'];
    const rows = products.map(p => [
      p.sku,
      `"${p.name}"`,
      `"${p.category}"`,
      p.unit,
      p.costPrice,
      p.price,
      p.stock,
      p.minStock,
      `${p.gstRate}%`,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (p: Product) => {
    switch (p.status) {
      case 'in_stock':
        return (
          <span className="badge badge-success inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> In Stock
          </span>
        );
      case 'low_stock':
        return (
          <span className="badge badge-warning inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="badge badge-danger inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
            <XCircle className="w-3 h-3" /> Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
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
          <h1 className="page-title text-2xl font-black text-slate-900 tracking-tight">Inventory & Stock</h1>
          <p className="page-subtitle text-slate-500 mt-0.5">
            Single-store stock control, product catalog, and real-time adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="btn-secondary text-xs py-2 px-3 gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            id="add-product-btn"
            onClick={() => {
              setProductToEdit(null);
              setShowProductModal(true);
            }}
            className="btn-primary shadow-md shadow-primary-600/25 px-4 sm:px-5 py-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* ── Inventory Overview KPI Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="stat-card p-4 sm:p-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-tight">
            {totalProducts}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">Total Products</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{existingCategories.length} product categories</p>
        </div>

        {/* Total Stock Items */}
        <div className="stat-card p-4 sm:p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-tight">
            {totalStockUnits}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">Total Stock Items</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Worth {formatCurrency(totalCostValuation)}</p>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => setActiveTab('low_stock')}
          className={`stat-card p-4 sm:p-5 cursor-pointer transition-all ${
            lowStockCount > 0 ? 'border-amber-200 bg-amber-50/20' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 font-mono leading-tight">
            {lowStockCount}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">Low Stock Products</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            {lowStockCount > 0 ? 'Needs reordering' : 'All stock levels healthy'}
          </p>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setActiveTab('out_of_stock')}
          className={`stat-card p-4 sm:p-5 cursor-pointer transition-all ${
            outOfStockCount > 0 ? 'border-rose-200 bg-rose-50/20' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900 font-mono leading-tight">
            {outOfStockCount}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">Out of Stock</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">
            {outOfStockCount > 0 ? 'Immediate action required' : 'Zero depleted items'}
          </p>
        </div>
      </div>

      {/* ── View Switcher Navigation Tabs ────────────────────────────── */}
      <div className="flex items-center bg-slate-100/90 rounded-2xl p-1.5 gap-1.5 overflow-x-auto scrollbar-none w-fit max-w-full">
        {([
          { key: 'all', label: 'All Products', count: totalProducts },
          { key: 'in_stock', label: 'In Stock', count: inStockCount },
          { key: 'low_stock', label: 'Low Stock Alert', count: lowStockCount },
          { key: 'out_of_stock', label: 'Out of Stock', count: outOfStockCount },
          { key: 'categories', label: 'Categories', count: existingCategories.length },
          { key: 'history', label: 'Stock Movement Log', count: stockMovements.length },
        ] as { key: ViewTab; label: string; count?: number }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-slate-200/70 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES VIEW ──────────────────────────────────────────── */}
      {activeTab === 'categories' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {categoryStats.map(cat => (
            <div
              key={cat.category}
              onClick={() => {
                setSelectedCategory(cat.category);
                setActiveTab('all');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-primary-400 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-base">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-primary-600 flex items-center gap-0.5">
                  View Items <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{cat.category}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{cat.count} products · {cat.totalUnits} total units in stock</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cost Valuation:</span>
                  <span className="font-mono font-semibold">{formatCurrency(cat.costValue)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Retail Valuation:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(cat.retailValue)}</span>
                </div>
                {cat.lowStockInCat > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                    <span>Low / Depleted:</span>
                    <span>{cat.lowStockInCat} item{cat.lowStockInCat > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'history' ? (
        /* ── STOCK MOVEMENT LOG VIEW ──────────────────────────────────── */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Store Stock Movements & Audit History</h3>
            </div>
            <span className="text-xs text-slate-400">{stockMovements.length} total movement logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-base text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th>Date</th>
                  <th>Product</th>
                  <th>Movement Type</th>
                  <th className="text-center">Quantity Change</th>
                  <th className="text-center">Stock Progression</th>
                  <th>Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((m) => {
                  const isPos = m.type === 'increase' || m.type === 'return' || m.type === 'initial';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="text-slate-600 font-medium whitespace-nowrap">{fDate(m.date)}</td>
                      <td>
                        <span
                          onClick={() => navigate(`/inventory/${m.productId}`)}
                          className="font-bold text-slate-900 hover:text-primary-600 cursor-pointer"
                        >
                          {m.productName}
                        </span>
                      </td>
                      <td>
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
                      <td className="text-center font-mono font-bold">
                        <span className={isPos ? 'text-emerald-700' : 'text-rose-600'}>
                          {isPos ? '+' : '-'}{m.quantity}
                        </span>
                      </td>
                      <td className="text-center font-mono text-slate-600">
                        {m.previousStock} → <strong className="text-slate-900">{m.newStock}</strong>
                      </td>
                      <td className="text-slate-700">
                        <p className="font-medium">{m.reason}</p>
                        {m.reference && (
                          <span className="font-mono text-[11px] text-primary-600 block">{m.reference}</span>
                        )}
                        {m.notes && <p className="text-[11px] text-slate-400 italic">{m.notes}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── PRODUCTS LIST VIEW (All / In Stock / Low Stock / Out of Stock) ── */
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or HSN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10 text-xs sm:text-sm py-2.5"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input-base text-xs sm:text-sm py-2 w-44"
              >
                <option value="all">All Categories ({existingCategories.length})</option>
                {existingCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {(selectedCategory !== 'all' || search.trim()) && (
                <button
                  onClick={() => { setSelectedCategory('all'); setSearch(''); }}
                  className="btn-ghost text-xs text-rose-600 hover:text-rose-700 py-1.5 px-2.5"
                  title="Clear filters"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="hidden lg:block overflow-x-auto">
              <table className="table-base text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th className="text-right">Selling Price</th>
                    <th className="text-right">Purchase Price</th>
                    <th className="text-center">Current Stock</th>
                    <th className="text-center">GST Rate</th>
                    <th>Stock Status</th>
                    <th className="text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isOut = p.stock === 0;
                    const isLow = p.stock <= p.minStock && p.stock > 0;
                    const deficit = isLow || isOut ? Math.max(0, p.minStock - p.stock) : 0;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/inventory/${p.id}`)}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Product Name */}
                        <td>
                          <div>
                            <p className="font-bold text-slate-900 text-sm hover:text-primary-600 transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs font-normal">
                              HSN: {p.hsnCode} · {p.unit}
                            </p>
                          </div>
                        </td>

                        {/* SKU */}
                        <td>
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {p.sku}
                          </span>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="text-xs font-medium text-slate-700">
                            {p.category}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td className="text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(p.price)}
                        </td>

                        {/* Purchase Price */}
                        <td className="text-right font-mono text-slate-500 text-xs">
                          {formatCurrency(p.costPrice)}
                        </td>

                        {/* Current Stock */}
                        <td className="text-center">
                          <div className="inline-block">
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {p.stock} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                            </span>
                            {deficit > 0 && (
                              <p className="text-[10px] text-amber-700 font-semibold">
                                Deficit: -{deficit} {p.unit}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* GST Rate */}
                        <td className="text-center font-mono font-semibold text-slate-600">
                          {p.gstRate}%
                        </td>

                        {/* Stock Status */}
                        <td>
                          {getStatusBadge(p)}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1 pr-2">
                            {/* Stock adjust shortcut */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdjustingProduct(p);
                              }}
                              className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                              title="Adjust Stock"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* View detail */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/inventory/${p.id}`);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductToEdit(p);
                                setShowProductModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmProduct(p);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-slate-400 max-w-sm mx-auto">
                          <Package className="w-10 h-10 opacity-30" />
                          <p className="text-sm font-semibold text-slate-600">No products found</p>
                          <p className="text-xs text-slate-400 text-center">
                            No inventory items matched your active search or filter criteria.
                          </p>
                          <button
                            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                            className="btn-secondary text-xs px-4 py-2 mt-2"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Products Cards (375x667 Viewport) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOut = p.stock === 0;
                const isLow = p.stock <= p.minStock && p.stock > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/inventory/${p.id}`)}
                    className="p-4 active:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
                  >
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{p.sku} · {p.category}</p>
                      </div>
                      {getStatusBadge(p)}
                    </div>

                    {/* Stock & Price */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Selling Price</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(p.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">On-Hand Stock</span>
                        <span className={`font-mono font-bold text-sm ${isOut ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdjustingProduct(p);
                        }}
                        className="text-primary-700 font-semibold flex items-center gap-1 py-1 px-2.5 bg-primary-50 rounded-lg"
                      >
                        <Layers className="w-3.5 h-3.5" /> Adjust
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToEdit(p);
                            setShowProductModal(true);
                          }}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-primary-600 font-bold flex items-center gap-0.5">
                          Detail <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 px-4 text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-slate-600">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Product Form Modal (Add / Edit) ───────────────────────────── */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSave={(data, editId) => {
          if (editId) {
            updateProduct({ ...data, id: editId });
            showToast(`Updated ${data.name} successfully!`);
          } else {
            addProduct(data);
            showToast(`Added ${data.name} to inventory!`);
          }
        }}
        existingCategories={existingCategories}
      />

      {/* ── Stock Adjustment Modal ────────────────────────────────────── */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onAdjust={(prodId, adj) => {
          adjustStock(prodId, adj);
          showToast(`Stock updated (${adj.type === 'increase' ? '+' : '-'}${adj.quantity})!`);
        }}
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deleteConfirmProduct.name}</strong> from your inventory?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmProduct.id);
                  setDeleteConfirmProduct(null);
                  showToast(`Product removed from inventory.`);
                }}
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

export default InventoryPage;

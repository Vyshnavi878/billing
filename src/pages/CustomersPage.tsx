import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Plus, Phone, Mail, MapPin, ShoppingBag,
  IndianRupee, Edit2, Eye, Filter, Download, Trash2,
  CreditCard, Clock, AlertTriangle, CheckCircle2, User,
  Building2, ArrowUpDown, ChevronRight, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Customer } from '../types';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { CustomerPaymentModal } from '../components/customer/CustomerPaymentModal';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'outstanding' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'outstanding' | 'purchases' | 'name' | 'recent'>('outstanding');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Compute live customer metrics derived from actual store invoices
  const customerLedgers = customers.map(c => {
    const custInvs = invoices.filter(
      i => i.customerId === c.id || (i.customerName && i.customerName.toLowerCase() === c.name.toLowerCase())
    );
    const activeInvs = custInvs.filter(i => i.status !== 'cancelled');
    const totalPurchases = activeInvs.length > 0 ? activeInvs.reduce((sum, i) => sum + i.total, 0) : (c.totalSpent || 0);
    const amountPaid = activeInvs.length > 0 ? activeInvs.reduce((sum, i) => sum + i.paid, 0) : (c.totalSpent || 0);
    const outstandingAmount = activeInvs.length > 0 ? activeInvs.reduce((sum, i) => sum + i.balance, 0) : 0;
    const pendingInvs = activeInvs.filter(i => i.balance > 0);
    const lastPurchase = activeInvs.length > 0 ? activeInvs[0].date : c.lastPurchase;

    return {
      customer: c,
      totalPurchases,
      amountPaid,
      outstandingAmount,
      pendingCount: pendingInvs.length,
      lastPurchase,
      invoices: custInvs,
    };
  });

  // KPI calculations
  const totalReceivables = customerLedgers.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const totalCollected = customerLedgers.reduce((sum, l) => sum + l.amountPaid, 0);
  const customersWithDues = customerLedgers.filter(l => l.outstandingAmount > 0).length;

  // Filter logic
  const filtered = customerLedgers.filter(l => {
    const c = l.customer;
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.gstin || '').toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (tabFilter === 'outstanding') return l.outstandingAmount > 0;
    if (tabFilter === 'active') return c.status === 'active';
    if (tabFilter === 'inactive') return c.status === 'inactive';
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortBy === 'outstanding') return b.outstandingAmount - a.outstandingAmount;
    if (sortBy === 'purchases') return b.totalPurchases - a.totalPurchases;
    if (sortBy === 'name') return a.customer.name.localeCompare(b.customer.name);
    return new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime();
  });

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'GSTIN', 'City', 'Total Purchases', 'Amount Paid', 'Outstanding Amount', 'Last Purchase', 'Status'];
    const rows = filtered.map(l => [
      `"${l.customer.name}"`,
      `"${l.customer.phone}"`,
      `"${l.customer.gstin || 'Unregistered'}"`,
      `"${l.customer.city}"`,
      l.totalPurchases,
      l.amountPaid,
      l.outstandingAmount,
      `"${l.lastPurchase}"`,
      l.customer.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer ledger exported to CSV');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {customers.length} business accounts · Track sales ledger & outstanding receivables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-ghost text-xs gap-1.5 border border-slate-200">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2.5 px-4 gap-1.5 shadow-md shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <User className="w-4 h-4 text-primary-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{customers.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {customers.filter(c => c.status === 'active').length} active buyers
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${totalReceivables > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurr(totalReceivables)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{customersWithDues} accounts with pending dues</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{formatCurr(totalCollected)}</p>
          <p className="text-[11px] text-slate-400 mt-1">From all historical bills</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Accounts with Due</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">{customersWithDues}</p>
          <button
            onClick={() => setTabFilter('outstanding')}
            className="text-[11px] text-primary-600 font-semibold hover:underline mt-1 block text-left"
          >
            Filter outstanding only →
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Tab Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tabFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setTabFilter('outstanding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tabFilter === 'outstanding'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-700 bg-red-50 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Outstanding Only ({customersWithDues})
            </button>
            <button
              onClick={() => setTabFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tabFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active ({customers.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setTabFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tabFilter === 'inactive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Inactive ({customers.filter(c => c.status === 'inactive').length})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 outline-none text-xs"
            >
              <option value="outstanding">Highest Outstanding</option>
              <option value="purchases">Total Purchases</option>
              <option value="name">Name (A - Z)</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name, phone, GSTIN, city, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 text-xs sm:text-sm py-2.5"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer List (Desktop Table) */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>GSTIN</th>
              <th>Total Purchases</th>
              <th>Amount Paid</th>
              <th>Outstanding Amount</th>
              <th>Last Purchase</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const c = l.customer;
              return (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/customers/${c.id}`}
                          className="font-bold text-slate-900 hover:text-primary-600 transition-colors text-sm truncate block"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-slate-400 truncate">{c.city}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td>
                    <a
                      href={`tel:${c.phone}`}
                      className="font-mono text-xs font-semibold text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      {c.phone}
                    </a>
                  </td>

                  {/* GSTIN */}
                  <td>
                    {c.gstin ? (
                      <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">
                        {c.gstin}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-sans">Consumer</span>
                    )}
                  </td>

                  {/* Purchases */}
                  <td>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {formatCurr(l.totalPurchases)}
                    </span>
                  </td>

                  {/* Paid */}
                  <td>
                    <span className="font-mono font-semibold text-emerald-600 text-xs">
                      {formatCurr(l.amountPaid)}
                    </span>
                  </td>

                  {/* Outstanding */}
                  <td>
                    {l.outstandingAmount > 0 ? (
                      <span className="font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-xs inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {formatCurr(l.outstandingAmount)}
                      </span>
                    ) : (
                      <span className="font-mono font-medium text-emerald-600 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ₹0 (Clear)
                      </span>
                    )}
                  </td>

                  {/* Last Purchase */}
                  <td>
                    <span className="text-xs text-slate-600">
                      {formatDate(l.lastPurchase)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Record payment shortcut if outstanding */}
                      {l.outstandingAmount > 0 && (
                        <button
                          onClick={() => setPaymentCustomer(c)}
                          title="Record payment"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      {/* Create invoice shortcut */}
                      <button
                        onClick={() => navigate(`/billing/create?customerId=${c.id}`)}
                        title="Create new invoice"
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* View details */}
                      <Link
                        to={`/customers/${c.id}`}
                        title="View details"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingCustomer(c)}
                        title="Edit customer"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(c)}
                        title="Delete customer"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-400">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No customers found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try altering your search query or filter criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer List (Mobile Cards for 375x667) */}
      <div className="lg:hidden space-y-3">
        {filtered.map(l => {
          const c = l.customer;
          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-sm space-y-3 ${
                l.outstandingAmount > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <Link
                      to={`/customers/${c.id}`}
                      className="font-bold text-slate-900 text-sm hover:text-primary-600 block leading-tight"
                    >
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{c.city}</span>
                      <span>·</span>
                      <a href={`tel:${c.phone}`} className="font-mono text-primary-600 font-medium">
                        {c.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <span className={`badge text-[10px] ${c.status === 'active' ? 'badge-success' : 'badge-slate'}`}>
                  {c.status}
                </span>
              </div>

              {/* Outstanding Badge Banner */}
              {l.outstandingAmount > 0 ? (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Due Balance:
                  </span>
                  <span className="font-mono font-black text-red-600 text-sm">
                    {formatCurr(l.outstandingAmount)}
                  </span>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ledger Status:
                  </span>
                  <span className="font-semibold">Paid Clear</span>
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px]">Total Purchases</span>
                  <p className="font-mono font-bold text-slate-900">{formatCurr(l.totalPurchases)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Amount Paid</span>
                  <p className="font-mono font-semibold text-emerald-600">{formatCurr(l.amountPaid)}</p>
                </div>
                {c.gstin && (
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px]">GSTIN: </span>
                    <span className="font-mono font-semibold text-primary-700 text-[11px] bg-primary-50 px-1.5 py-0.5 rounded">
                      {c.gstin}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/customers/${c.id}`}
                  className="btn-secondary flex-1 py-2 text-xs font-semibold text-center"
                >
                  View Profile
                </Link>

                {l.outstandingAmount > 0 ? (
                  <button
                    onClick={() => setPaymentCustomer(c)}
                    className="btn-primary py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay Due
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/billing/create?customerId=${c.id}`)}
                    className="btn-primary py-2 px-3 text-xs font-semibold gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Bill
                  </button>
                )}

                <button
                  onClick={() => setEditingCustomer(c)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                  aria-label="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
            No customers found matching this filter.
          </div>
        )}
      </div>

      {/* Floating Sticky Mobile Add Customer Action */}
      <div className="fixed bottom-20 right-4 lg:hidden z-30">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-13 h-13 rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-600/40 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Add Customer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <CustomerFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={data => addCustomer(data)}
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerFormModal
          isOpen={Boolean(editingCustomer)}
          onClose={() => setEditingCustomer(null)}
          initialData={editingCustomer}
          onSubmit={data => updateCustomer(data)}
        />
      )}

      {/* Collect Payment Modal */}
      {paymentCustomer && (
        <CustomerPaymentModal
          isOpen={Boolean(paymentCustomer)}
          onClose={() => setPaymentCustomer(null)}
          customer={paymentCustomer}
          customerInvoices={
            invoices.filter(
              i => i.customerId === paymentCustomer.id ||
              (i.customerName && i.customerName.toLowerCase() === paymentCustomer.name.toLowerCase())
            )
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Remove Customer?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> from your customer database?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

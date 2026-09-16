import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Building2, Calendar, FileText,
  CreditCard, Plus, ArrowLeft, Edit2, AlertCircle, CheckCircle2,
  Clock, IndianRupee, Eye, ExternalLink, ChevronRight, AlertTriangle,
  Receipt, ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { CustomerPaymentModal } from '../components/customer/CustomerPaymentModal';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, invoices, updateCustomer } = useApp();

  const customer = customers.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Customer Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">The customer record you requested could not be located.</p>
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="btn-primary w-full py-2.5 text-xs gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>
      </div>
    );
  }

  // Get matching invoices
  const customerInvoices = invoices.filter(
    i => i.customerId === customer.id || (i.customerName && i.customerName.toLowerCase() === customer.name.toLowerCase())
  );

  const activeInvoices = customerInvoices.filter(i => i.status !== 'cancelled');
  const totalPurchases = activeInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = activeInvoices.reduce((sum, i) => sum + i.paid, 0);
  const outstandingAmount = activeInvoices.reduce((sum, i) => sum + i.balance, 0);
  const pendingInvoices = activeInvoices.filter(i => i.balance > 0);

  // Extract all payments
  const paymentsList = customerInvoices.flatMap(inv =>
    (inv.paymentRecords || []).map(pr => ({
      ...pr,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered invoices
  const filteredInvoices = customerInvoices.filter(inv => {
    if (invoiceFilter === 'pending') return (inv.status === 'pending' || inv.status === 'partial') && inv.balance > 0;
    if (invoiceFilter === 'paid') return inv.status === 'paid';
    if (invoiceFilter === 'cancelled') return inv.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
              <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-slate'}`}>
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {customer.id} · Registered since {formatDate(customer.createdAt || '2025-11-12')}
            </p>
          </div>
        </div>

        {/* Quick Header Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary py-2 px-3 text-xs gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          {outstandingAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary py-2 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          )}

          <button
            onClick={() => navigate(`/billing/create?customerId=${customer.id}`)}
            className="btn-primary py-2 px-3.5 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Outstanding Alert Banner (if customer owes money) */}
      {outstandingAmount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Outstanding Balance Due: <span className="font-mono text-base font-black text-red-600">{formatCurr(outstandingAmount)}</span>
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {pendingInvoices.length} unpaid bill{pendingInvoices.length > 1 ? 's' : ''} awaiting collection.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-secondary py-2 px-3.5 text-xs font-semibold self-start sm:self-auto bg-white border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            Collect Payment Now
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Purchases</span>
            <ShoppingBag className="w-4 h-4 text-primary-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurr(totalPurchases)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all confirmed bills</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{formatCurr(totalPaid)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Settled receipts received</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${outstandingAmount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurr(outstandingAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{pendingInvoices.length} pending invoice{pendingInvoices.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Invoices Count</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{customerInvoices.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Last: {formatDate(customer.lastPurchase)}</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'Overview Profile' },
          { id: 'invoices', label: `Invoices (${customerInvoices.length})` },
          { id: 'payments', label: `Payment History (${paymentsList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                Customer Contact & Business Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Phone Number</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${customer.phone}`} className="hover:text-primary-600 hover:underline">
                      {customer.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Email Address</p>
                  <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {customer.email ? (
                      <a href={`mailto:${customer.email}`} className="hover:text-primary-600 hover:underline truncate">
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">GSTIN Registration</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {customer.gstin ? (
                      <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-lg text-xs">
                        {customer.gstin}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-sans font-normal">Unregistered (Consumer)</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">State / Place of Supply</p>
                  <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customer.state || 'Karnataka (29)'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Billing Address</p>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {customer.address ? `${customer.address}, ${customer.city}` : `${customer.city || 'Bengaluru'}, Karnataka`}
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                Store Owner Notes / Credit Terms
              </h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-mono">
                {customer.notes || 'No custom notes recorded for this customer yet.'}
              </p>
            </div>
          </div>

          {/* Side Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Ledger Quick Stats</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Average Invoice Value</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {activeInvoices.length > 0 ? formatCurr(totalPurchases / activeInvoices.length) : '₹0'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Payment Health</span>
                  <span className={`font-semibold ${outstandingAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {outstandingAmount === 0 ? 'All Clear (100%)' : `${Math.round((totalPaid / (totalPurchases || 1)) * 100)}% Collected`}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Last Bill Date</span>
                  <span className="font-bold text-slate-900">{formatDate(customer.lastPurchase)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Payments Logged</span>
                  <span className="font-bold text-slate-900">{paymentsList.length} transactions</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(`/billing/create?customerId=${customer.id}`)}
                  className="btn-primary w-full py-2.5 text-xs gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Bill New Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Subfilters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'all', label: `All (${customerInvoices.length})` },
                { id: 'pending', label: `Pending / Due (${pendingInvoices.length})` },
                { id: 'paid', label: `Paid (${customerInvoices.filter(i => i.status === 'paid').length})` },
                { id: 'cancelled', label: `Cancelled (${customerInvoices.filter(i => i.status === 'cancelled').length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setInvoiceFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    invoiceFilter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate(`/billing/create?customerId=${customer.id}`)}
              className="btn-primary py-2 px-3 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="font-mono text-xs font-bold text-primary-700 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td><span className="text-xs text-slate-600">{formatDate(inv.date)}</span></td>
                    <td><span className="text-xs text-slate-500">{inv.items.length} items</span></td>
                    <td><span className="font-mono font-bold text-slate-900 text-xs">{formatCurr(inv.total)}</span></td>
                    <td><span className="font-mono text-emerald-600 text-xs">{formatCurr(inv.paid)}</span></td>
                    <td>
                      <span className={`font-mono text-xs font-bold ${inv.balance > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {formatCurr(inv.balance)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        inv.status === 'paid' ? 'badge-success' :
                        inv.status === 'partial' ? 'badge-warning' :
                        inv.status === 'cancelled' ? 'badge-slate' : 'badge-danger'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="btn-ghost p-1.5 text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      No invoices found under this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (375x667) */}
          <div className="md:hidden space-y-3">
            {filteredInvoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">
                    {inv.invoiceNumber}
                  </span>
                  <span className={`badge ${
                    inv.status === 'paid' ? 'badge-success' :
                    inv.status === 'partial' ? 'badge-warning' :
                    inv.status === 'cancelled' ? 'badge-slate' : 'badge-danger'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <p className="font-medium text-slate-700">{formatDate(inv.date)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Items:</span>
                    <p className="font-medium text-slate-700">{inv.items.length} items</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total:</span>
                    <p className="font-mono font-bold text-slate-900">{formatCurr(inv.total)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Balance:</span>
                    <p className={`font-mono font-bold ${inv.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurr(inv.balance)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="btn-secondary py-1.5 px-3 text-xs w-full text-center"
                  >
                    View Invoice Details
                  </Link>
                </div>
              </div>
            ))}
            {filteredInvoices.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
                No invoices found under this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Receipts logged against this customer</p>
            {outstandingAmount > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary py-2 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Receipt Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Credited To Invoice</th>
                  <th>Reference / UTR</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.map((pay, idx) => (
                  <tr key={idx}>
                    <td><span className="text-xs text-slate-700 font-medium">{formatDate(pay.date)}</span></td>
                    <td><span className="font-mono font-bold text-emerald-600 text-sm">{formatCurr(pay.amount)}</span></td>
                    <td>
                      <span className="badge badge-purple uppercase text-[10px]">
                        {pay.method}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/invoices/${pay.invoiceId}`}
                        className="font-mono text-xs font-bold text-primary-700 hover:underline"
                      >
                        {pay.invoiceNumber}
                      </Link>
                    </td>
                    <td><span className="font-mono text-xs text-slate-500">{pay.reference || '—'}</span></td>
                    <td><span className="text-xs text-slate-500">{pay.notes || '—'}</span></td>
                  </tr>
                ))}
                {paymentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                      No payment receipts recorded yet for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (375x667) */}
          <div className="md:hidden space-y-3">
            {paymentsList.map((pay, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-purple uppercase text-[10px]">
                    {pay.method}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(pay.date)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400">Invoice:</span>
                    <Link
                      to={`/invoices/${pay.invoiceId}`}
                      className="font-mono text-xs font-bold text-primary-700 block hover:underline"
                    >
                      {pay.invoiceNumber}
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Received:</span>
                    <p className="font-mono font-black text-emerald-600 text-sm">{formatCurr(pay.amount)}</p>
                  </div>
                </div>
                {pay.reference && (
                  <p className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-50">
                    Ref: {pay.reference}
                  </p>
                )}
              </div>
            ))}
            {paymentsList.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
                No payment receipts recorded yet for this customer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <CustomerFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={customer}
          onSubmit={data => updateCustomer(data)}
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <CustomerPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          customer={customer}
          customerInvoices={customerInvoices}
        />
      )}
    </div>
  );
};

export default CustomerDetailPage;

import React, { useState, useMemo } from 'react';
import {
  CreditCard, Smartphone, Banknote, Building2, Search, Download, Plus,
  Filter, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight,
  TrendingUp, ArrowUpRight, DollarSign, Receipt, Users, Trash2, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecordPaymentModal } from '../components/payment/RecordPaymentModal';
import type { Payment } from '../types';

export const PaymentsPage: React.FC = () => {
  const { payments, invoices, customers, deletePayment } = useApp();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'history' | 'pending' | 'outstanding'>('history');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modal state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [modalTargetInvoiceId, setModalTargetInvoiceId] = useState<string | undefined>(undefined);
  const [modalTargetCustomerId, setModalTargetCustomerId] = useState<string | undefined>(undefined);

  // Currency & Date formatters
  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Current system date reference (matches mock data date 2026-09-16)
  const todayStr = '2026-09-16';
  const currentMonthStr = '2026-09';

  // KPIs
  const receivedToday = useMemo(() => {
    return payments
      .filter(p => p.status === 'completed' && p.date === todayStr)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, todayStr]);

  const receivedThisMonth = useMemo(() => {
    return payments
      .filter(p => p.status === 'completed' && (p.date || '').startsWith(currentMonthStr))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, currentMonthStr]);

  const pendingInvoicesList = useMemo(() => {
    return invoices.filter(inv => inv.status !== 'cancelled' && inv.balance > 0);
  }, [invoices]);

  const totalPendingAmount = useMemo(() => {
    return pendingInvoicesList.reduce((sum, inv) => sum + inv.balance, 0);
  }, [pendingInvoicesList]);

  // Method visual configs
  const getMethodBadge = (m: string) => {
    const lower = (m || '').toLowerCase();
    switch (lower) {
      case 'upi':
        return { label: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" />, bg: 'bg-violet-50 text-violet-700 border-violet-200' };
      case 'cash':
        return { label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'card':
        return { label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" />, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Other', icon: <Building2 className="w-3.5 h-3.5" />, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  // Filtered Payments History
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Search
      const term = search.toLowerCase();
      const matchSearch =
        !search ||
        (p.id || '').toLowerCase().includes(term) ||
        (p.customerName || '').toLowerCase().includes(term) ||
        (p.invoiceNumber || '').toLowerCase().includes(term) ||
        (p.reference || '').toLowerCase().includes(term) ||
        (p.notes || '').toLowerCase().includes(term);

      // Method filter
      const matchMethod =
        methodFilter === 'all' ||
        (methodFilter === 'other'
          ? !['upi', 'cash', 'card'].includes((p.method || '').toLowerCase())
          : (p.method || '').toLowerCase() === methodFilter);

      // Date filter
      let matchDate = true;
      if (dateFilter === 'today') matchDate = p.date === todayStr;
      else if (dateFilter === 'month') matchDate = (p.date || '').startsWith(currentMonthStr);

      return matchSearch && matchMethod && matchDate;
    });
  }, [payments, search, methodFilter, dateFilter, todayStr, currentMonthStr]);

  // Customer Outstanding Grouping
  const customerOutstandingList = useMemo(() => {
    const map = new Map<string, {
      customerId: string;
      customerName: string;
      customerPhone?: string;
      pendingInvoicesCount: number;
      totalOutstanding: number;
      lastPaymentDate?: string;
    }>();

    // Group pending invoices by customer
    pendingInvoicesList.forEach(inv => {
      const key = inv.customerId || inv.customerName;
      if (!map.has(key)) {
        // find last payment for this customer
        const custPays = payments
          .filter(p => p.customerId === inv.customerId || p.customerName === inv.customerName)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        map.set(key, {
          customerId: inv.customerId || '',
          customerName: inv.customerName,
          customerPhone: inv.customerPhone,
          pendingInvoicesCount: 0,
          totalOutstanding: 0,
          lastPaymentDate: custPays[0]?.date,
        });
      }
      const entry = map.get(key)!;
      entry.pendingInvoicesCount += 1;
      entry.totalOutstanding += inv.balance;
    });

    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }, [pendingInvoicesList, payments]);

  // Open Record Modal helper
  const handleOpenRecordModal = (invoiceId?: string, customerId?: string) => {
    setModalTargetInvoiceId(invoiceId);
    setModalTargetCustomerId(customerId);
    setShowRecordModal(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Payment ID', 'Date', 'Customer', 'Invoice', 'Amount', 'Method', 'Status', 'Reference', 'Notes'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.date,
      `"${p.customerName.replace(/"/g, '""')}"`,
      p.invoiceNumber,
      p.amount,
      p.method,
      p.status,
      `"${(p.reference || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
              <CreditCard className="w-5 h-5" />
            </span>
            Payments & Collections
          </h1>
          <p className="page-subtitle text-xs sm:text-sm text-slate-500 mt-1">
            Track receivables, settlements, and pending dues
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs py-2.5 px-3.5 gap-1.5"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenRecordModal()}
            className="btn-primary text-xs py-2.5 px-4 gap-1.5 shadow-md shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 1. Payment Overview: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Received Today */}
        <div className="stat-card bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Received Today</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-2 font-mono">
            {formatCurr(receivedToday)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Today ({todayStr})
          </p>
        </div>

        {/* Received This Month */}
        <div className="stat-card bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Received This Month</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-2 font-mono">
            {formatCurr(receivedThisMonth)}
          </p>
          <p className="text-[11px] text-indigo-600 mt-1 font-medium">
            Sep 2026 collections
          </p>
        </div>

        {/* Pending Amount */}
        <div className="stat-card bg-gradient-to-br from-white to-rose-50/40 border border-rose-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Amount</span>
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2 font-mono">
            {formatCurr(totalPendingAmount)}
          </p>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">
            Outstanding from customers
          </p>
        </div>

        {/* Number of Pending Invoices */}
        <div className="stat-card bg-gradient-to-br from-white to-amber-50/40 border border-amber-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Invoices</span>
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 mt-2 font-mono">
            {pendingInvoicesList.length}
          </p>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">
            Invoices awaiting balance
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment History ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Invoices ({pendingInvoicesList.length})
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'outstanding'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Customer Outstanding ({customerOutstandingList.length})
        </button>
      </div>

      {/* TAB 1: Payment History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Controls: Search + Method Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payment ID, customer, invoice, ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Method:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'upi', label: 'UPI' },
                { id: 'cash', label: 'Cash' },
                { id: 'card', label: 'Card' },
                { id: 'other', label: 'Other' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethodFilter(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    methodFilter === m.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}

              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="input-base text-xs py-1.5 px-2.5 w-auto"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference / Notes</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPayments.map(p => {
                    const badge = getMethodBadge(p.method);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td>
                          <span className="font-mono font-semibold text-slate-700">{p.id}</span>
                        </td>
                        <td>
                          <span className="text-slate-600">{formatDate(p.date)}</span>
                        </td>
                        <td>
                          <p className="font-bold text-slate-900">{p.customerName}</p>
                        </td>
                        <td>
                          <span className="font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100 font-semibold">
                            {p.invoiceNumber}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-sm text-emerald-600">
                            {formatCurr(p.amount)}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${badge.bg}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div className="max-w-xs truncate">
                            {p.reference && <span className="font-mono text-slate-600 block">{p.reference}</span>}
                            {p.notes && <span className="text-slate-400 italic block truncate">{p.notes}</span>}
                            {!p.reference && !p.notes && <span className="text-slate-300">—</span>}
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete payment transaction ${p.id}?`)) {
                                deletePayment(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No payments found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards (375x667 optimized) */}
          <div className="block md:hidden space-y-3">
            {filteredPayments.map(p => {
              const badge = getMethodBadge(p.method);
              return (
                <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{p.id}</span>
                      <span className="font-mono text-[11px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                        {p.invoiceNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(p.date)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.customerName}</p>
                      {p.reference && <p className="text-[11px] text-slate-400 font-mono mt-0.5">Ref: {p.reference}</p>}
                    </div>
                    <p className="text-base font-black font-mono text-emerald-600">
                      {formatCurr(p.amount)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-semibold ${badge.bg}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete payment transaction ${p.id}?`)) {
                          deletePayment(p.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredPayments.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No payments found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Pending Invoices (Unpaid or Partial) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 block sm:inline">
                  {pendingInvoicesList.length} Invoices with outstanding balances
                </span>
                <span className="text-amber-700 sm:ml-1 block sm:inline">
                  Totaling {formatCurr(totalPendingAmount)}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenRecordModal()}
              className="btn-primary text-xs py-1.5 px-3 shrink-0"
            >
              Collect Next Payment
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total Bill</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingInvoicesList.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-600">{formatDate(inv.date)}</span>
                    </td>
                    <td>
                      <p className="font-bold text-slate-900">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">{inv.customerPhone}</p>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-700 font-mono">{formatCurr(inv.total)}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-emerald-600 font-mono">{formatCurr(inv.paid)}</span>
                    </td>
                    <td>
                      <span className="font-mono font-black text-rose-600 text-sm">{formatCurr(inv.balance)}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        inv.status === 'partial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status === 'partial' ? 'Partially Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenRecordModal(inv.id, inv.customerId)}
                        className="btn-primary text-xs py-1.5 px-3 gap-1 shadow-sm"
                      >
                        <CreditCard className="w-3 h-3" /> Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingInvoicesList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      All invoices have been fully paid!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards for Pending Invoices */}
          <div className="block md:hidden space-y-3">
            {pendingInvoicesList.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {inv.invoiceNumber}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    inv.status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {inv.status === 'partial' ? 'Partially Paid' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{inv.customerName}</p>
                    <p className="text-xs text-slate-400">{inv.customerPhone} • {formatDate(inv.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Due Balance</span>
                    <span className="font-mono font-black text-rose-600 text-base">{formatCurr(inv.balance)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-500">Bill Total: {formatCurr(inv.total)}</span>
                  <button
                    onClick={() => handleOpenRecordModal(inv.id, inv.customerId)}
                    className="btn-primary text-xs py-1.5 px-3 gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Settle Due
                  </button>
                </div>
              </div>
            ))}
            {pendingInvoicesList.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No pending invoices.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Customer Outstanding View */}
      {activeTab === 'outstanding' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Aggregated store receivables grouped by customer profile
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Unpaid Invoices</th>
                  <th>Last Payment</th>
                  <th>Total Outstanding</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customerOutstandingList.map(c => (
                  <tr key={c.customerId || c.customerName} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                          {c.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.customerName}</p>
                          {c.customerId && <span className="font-mono text-[11px] text-slate-400">{c.customerId}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-600">{c.customerPhone || '—'}</span>
                    </td>
                    <td>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {c.pendingInvoicesCount} {c.pendingInvoicesCount === 1 ? 'bill' : 'bills'}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-500">{formatDate(c.lastPaymentDate)}</span>
                    </td>
                    <td>
                      <span className="font-mono font-black text-sm text-rose-600">
                        {formatCurr(c.totalOutstanding)}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenRecordModal(undefined, c.customerId)}
                        className="btn-primary text-xs py-1.5 px-3 gap-1 shadow-sm"
                      >
                        <CreditCard className="w-3 h-3" /> Collect Dues
                      </button>
                    </td>
                  </tr>
                ))}
                {customerOutstandingList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      Zero customer outstanding! All receivables collected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Outstanding Cards */}
          <div className="block md:hidden space-y-3">
            {customerOutstandingList.map(c => (
              <div key={c.customerId || c.customerName} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {c.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{c.customerName}</p>
                      <p className="text-[11px] text-slate-400">{c.customerPhone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Outstanding</span>
                    <span className="font-mono font-black text-rose-600 text-base">{formatCurr(c.totalOutstanding)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-500">{c.pendingInvoicesCount} unpaid invoices</span>
                  <button
                    onClick={() => handleOpenRecordModal(undefined, c.customerId)}
                    className="btn-primary text-xs py-1.5 px-3 gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Collect Due
                  </button>
                </div>
              </div>
            ))}
            {customerOutstandingList.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
                Zero customer outstanding balance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Universal Modal */}
      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        initialInvoiceId={modalTargetInvoiceId}
        initialCustomerId={modalTargetCustomerId}
      />
    </div>
  );
};

export default PaymentsPage;

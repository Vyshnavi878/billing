import React, { useState, useMemo } from 'react';
import {
  TrendingDown, Plus, Search, Download, Filter, Calendar, Tag,
  Edit3, Trash2, CreditCard, Banknote, Smartphone, Building2,
  PieChart, AlertCircle, CheckCircle2, ChevronRight, ArrowDownRight,
  Receipt, Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExpenseFormModal } from '../components/expense/ExpenseFormModal';
import type { Expense } from '../types';

const categoryColorStyles: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  Rent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
  Salaries: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  Electricity: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
  Transport: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', bar: 'bg-violet-500' },
  Marketing: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', bar: 'bg-pink-500' },
  Maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
  Stationery: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', bar: 'bg-slate-500' },
  Internet: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', bar: 'bg-cyan-500' },
  'Tea & Refreshments': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', bar: 'bg-teal-500' },
  Other: { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200', bar: 'bg-zinc-500' },
};

export const ExpensesPage: React.FC = () => {
  const { expenses, expenseCategories, deleteExpense } = useApp();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'month'>('all');

  // Formatters
  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Dates
  const todayStr = '2026-09-16';
  const currentMonthStr = '2026-09';

  // 1. Expense Dashboard KPIs
  const todayExpensesTotal = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const monthlyExpensesTotal = useMemo(() => {
    return expenses
      .filter(e => (e.date || '').startsWith(currentMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthStr]);

  // Category breakdown calculations
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat].total += e.amount;
      map[cat].count += 1;
    });

    const totalAll = expenses.reduce((s, e) => s + e.amount, 0) || 1;
    return Object.entries(map)
      .map(([cat, val]) => ({
        category: cat,
        total: val.total,
        count: val.count,
        percent: Math.round((val.total / totalAll) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topCategory = categoryBreakdown[0] || { category: 'None', total: 0, percent: 0 };

  const recentExpensesCount = useMemo(() => {
    return expenses.filter(e => (e.date || '').startsWith(currentMonthStr)).length;
  }, [expenses, currentMonthStr]);

  // Payment method badge helper
  const getMethodBadge = (m: string) => {
    const lower = (m || '').toLowerCase();
    switch (lower) {
      case 'cash':
        return { label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'upi':
        return { label: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'bg-violet-50 text-violet-700 border-violet-200' };
      case 'card':
        return { label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Other', icon: <Building2 className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  // Filtered Expense List
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const term = search.toLowerCase();
      const title = (e.title || e.description || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      const vend = (e.vendor || '').toLowerCase();
      const note = (e.notes || '').toLowerCase();
      const matchesSearch = !search || title.includes(term) || cat.includes(term) || vend.includes(term) || note.includes(term);

      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;

      const matchesMethod =
        selectedMethod === 'all' ||
        (selectedMethod === 'other'
          ? !['cash', 'upi', 'card'].includes((e.paymentMethod || '').toLowerCase())
          : (e.paymentMethod || '').toLowerCase() === selectedMethod);

      let matchesDate = true;
      if (dateRange === 'today') matchesDate = e.date === todayStr;
      else if (dateRange === 'month') matchesDate = (e.date || '').startsWith(currentMonthStr);

      return matchesSearch && matchesCat && matchesMethod && matchesDate;
    });
  }, [expenses, search, selectedCategory, selectedMethod, dateRange, todayStr, currentMonthStr]);

  // Handlers
  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setExpenseToEdit(exp);
    setShowModal(true);
  };

  const handleDeleteExpense = (exp: Expense) => {
    if (window.confirm(`Delete expense record "${exp.title || exp.description}" of ${formatCurr(exp.amount)}?`)) {
      deleteExpense(exp.id);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Vendor', 'Notes'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      `"${(e.title || e.description || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMethod,
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <TrendingDown className="w-5 h-5" />
            </span>
            Expenses
          </h1>
          <p className="page-subtitle text-xs sm:text-sm text-slate-500 mt-1">
            Store overheads, utility bills, rent, and daily operational expenses
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
            onClick={handleOpenAddModal}
            className="btn-primary text-xs py-2.5 px-4 gap-1.5 shadow-md shadow-rose-500/20 bg-rose-600 hover:bg-rose-700 border-rose-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Dashboard: 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Expenses */}
        <div className="stat-card bg-gradient-to-br from-white to-rose-50/40 border border-rose-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Expenses</span>
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2 font-mono">
            {formatCurr(todayExpensesTotal)}
          </p>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">
            Recorded for today ({todayStr})
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="stat-card bg-gradient-to-br from-white to-amber-50/40 border border-amber-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Expenses</span>
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 mt-2 font-mono">
            {formatCurr(monthlyExpensesTotal)}
          </p>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">
            Sep 2026 store operations
          </p>
        </div>

        {/* Category Breakdown Top Category */}
        <div className="stat-card bg-gradient-to-br from-white to-blue-50/40 border border-blue-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top Cost Driver</span>
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <PieChart className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-800 mt-2 truncate">
            {topCategory.category}
          </p>
          <p className="text-[11px] text-blue-600 mt-1 font-medium">
            {formatCurr(topCategory.total)} ({topCategory.percent}% of total)
          </p>
        </div>

        {/* Recent Expenses / Total Records */}
        <div className="stat-card bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Recent Transactions</span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2 font-mono">
            {recentExpensesCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Expenses in current cycle
          </p>
        </div>
      </div>

      {/* Category Breakdown Progress Bar Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Category Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">Click any category to filter</span>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {categoryBreakdown.slice(0, 8).map(cb => {
            const style = categoryColorStyles[cb.category] || categoryColorStyles.Other;
            const isSelected = selectedCategory === cb.category;
            return (
              <button
                key={cb.category}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cb.category)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {cb.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{cb.percent}%</span>
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="font-black text-sm text-slate-900 font-mono">{formatCurr(cb.total)}</span>
                  <span className="text-[10px] text-slate-400">{cb.count} {cb.count === 1 ? 'entry' : 'entries'}</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${Math.max(4, cb.percent)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, category, vendor, notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 text-xs"
            />
          </div>

          {/* Quick Category & Payment Method Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input-base text-xs py-1.5 px-2.5 w-auto"
            >
              <option value="all">All Categories</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="input-base text-xs py-1.5 px-2.5 w-auto"
            >
              <option value="all">All Payment Modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI / QR</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>

            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="input-base text-xs py-1.5 px-2.5 w-auto"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Title / Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Vendor / Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExpenses.map(exp => {
                const style = categoryColorStyles[exp.category] || categoryColorStyles.Other;
                const method = getMethodBadge(exp.paymentMethod);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <p className="font-bold text-slate-900 text-sm">{exp.title || exp.description}</p>
                      <span className="text-[11px] font-mono text-slate-400">{exp.id}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border font-semibold text-xs ${style.bg} ${style.text} ${style.border}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-600">{formatDate(exp.date)}</span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-sm text-rose-600">
                        {formatCurr(exp.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold text-xs ${method.color}`}>
                        {method.icon}
                        {method.label}
                      </span>
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {exp.vendor && <span className="font-medium text-slate-700 block">{exp.vendor}</span>}
                        {exp.notes && <span className="text-slate-400 italic block truncate">{exp.notes}</span>}
                        {!exp.vendor && !exp.notes && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Showing {filteredExpenses.length} expense transactions</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Filtered:</span>
            <span className="font-black text-rose-600 font-mono text-sm">
              {formatCurr(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Cards (375x667 optimized) */}
      <div className="block md:hidden space-y-3">
        {filteredExpenses.map(exp => {
          const style = categoryColorStyles[exp.category] || categoryColorStyles.Other;
          const method = getMethodBadge(exp.paymentMethod);
          return (
            <div key={exp.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${style.bg} ${style.text}`}>
                  {exp.category}
                </span>
                <span className="text-xs text-slate-400">{formatDate(exp.date)}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{exp.title || exp.description}</p>
                  {exp.vendor && <p className="text-[11px] text-slate-500 mt-0.5">Vendor: {exp.vendor}</p>}
                  {exp.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{exp.notes}</p>}
                </div>
                <p className="text-base font-black font-mono text-rose-600">
                  {formatCurr(exp.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${method.color}`}>
                  {method.icon}
                  {method.label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(exp)}
                    className="p-1 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(exp)}
                    className="p-1 text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredExpenses.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
            No expenses found.
          </div>
        )}
      </div>

      {/* Expense Form Modal (Add & Edit) */}
      <ExpenseFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default ExpensesPage;

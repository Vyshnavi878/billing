import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  IndianRupee, FileText, Users, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Plus, Receipt, Package,
  CreditCard, TrendingDown, Eye, ChevronRight,
  AlertTriangle, Zap, ShoppingBag, Calendar,
} from 'lucide-react';
import {
  mockDashboardStats,
  mockRevenueData,
  mockTodayData,
  mockMonthData,
  mockInvoices,
  mockProducts,
} from '../data/mockData';

// ─── Utilities ────────────────────────────────────────────────────────────────

const fc = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const fShort = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const fDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

type DateRange = 'today' | 'week' | 'month';

const rangeLabel: Record<DateRange, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
};

const statusCfg = {
  paid:    { label: 'Paid',    cls: 'badge badge-success' },
  pending: { label: 'Pending', cls: 'badge badge-warning' },
  overdue: { label: 'Overdue', cls: 'badge badge-danger'  },
  draft:   { label: 'Draft',   cls: 'badge badge-slate'   },
};

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-sm min-w-[120px]">
      <p className="font-semibold text-slate-600 mb-1.5 text-xs">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 capitalize">
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: p.color }} />
            {p.dataKey === 'revenue' ? 'Sales' : 'Expenses'}
          </span>
          <span className="font-bold text-slate-900 text-xs">{fShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const stats = mockDashboardStats;
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<DateRange>('week');

  const chartData = chartRange === 'today'
    ? mockTodayData
    : chartRange === 'month'
      ? mockMonthData
      : mockRevenueData;

  const pendingInvoices = mockInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const lowStockItems = mockProducts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
  const todayInvoiceCount = 4;
  const todayInvoiceTotal = stats.todaySales;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Date + greeting ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Good morning, Rajesh 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Tuesday, 16 September 2026
          </p>
        </div>
        {/* Mobile: today's sales hero */}
        <div className="sm:hidden bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl px-4 py-3 text-white">
          <p className="text-xs font-medium text-primary-200">Today's Sales</p>
          <p className="text-2xl font-black">{fc(stats.todaySales)}</p>
          <p className="text-xs text-primary-200 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />{stats.todaySalesChange}% vs yesterday
          </p>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      {/* Desktop: 5 cards in a row; Mobile: 2x2 grid (most important first) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {/* Today's Sales — most important */}
        <div id="kpi-today-sales"
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl p-4 lg:p-5 text-white shadow-lg shadow-primary-600/20 hidden sm:flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <IndianRupee className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />{stats.todaySalesChange}%
            </span>
          </div>
          <div>
            <p className="text-2xl font-black leading-tight">{fc(stats.todaySales)}</p>
            <p className="text-xs font-medium text-primary-200 mt-0.5">Today's Sales</p>
            <p className="text-xs text-primary-300 mt-1">vs ₹77,800 yesterday</p>
          </div>
        </div>

        <KPICard
          id="kpi-bills"
          title="Today's Bills"
          value={todayInvoiceCount.toString()}
          subtitle={`${fc(todayInvoiceTotal)} billed`}
          icon={<FileText className="w-4.5 h-4.5" />}
          color="blue"
          change={8.3}
        />
        <KPICard
          id="kpi-revenue"
          title="Total Revenue"
          value={fShort(stats.totalRevenue)}
          subtitle="This month"
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          color="emerald"
          change={stats.revenueChange}
        />
        <KPICard
          id="kpi-pending"
          title="Pending Payments"
          value={fc(stats.pendingAmount)}
          subtitle={`${stats.pendingInvoices} invoices`}
          icon={<Clock className="w-4.5 h-4.5" />}
          color="amber"
          isAlert
        />
        <KPICard
          id="kpi-customers"
          title="Total Customers"
          value={stats.totalCustomers.toString()}
          subtitle="2 added this month"
          icon={<Users className="w-4.5 h-4.5" />}
          color="violet"
          change={stats.customersChange}
        />
      </div>

      {/* ── Main content grid (chart left, sidebar right) ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Sales Overview chart ──────────────────────────────────────── */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Sales Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {rangeLabel[chartRange]} revenue —{' '}
                <span className="text-primary-600 font-semibold">
                  {chartRange === 'today' ? fc(stats.todaySales) : chartRange === 'week' ? '₹5.26L' : fc(stats.totalRevenue)}
                </span>
              </p>
            </div>
            {/* Date range selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
              {(['today', 'week', 'month'] as DateRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${chartRange === r
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {rangeLabel[r]}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-primary-500 inline-block" /> Revenue
              </span>
              {chartRange !== 'today' && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Expenses
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              {chartRange === 'today' ? (
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -12, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => fShort(v)} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => fShort(v)} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: '#f87171', strokeWidth: 0 }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Right sidebar column ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickActionBtn
                icon={<Receipt className="w-4 h-4" />}
                label="Create Invoice"
                color="primary"
                onClick={() => navigate('/billing/create')}
                id="qa-create-invoice"
              />
              <QuickActionBtn
                icon={<Users className="w-4 h-4" />}
                label="Add Customer"
                color="emerald"
                onClick={() => navigate('/customers')}
                id="qa-add-customer"
              />
              <QuickActionBtn
                icon={<Package className="w-4 h-4" />}
                label="Add Product"
                color="violet"
                onClick={() => navigate('/inventory')}
                id="qa-add-product"
              />
              <QuickActionBtn
                icon={<TrendingDown className="w-4 h-4" />}
                label="Record Expense"
                color="orange"
                onClick={() => navigate('/expenses')}
                id="qa-record-expense"
              />
              <QuickActionBtn
                icon={<CreditCard className="w-4 h-4" />}
                label="Record Payment"
                color="blue"
                onClick={() => navigate('/payments')}
                id="qa-record-payment"
                fullWidth
              />
            </div>
          </div>

          {/* Low Stock alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-amber-900 text-sm">Low Stock</h3>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-xs text-amber-700 font-semibold hover:text-amber-900 flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {lowStockItems.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'out_of_stock' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {p.status === 'out_of_stock' ? 'Out of stock' : `${p.stock} left · min ${p.minStock}`}
                      </p>
                    </div>
                    <span className={`badge text-[10px] flex-shrink-0 ${p.status === 'out_of_stock' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.status === 'out_of_stock' ? 'Out' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom grid: Recent Invoices + Pending Payments ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Invoices</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{mockInvoices.length} total</p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.slice(0, 5).map(inv => {
                  const cfg = statusCfg[inv.status as keyof typeof statusCfg] ?? statusCfg.draft;
                  return (
                    <tr
                      key={inv.id}
                      className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                      onClick={() => navigate(`/billing/preview/${inv.id}`)}
                    >
                      <td>
                        <div>
                          <p className="font-mono text-xs font-semibold text-primary-700">{inv.invoiceNumber}</p>
                          <p className="text-[11px] text-slate-400">{fDate(inv.date)}</p>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-medium text-slate-900">{inv.customerName}</p>
                      </td>
                      <td>
                        <p className="font-semibold text-slate-900 text-sm">{fc(inv.total)}</p>
                        {inv.balance > 0 && (
                          <p className="text-[11px] text-red-500">Due: {fc(inv.balance)}</p>
                        )}
                      </td>
                      <td><span className={cfg.cls}>{cfg.label}</span></td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/billing/preview/${inv.id}`);
                          }}
                          className="w-7 h-7 flex items-center justify-center ml-auto rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {mockInvoices.slice(0, 4).map(inv => {
              const cfg = statusCfg[inv.status as keyof typeof statusCfg] ?? statusCfg.draft;
              return (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs font-semibold text-slate-700 truncate">{inv.invoiceNumber}</p>
                      <span className={`${cfg.cls} flex-shrink-0`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{inv.customerName}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">{fDate(inv.date)}</p>
                      <p className="text-sm font-bold text-slate-900">{fc(inv.total)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="px-4 py-3">
              <button
                onClick={() => navigate('/invoices')}
                className="btn-ghost w-full text-xs text-primary-600 justify-center"
              >
                View all invoices <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pending Customer Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pending Payments</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {fc(stats.pendingAmount)} outstanding
              </p>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Due Amount</th>
                  <th>Due Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map(inv => {
                  const isOverdue = inv.status === 'overdue';
                  return (
                    <tr key={inv.id} className={isOverdue ? 'bg-red-50/30' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {inv.customerName.charAt(0)}
                          </div>
                          <p className="text-sm font-medium text-slate-900">{inv.customerName}</p>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-600">{inv.invoiceNumber}</span>
                      </td>
                      <td>
                        <p className={`font-semibold text-sm ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                          {fc(inv.balance)}
                        </p>
                      </td>
                      <td>
                        <div>
                          <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                            {fDate(inv.dueDate)}
                          </p>
                          {isOverdue && (
                            <p className="text-[11px] text-red-500 font-semibold">OVERDUE</p>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate('/payments')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <CreditCard className="w-3 h-3" /> Record
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {pendingInvoices.map(inv => {
              const isOverdue = inv.status === 'overdue';
              return (
                <div key={inv.id} className={`px-4 py-3 ${isOverdue ? 'bg-red-50/40' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {inv.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{inv.customerName}</p>
                        <p className="text-xs text-slate-400">{inv.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                        {fc(inv.balance)}
                      </p>
                      <p className={`text-[11px] ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        {isOverdue ? 'OVERDUE' : `Due ${fDate(inv.dueDate)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/payments')}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl py-2 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Record Payment
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total row */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Outstanding</span>
            <span className="font-bold text-red-600">{fc(stats.pendingAmount)}</span>
          </div>
        </div>
      </div>

      {/* ── Low Stock Products (full table, desktop only) ─────────────────── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Low Stock Products</h3>
            <span className="badge badge-warning">{lowStockItems.length} items</span>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-0.5"
          >
            Manage Inventory <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min. Stock</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{p.sku}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{p.category}</span>
                  </td>
                  <td>
                    <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-slate-500">{p.minStock} {p.unit}</span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'out_of_stock' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => navigate('/inventory')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'violet';
  change?: number;
  isAlert?: boolean;
}

const colorMap: Record<KPICardProps['color'], { icon: string; ring: string }> = {
  blue:   { icon: 'bg-blue-100 text-blue-600',   ring: '' },
  emerald:{ icon: 'bg-emerald-100 text-emerald-600', ring: '' },
  amber:  { icon: 'bg-amber-100 text-amber-600', ring: 'ring-1 ring-amber-200' },
  violet: { icon: 'bg-violet-100 text-violet-600', ring: '' },
};

const KPICard: React.FC<KPICardProps> = ({ id, title, value, subtitle, icon, color, change, isAlert }) => {
  const c = colorMap[color];
  const up = change !== undefined && change >= 0;
  return (
    <div id={id} className={`stat-card ${isAlert ? c.ring : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
        {isAlert && change === undefined && (
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl lg:text-2xl font-black text-slate-900 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

// ─── Quick Action Button ───────────────────────────────────────────────────────

interface QuickActionBtnProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: 'primary' | 'emerald' | 'violet' | 'orange' | 'blue';
  onClick: () => void;
  fullWidth?: boolean;
}

const qaBg: Record<QuickActionBtnProps['color'], string> = {
  primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-100',
  emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100',
  violet:  'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100',
  orange:  'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100',
  blue:    'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100',
};

const QuickActionBtn: React.FC<QuickActionBtnProps> = ({ id, icon, label, color, onClick, fullWidth }) => (
  <button
    id={id}
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${qaBg[color]} ${fullWidth ? 'col-span-2 justify-center' : ''}`}
  >
    {icon}
    {label}
  </button>
);

export default DashboardPage;

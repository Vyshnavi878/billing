import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, IndianRupee, CreditCard, Users, Package,
  ReceiptText, Calculator, Download, Printer, Calendar, ArrowUpRight,
  AlertTriangle, CheckCircle2, Building2, HelpCircle, FileText, ArrowRight,
  Clock, CheckCheck, RefreshCw, Smartphone, Banknote, ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateReportsDashboardKPIs,
  generateSalesReportData,
  generateRevenueReportData,
  generateCustomerReportData,
  generateInventoryReportData,
  generateExpenseReportData,
  generateGSTReportData,
  generatePaymentReportData,
  exportReportCSV,
  formatCurr,
  formatShortCurr,
  BASE_SYSTEM_DATE,
  type DatePreset,
  type DateFilterRange,
} from '../utils/reportUtils';

type ReportTab =
  | 'dashboard'
  | 'sales'
  | 'revenue'
  | 'payments'
  | 'customers'
  | 'inventory'
  | 'expenses'
  | 'gst';

interface TabConfig {
  id: ReportTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REPORT_TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'revenue', label: 'Revenue', icon: IndianRupee },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'gst', label: 'GST', icon: Calculator },
];

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today (16 Sep)' },
  { id: 'yesterday', label: 'Yesterday (15 Sep)' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month (Sep)' },
  { id: 'last_month', label: 'Last Month (Aug)' },
  { id: 'custom', label: 'Custom Range' },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const ReportsPage: React.FC = () => {
  const {
    invoices,
    payments,
    expenses,
    products,
    customers,
    gstSettings,
    store,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-09-16');

  // Date filter object
  const dateFilter: DateFilterRange = useMemo(() => ({
    preset: datePreset,
    startDate: datePreset === 'custom' ? customStart : undefined,
    endDate: datePreset === 'custom' ? customEnd : undefined,
  }), [datePreset, customStart, customEnd]);

  // Human-readable period label
  const periodLabel = useMemo(() => {
    switch (datePreset) {
      case 'today':
        return 'Today · 16 Sep 2026';
      case 'yesterday':
        return 'Yesterday · 15 Sep 2026';
      case 'this_week':
        return 'This Week · 10 Sep - 16 Sep 2026';
      case 'this_month':
        return 'This Month · Sep 2026';
      case 'last_month':
        return 'Last Month · Aug 2026';
      case 'custom':
        return `Custom · ${customStart} to ${customEnd}`;
    }
  }, [datePreset, customStart, customEnd]);

  // Aggregated data for each report
  const dashboardData = useMemo(
    () => calculateReportsDashboardKPIs(invoices, payments, expenses, products, customers, dateFilter),
    [invoices, payments, expenses, products, customers, dateFilter]
  );

  const salesData = useMemo(
    () => generateSalesReportData(invoices, dateFilter),
    [invoices, dateFilter]
  );

  const revenueData = useMemo(
    () => generateRevenueReportData(invoices, payments, dateFilter),
    [invoices, payments, dateFilter]
  );

  const paymentsData = useMemo(
    () => generatePaymentReportData(payments, dateFilter),
    [payments, dateFilter]
  );

  const customersData = useMemo(
    () => generateCustomerReportData(customers, invoices, dateFilter),
    [customers, invoices, dateFilter]
  );

  const inventoryData = useMemo(
    () => generateInventoryReportData(products, invoices),
    [products, invoices]
  );

  const expensesData = useMemo(
    () => generateExpenseReportData(expenses, dateFilter),
    [expenses, dateFilter]
  );

  const gstData = useMemo(
    () => generateGSTReportData(invoices, gstSettings, customers, dateFilter),
    [invoices, gstSettings, customers, dateFilter]
  );

  // CSV Export handler
  const handleExportCSV = () => {
    let reportPayload: any = dashboardData;
    if (activeTab === 'sales') reportPayload = salesData;
    else if (activeTab === 'revenue') reportPayload = revenueData;
    else if (activeTab === 'payments') reportPayload = paymentsData;
    else if (activeTab === 'customers') reportPayload = customersData;
    else if (activeTab === 'inventory') reportPayload = inventoryData;
    else if (activeTab === 'expenses') reportPayload = expensesData;
    else if (activeTab === 'gst') reportPayload = gstData;

    exportReportCSV(activeTab, reportPayload, datePreset);
    showToast(`${REPORT_TABS.find(t => t.id === activeTab)?.label} exported to CSV`, 'success');
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reports & Business Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational intelligence for <strong className="text-slate-800">{store.name}</strong> · {periodLabel}
          </p>
        </div>

        {/* Action Buttons: Print & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary py-2.5 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
            title="Print this report"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-primary py-2.5 px-4 text-xs font-semibold gap-1.5 shadow-md"
            title="Download CSV export"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Global Date Filter Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-slate-400 mr-2 flex-shrink-0 text-xs font-medium pl-1">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
            <span className="hidden sm:inline">Period:</span>
          </div>
          {PRESETS.map(preset => {
            const isSelected = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer
                  ${isSelected
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Date Pickers */}
        {datePreset === 'custom' && (
          <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0 border-slate-100">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="input-base py-1 px-2.5 text-xs text-slate-700 max-w-[140px]"
            />
            <span className="text-xs text-slate-400 font-medium">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="input-base py-1 px-2.5 text-xs text-slate-700 max-w-[140px]"
            />
          </div>
        )}
      </div>

      {/* 3. Sub-Report Navigation Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-x-auto scrollbar-thin">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer
                ${isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Sub-Report Content Area */}
      <div>
        {activeTab === 'dashboard' && renderDashboard(dashboardData, salesData, expensesData)}
        {activeTab === 'sales' && renderSales(salesData)}
        {activeTab === 'revenue' && renderRevenue(revenueData)}
        {activeTab === 'payments' && renderPayments(paymentsData)}
        {activeTab === 'customers' && renderCustomers(customersData)}
        {activeTab === 'inventory' && renderInventory(inventoryData)}
        {activeTab === 'expenses' && renderExpenses(expensesData)}
        {activeTab === 'gst' && renderGST(gstData, store)}
      </div>
    </div>
  );
};

// =========================================================================
// SUB-REPORT 1: DASHBOARD OVERVIEW
// =========================================================================
function renderDashboard(
  data: ReturnType<typeof calculateReportsDashboardKPIs>,
  sales: ReturnType<typeof generateSalesReportData>,
  expenses: ReturnType<typeof generateExpenseReportData>
) {
  const kpis = [
    {
      title: 'Total Sales (Billed)',
      value: formatCurr(data.totalSales),
      subtitle: `${data.invoicesCount} Invoices issued`,
      color: 'border-l-4 border-l-primary-500',
      badge: 'Sales',
    },
    {
      title: 'Total Revenue (Collected)',
      value: formatCurr(data.totalRevenue),
      subtitle: `${data.totalSales > 0 ? Math.round((data.totalRevenue / data.totalSales) * 100) : 0}% Collection rate`,
      color: 'border-l-4 border-l-emerald-500',
      badge: 'Collected',
    },
    {
      title: 'Payments Received',
      value: formatCurr(data.totalPaymentsReceived),
      subtitle: 'Recorded in payment ledger',
      color: 'border-l-4 border-l-blue-500',
      badge: 'Ledger',
    },
    {
      title: 'Pending Payments',
      value: formatCurr(data.pendingPayments),
      subtitle: 'Customer receivables outstanding',
      color: 'border-l-4 border-l-amber-500',
      badge: 'Receivables',
    },
    {
      title: 'Total Expenses',
      value: formatCurr(data.totalExpenses),
      subtitle: `${expenses.expensesCount} Recorded expenses`,
      color: 'border-l-4 border-l-rose-500',
      badge: 'Overhead',
    },
    {
      title: 'Estimated Profit',
      value: formatCurr(data.estimatedProfit),
      subtitle: `${data.profitMargin}% Estimated margin`,
      color: 'border-l-4 border-l-indigo-600',
      badge: 'Net Profit',
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toString(),
      subtitle: 'Registered in store catalog',
      color: 'border-l-4 border-l-violet-500',
      badge: 'Clients',
    },
    {
      title: 'Low-Stock Products',
      value: data.lowStockProductsCount.toString(),
      subtitle: `${data.outOfStockProductsCount} Out of stock`,
      color: 'border-l-4 border-l-red-500',
      badge: 'Alerts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 8 High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-4 shadow-xs border border-slate-100 ${kpi.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {kpi.badge}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {kpi.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Net Profit Summary Showcase Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Business Health Summary
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Estimated Net Profit: {formatCurr(data.estimatedProfit)}
            </h3>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Computed as Total Billed Sales ({formatCurr(data.totalSales)}) minus Operating Expenses ({formatCurr(data.totalExpenses)}).
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 flex-shrink-0">
            <div>
              <p className="text-[11px] text-indigo-200 font-medium uppercase tracking-wider">Profit Margin</p>
              <p className="text-3xl font-black text-emerald-400">{data.profitMargin}%</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-[11px] text-indigo-200 font-medium uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-black text-white">{data.invoicesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Collection Trend */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sales Timeline</h3>
              <p className="text-xs text-slate-400">Daily invoice billing performance</p>
            </div>
            <span className="badge badge-info text-xs">Timeline</span>
          </div>
          <div className="h-64">
            {sales.salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.salesTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatShortCurr(v)} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => formatCurr(Number(val))} />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No sales data recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Expense Distribution</h3>
              <p className="text-xs text-slate-400">Overhead spending breakdown</p>
            </div>
            <span className="badge badge-purple text-xs">Categories</span>
          </div>
          <div className="h-64">
            {expenses.categoryExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenses.categoryExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expenses.categoryExpenses.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurr(Number(val))} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expenses recorded in this period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 2: SALES REPORT
// =========================================================================
function renderSales(sales: ReturnType<typeof generateSalesReportData>) {
  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Billed Sales</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatCurr(sales.totalSales)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Invoices Generated</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{sales.totalInvoices}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Average Order Value</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatCurr(sales.averageInvoiceValue)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Top Product Volume</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {sales.topSellingProducts[0]?.quantity || 0} Units
          </p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Sales & Invoices Trend</h3>
        <p className="text-xs text-slate-400 mb-4">Daily gross billed turnover</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales.salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatShortCurr(v)} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => formatCurr(Number(v))} />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Turnover (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Top-Selling Products by Revenue</h3>
            <p className="text-xs text-slate-400">Products generating the most sales volume</p>
          </div>
          <span className="badge badge-success text-xs">High Demand</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-center">Units Sold</th>
                <th className="text-right">Revenue Generated</th>
                <th className="text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              {sales.topSellingProducts.length > 0 ? (
                sales.topSellingProducts.map((p, idx) => {
                  const share = sales.totalSales > 0 ? Math.round((p.revenue / sales.totalSales) * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{p.name}</span>
                      </td>
                      <td className="text-center font-medium">{p.quantity}</td>
                      <td className="text-right font-bold text-slate-900">{formatCurr(p.revenue)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                            <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                    No products sold in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 3: REVENUE REPORT
// =========================================================================
function renderRevenue(revenue: ReturnType<typeof generateRevenueReportData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Billed</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatCurr(revenue.totalBilled)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Collected</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formatCurr(revenue.totalCollected)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Outstanding Receivables</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{formatCurr(revenue.totalPending)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Collection Efficiency</p>
          <p className="text-xl sm:text-2xl font-black text-primary-600 mt-1">{revenue.collectionEfficiency}%</p>
        </div>
      </div>

      {/* Collection Efficiency Gauge Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Payment Collection Efficiency</h3>
            <p className="text-xs text-slate-400">Ratio of billed sales collected as liquid revenue</p>
          </div>
          <span className="text-2xl font-black text-primary-600">{revenue.collectionEfficiency}% Collected</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${Math.min(100, revenue.collectionEfficiency)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>Collected: {formatCurr(revenue.totalCollected)}</span>
          <span>Unpaid: {formatCurr(revenue.totalPending)}</span>
        </div>
      </div>

      {/* Revenue by Payment Method */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Revenue by Payment Channel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenue.methodDistribution.filter(m => m.amount > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="amount"
                  nameKey="name"
                >
                  {revenue.methodDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurr(Number(v))} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {revenue.methodDistribution.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-800">{m.name}</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatCurr(m.amount)}</span>
                  <span className="text-slate-400 ml-2">({m.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 4: PAYMENT REPORT
// =========================================================================
function renderPayments(payments: ReturnType<typeof generatePaymentReportData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Payments Received</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formatCurr(payments.total)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{payments.count}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Average Transaction Size</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {payments.count > 0 ? formatCurr(Math.round(payments.total / payments.count)) : '₹0'}
          </p>
        </div>
      </div>

      {/* Methods Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {payments.methodBreakdown.map((m, i) => (
          <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs text-center">
            <p className="text-[11px] font-semibold text-slate-500">{m.name}</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{formatCurr(m.amount)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{m.count} txns ({m.percent}%)</p>
          </div>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Payment Ledger</h3>
            <p className="text-xs text-slate-400">All recorded payments matching this date range</p>
          </div>
          <span className="badge badge-info text-xs">{payments.count} Transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.filteredPayments.length > 0 ? (
                payments.filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="text-xs text-slate-500 font-mono">{p.date}</td>
                    <td className="font-mono font-semibold text-primary-600 text-xs">{p.invoiceNumber}</td>
                    <td className="font-medium text-slate-900">{p.customerName}</td>
                    <td>
                      <span className="badge badge-slate text-[10px] uppercase font-bold">{p.method}</span>
                    </td>
                    <td className="text-right font-bold text-emerald-600">{formatCurr(p.amount)}</td>
                    <td className="text-xs text-slate-400 font-mono">{p.reference || '—'}</td>
                    <td>
                      <span className="badge badge-success text-[10px]">Completed</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                    No payment transactions recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 5: CUSTOMER REPORT
// =========================================================================
function renderCustomers(customers: ReturnType<typeof generateCustomerReportData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Customer Directory</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{customers.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Active Customers in Period</p>
          <p className="text-xl sm:text-2xl font-black text-primary-600 mt-1">{customers.activeCustomersInPeriod}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Outstanding Dues</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{formatCurr(customers.totalDues)}</p>
        </div>
      </div>

      {/* Top Customers by Sales */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Top Customers Ranking</h3>
          <p className="text-xs text-slate-400">Ranked by total purchases in selected period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Rank & Customer</th>
                <th>Location</th>
                <th className="text-center">Invoices</th>
                <th className="text-right">Total Purchases</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {customers.topCustomers.length > 0 ? (
                customers.topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{c.customer?.name}</span>
                    </td>
                    <td className="text-xs text-slate-500">{c.customer?.city || '—'}</td>
                    <td className="text-center font-medium">{c.invoicesCount}</td>
                    <td className="text-right font-bold text-slate-900">{formatCurr(c.purchases)}</td>
                    <td className="text-right text-emerald-600 font-medium">{formatCurr(c.paid)}</td>
                    <td className="text-right font-bold text-amber-600">{formatCurr(c.balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No customer purchases recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers with Pending Dues */}
      {customers.customersWithDues.length > 0 && (
        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/70">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-amber-900 text-sm">Outstanding Customer Dues Reminder</h3>
          </div>
          <div className="space-y-2">
            {customers.customersWithDues.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{c.customer?.name}</p>
                  <p className="text-slate-400 text-[11px]">{c.customer?.phone} · {c.customer?.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-amber-700 text-sm">{formatCurr(c.balance)}</p>
                  <p className="text-[10px] text-slate-400">{c.invoicesCount} unpaid invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-REPORT 6: INVENTORY REPORT
// =========================================================================
function renderInventory(inv: ReturnType<typeof generateInventoryReportData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Catalog SKUs</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{inv.totalProducts}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Stock on Hand</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{inv.totalStockUnits} Units</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Catalog Valuation (MRP)</p>
          <p className="text-xl sm:text-2xl font-black text-primary-600 mt-1">{formatCurr(inv.totalCatalogValuation)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Inventory Cost Value</p>
          <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">{formatCurr(inv.totalCostValuation)}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Low & Depleted Stock Items</h3>
              <p className="text-xs text-slate-400">Products requiring immediate reordering</p>
            </div>
          </div>
          <span className="badge badge-warning text-xs">
            {inv.lowStockProducts.length + inv.outOfStockProducts.length} Needs Attention
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="text-center">Current Stock</th>
                <th className="text-center">Min Threshold</th>
                <th className="text-right">Unit Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inv.outOfStockProducts.concat(inv.lowStockProducts).length > 0 ? (
                inv.outOfStockProducts.concat(inv.lowStockProducts).map(p => (
                  <tr key={p.id}>
                    <td className="font-semibold text-slate-900">{p.name}</td>
                    <td className="font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="text-xs text-slate-600">{p.category}</td>
                    <td className="text-center font-bold text-rose-600">{p.stock} {p.unit}</td>
                    <td className="text-center text-xs text-slate-400">{p.minStock} {p.unit}</td>
                    <td className="text-right font-medium">{formatCurr(p.price)}</td>
                    <td>
                      {p.stock === 0 ? (
                        <span className="badge badge-danger text-[10px]">Out of Stock</span>
                      ) : (
                        <span className="badge badge-warning text-[10px]">Low Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                    All inventory stocks are at healthy operating levels!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best-Sellers by Volume */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Best-Selling Products by Volume</h3>
          <p className="text-xs text-slate-400">Total units sold across all invoices</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Rank & Product</th>
                <th className="text-center">Units Sold</th>
                <th className="text-right">Total Revenue</th>
                <th className="text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {inv.bestSellingProducts.map((item, idx) => (
                <tr key={item.product.id}>
                  <td className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{item.product.name}</span>
                  </td>
                  <td className="text-center font-bold text-primary-600">{item.unitsSold} {item.product.unit}</td>
                  <td className="text-right font-semibold">{formatCurr(item.revenue)}</td>
                  <td className="text-right text-xs text-slate-500 font-medium">{item.product.stock} {item.product.unit} remaining</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 7: EXPENSE REPORT
// =========================================================================
function renderExpenses(exp: ReturnType<typeof generateExpenseReportData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Total Overhead Expenses</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{formatCurr(exp.totalExpenses)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Expense Transactions</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{exp.expensesCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Top Expense Driver</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {exp.categoryExpenses[0]?.category || 'None'}
          </p>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Category-Wise Overhead Cost Distribution</h3>
        <div className="space-y-3">
          {exp.categoryExpenses.map((c, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">{c.category} ({c.count} txns)</span>
                <span className="text-slate-900">{formatCurr(c.amount)} ({c.percent}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Expense Ledger</h3>
          <p className="text-xs text-slate-400">Detailed list of overhead outlays</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title / Description</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exp.filteredExpenses.length > 0 ? (
                exp.filteredExpenses.map(e => (
                  <tr key={e.id}>
                    <td className="text-xs text-slate-500 font-mono">{e.date}</td>
                    <td className="font-semibold text-slate-900">{e.title}</td>
                    <td>
                      <span className="badge badge-purple text-[10px]">{e.category}</span>
                    </td>
                    <td className="text-xs text-slate-500">{e.vendor || '—'}</td>
                    <td className="text-xs uppercase font-medium text-slate-600">{e.paymentMethod}</td>
                    <td className="text-right font-bold text-rose-600">{formatCurr(e.amount)}</td>
                    <td>
                      <span className="badge badge-success text-[10px]">{e.status || 'recorded'}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                    No expenses recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-REPORT 8: GST REPORT
// =========================================================================
function renderGST(
  gst: ReturnType<typeof generateGSTReportData>,
  store: { name: string; gstin: string }
) {
  return (
    <div className="space-y-6">
      {/* GST Summary Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-info text-xs mb-1">GSTR Compliance Summary</span>
          <h3 className="text-lg font-bold">GST Turnover & Liability Report</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered Entity: <strong className="text-white">{store.name}</strong> · GSTIN: <span className="font-mono text-emerald-400">{store.gstin || '29AABCK1234L1Z5'}</span>
          </p>
        </div>
        <div className="text-right self-end sm:self-auto">
          <p className="text-xs text-slate-400">Total Tax Liability</p>
          <p className="text-2xl font-black text-emerald-400">{formatCurr(gst.totalTax)}</p>
        </div>
      </div>

      {/* Tax Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Taxable Turnover</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatCurr(gst.taxableSales)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{gst.invoicesCount} Invoices</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Central Tax (CGST)</p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{formatCurr(gst.cgst)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Intrastate 50% Share</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">State Tax (SGST)</p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{formatCurr(gst.sgst)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Intrastate 50% Share</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-500">Integrated Tax (IGST)</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">{formatCurr(gst.igst)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Interstate 100% Tax</p>
        </div>
      </div>

      {/* Statutory Rate Brackets Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Statutory Tax Slab Breakdown</h3>
          <p className="text-xs text-slate-400">Distribution across 0%, 5%, 12%, 18%, and 28% tax slabs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Tax Rate Slab</th>
                <th className="text-right">Taxable Turnover</th>
                <th className="text-right">CGST (₹)</th>
                <th className="text-right">SGST (₹)</th>
                <th className="text-right">IGST (₹)</th>
                <th className="text-right">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody>
              {gst.rateBreakdown && gst.rateBreakdown.length > 0 ? (
                gst.rateBreakdown.map(slab => (
                  <tr key={slab.rate}>
                    <td className="font-bold text-slate-900">
                      <span className="badge badge-slate mr-2">{slab.rate}%</span>
                      {slab.rateLabel}
                    </td>
                    <td className="text-right font-semibold text-slate-800">{formatCurr(slab.taxableValue)}</td>
                    <td className="text-right font-medium text-slate-600">{formatCurr(slab.cgst)}</td>
                    <td className="text-right font-medium text-slate-600">{formatCurr(slab.sgst)}</td>
                    <td className="text-right font-medium text-slate-600">{formatCurr(slab.igst)}</td>
                    <td className="text-right font-bold text-emerald-600">{formatCurr(slab.totalTax)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No GST tax transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainer Alert */}
      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-blue-950">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Statutory Compliance Notice
        </p>
        <p className="leading-relaxed">
          Intrastate sales within your registered home state are split equally between CGST and SGST. Interstate sales are allocated to IGST in full. Verify all numbers before filing quarterly or monthly returns.
        </p>
      </div>
    </div>
  );
}

export default ReportsPage;

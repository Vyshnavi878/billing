import type { Invoice, Payment, Expense, Product, Customer, GSTSettings } from '../types';
import { calculateInvoiceTax, calculateGSTRateBreakdown } from './gstUtils';

export type DatePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom';

export interface DateFilterRange {
  preset: DatePreset;
  startDate?: string;
  endDate?: string;
}

export const BASE_SYSTEM_DATE = '2026-09-16';

/**
 * Checks if a given ISO date string (YYYY-MM-DD) falls within the selected date range
 */
export const isDateInRange = (dateStr?: string, filter?: DateFilterRange): boolean => {
  if (!dateStr) return false;
  if (!filter) return true;

  const date = dateStr.slice(0, 10);

  switch (filter.preset) {
    case 'today':
      return date === BASE_SYSTEM_DATE;
    case 'yesterday':
      return date === '2026-09-15';
    case 'this_week':
      return date >= '2026-09-10' && date <= '2026-09-16';
    case 'this_month':
      return date >= '2026-09-01' && date <= '2026-09-30';
    case 'last_month':
      return date >= '2026-08-01' && date <= '2026-08-31';
    case 'custom':
      if (filter.startDate && filter.endDate) {
        return date >= filter.startDate && date <= filter.endDate;
      }
      if (filter.startDate) return date >= filter.startDate;
      if (filter.endDate) return date <= filter.endDate;
      return true;
    default:
      return true;
  }
};

/**
 * Format Indian Currency (₹)
 */
export const formatCurr = (v: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);

/**
 * Format Short Currency (e.g. ₹4.2L or ₹45K)
 */
export const formatShortCurr = (v: number): string => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};

/**
 * 1. Calculate Reports Dashboard 8 KPIs
 */
export const calculateReportsDashboardKPIs = (
  invoices: Invoice[],
  payments: Payment[],
  expenses: Expense[],
  products: Product[],
  customers: Customer[],
  dateFilter: DateFilterRange
) => {
  // Filter records by date range
  const filteredInvoices = invoices.filter(
    i => i.status !== 'cancelled' && isDateInRange(i.date, dateFilter)
  );

  const filteredPayments = payments.filter(
    p => p.status === 'completed' && isDateInRange(p.date, dateFilter)
  );

  const filteredExpenses = expenses.filter(
    e => isDateInRange(e.date, dateFilter)
  );

  // 1. Total Sales (Billed value)
  const totalSales = filteredInvoices.reduce((sum, i) => sum + i.total, 0);

  // 2. Total Revenue (Collected amount on invoices)
  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.paid, 0);

  // 3. Total Payments Received (From payments ledger)
  const totalPaymentsReceived = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // 4. Pending Payments (Unpaid balance on active invoices)
  const pendingPayments = filteredInvoices.reduce((sum, i) => sum + i.balance, 0);

  // 5. Total Expenses
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 6. Estimated Business Profit Summary & Profit Margin
  const estimatedProfit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? Math.round((estimatedProfit / totalSales) * 100) : 0;

  // 7. Total Customers
  const totalCustomers = customers.length;

  // 8. Low-Stock Products count
  const lowStockProductsCount = products.filter(
    p => p.stock > 0 && p.stock <= (p.minStock || 5)
  ).length;

  const outOfStockProductsCount = products.filter(p => p.stock === 0).length;

  return {
    totalSales,
    totalRevenue,
    totalPaymentsReceived,
    pendingPayments,
    totalExpenses,
    estimatedProfit,
    profitMargin,
    totalCustomers,
    lowStockProductsCount,
    outOfStockProductsCount,
    invoicesCount: filteredInvoices.length,
  };
};

/**
 * 2. Generate Sales Report Data
 */
export const generateSalesReportData = (
  invoices: Invoice[],
  dateFilter: DateFilterRange
) => {
  const filtered = invoices.filter(
    i => i.status !== 'cancelled' && isDateInRange(i.date, dateFilter)
  );

  const totalSales = filtered.reduce((sum, i) => sum + i.total, 0);
  const totalInvoices = filtered.length;
  const averageInvoiceValue = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;

  // Group sales by day for chart
  const dayMap = new Map<string, { sales: number; count: number }>();
  filtered.forEach(inv => {
    const day = inv.date;
    if (!dayMap.has(day)) {
      dayMap.set(day, { sales: 0, count: 0 });
    }
    const cur = dayMap.get(day)!;
    cur.sales += inv.total;
    cur.count += 1;
  });

  const salesTrend = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      sales: data.sales,
      invoices: data.count,
    }));

  // Top-selling products
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  filtered.forEach(inv => {
    (inv.items || []).forEach(item => {
      const key = item.productId || item.productName || item.name || 'Unknown';
      const name = item.productName || item.name || 'Product';
      if (!productMap.has(key)) {
        productMap.set(key, { name, quantity: 0, revenue: 0 });
      }
      const p = productMap.get(key)!;
      p.quantity += item.quantity || 0;
      p.revenue += item.total || 0;
    });
  });

  const topSellingProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    totalSales,
    totalInvoices,
    averageInvoiceValue,
    salesTrend,
    topSellingProducts,
    filteredInvoices: filtered,
  };
};

/**
 * 3. Generate Revenue Report Data
 */
export const generateRevenueReportData = (
  invoices: Invoice[],
  payments: Payment[],
  dateFilter: DateFilterRange
) => {
  const filteredInvoices = invoices.filter(
    i => i.status !== 'cancelled' && isDateInRange(i.date, dateFilter)
  );

  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.paid, 0);
  const totalPending = filteredInvoices.reduce((sum, i) => sum + i.balance, 0);
  const collectionEfficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  // Breakdown by payment method
  const methodMap: Record<string, number> = {
    UPI: 0,
    Cash: 0,
    Card: 0,
    'Bank Transfer': 0,
    Other: 0,
  };

  const filteredPayments = payments.filter(
    p => p.status === 'completed' && isDateInRange(p.date, dateFilter)
  );

  filteredPayments.forEach(p => {
    const m = (p.method || '').toLowerCase();
    if (m === 'upi') methodMap.UPI += p.amount;
    else if (m === 'cash') methodMap.Cash += p.amount;
    else if (m === 'card') methodMap.Card += p.amount;
    else if (m === 'bank_transfer') methodMap['Bank Transfer'] += p.amount;
    else methodMap.Other += p.amount;
  });

  const methodDistribution = Object.entries(methodMap).map(([name, amount]) => ({
    name,
    amount,
    percent: totalCollected > 0 ? Math.round((amount / (filteredPayments.reduce((s, p) => s + p.amount, 0) || 1)) * 100) : 0,
  }));

  return {
    totalBilled,
    totalCollected,
    totalPending,
    collectionEfficiency,
    methodDistribution,
    paymentsCount: filteredPayments.length,
  };
};

/**
 * 4. Generate Customer Report Data
 */
export const generateCustomerReportData = (
  customers: Customer[],
  invoices: Invoice[],
  dateFilter: DateFilterRange
) => {
  const filteredInvoices = invoices.filter(
    i => i.status !== 'cancelled' && isDateInRange(i.date, dateFilter)
  );

  // Group customer purchases
  const custMap = new Map<string, {
    customer: Customer;
    purchases: number;
    paid: number;
    balance: number;
    invoicesCount: number;
  }>();

  customers.forEach(c => {
    custMap.set(c.id, {
      customer: c,
      purchases: 0,
      paid: 0,
      balance: 0,
      invoicesCount: 0,
    });
  });

  filteredInvoices.forEach(inv => {
    const cId = inv.customerId;
    if (custMap.has(cId)) {
      const entry = custMap.get(cId)!;
      entry.purchases += inv.total;
      entry.paid += inv.paid;
      entry.balance += inv.balance;
      entry.invoicesCount += 1;
    }
  });

  const customerRows = Array.from(custMap.values());

  // Top Customers by sales
  const topCustomers = [...customerRows]
    .filter(c => c.purchases > 0)
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 8);

  // Customers with pending balances
  const customersWithDues = [...customerRows]
    .filter(c => c.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const totalDues = customersWithDues.reduce((s, c) => s + c.balance, 0);

  return {
    totalCustomers: customers.length,
    activeCustomersInPeriod: customerRows.filter(c => c.invoicesCount > 0).length,
    topCustomers,
    customersWithDues,
    totalDues,
  };
};

/**
 * 5. Generate Inventory Report Data
 */
export const generateInventoryReportData = (
  products: Product[],
  invoices: Invoice[]
) => {
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCatalogValuation = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalCostValuation = products.reduce((sum, p) => sum + (p.stock * (p.costPrice || p.price * 0.7)), 0);

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Best selling products from all active invoices
  const itemMap = new Map<string, { product: Product; unitsSold: number; revenue: number }>();
  products.forEach(p => {
    itemMap.set(p.id, { product: p, unitsSold: 0, revenue: 0 });
  });

  invoices.filter(i => i.status !== 'cancelled').forEach(inv => {
    (inv.items || []).forEach(item => {
      if (itemMap.has(item.productId)) {
        const entry = itemMap.get(item.productId)!;
        entry.unitsSold += item.quantity || 0;
        entry.revenue += item.total || 0;
      }
    });
  });

  const bestSellingProducts = Array.from(itemMap.values())
    .filter(e => e.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 8);

  return {
    totalProducts,
    totalStockUnits,
    totalCatalogValuation,
    totalCostValuation,
    lowStockProducts,
    outOfStockProducts,
    bestSellingProducts,
  };
};

/**
 * 6. Generate Expense Report Data
 */
export const generateExpenseReportData = (
  expenses: Expense[],
  dateFilter: DateFilterRange
) => {
  const filtered = expenses.filter(e => isDateInRange(e.date, dateFilter));
  const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);

  // Category wise
  const catMap = new Map<string, { total: number; count: number }>();
  filtered.forEach(exp => {
    const cat = exp.category || 'Other';
    if (!catMap.has(cat)) catMap.set(cat, { total: 0, count: 0 });
    const cur = catMap.get(cat)!;
    cur.total += exp.amount;
    cur.count += 1;
  });

  const categoryExpenses = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.total,
      count: data.count,
      percent: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Expense timeline by day
  const dayMap = new Map<string, number>();
  filtered.forEach(exp => {
    const day = exp.date;
    dayMap.set(day, (dayMap.get(day) || 0) + exp.amount);
  });

  const expenseTrend = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount,
    }));

  return {
    totalExpenses,
    expensesCount: filtered.length,
    categoryExpenses,
    expenseTrend,
    filteredExpenses: filtered,
  };
};

/**
 * 7. Generate GST Report Data
 */
export const generateGSTReportData = (
  invoices: Invoice[],
  gstSettings: GSTSettings,
  customers: Customer[],
  dateFilter: DateFilterRange
) => {
  const filtered = invoices.filter(
    i => i.status !== 'cancelled' && isDateInRange(i.date, dateFilter)
  );

  let taxableSales = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let totalTax = 0;
  let totalInvoicesAmount = 0;

  filtered.forEach(inv => {
    const tax = calculateInvoiceTax(inv, gstSettings.stateCode, customers);
    taxableSales += tax.taxableValue;
    cgst += tax.cgst;
    sgst += tax.sgst;
    igst += tax.igst;
    totalTax += tax.totalTax;
    totalInvoicesAmount += inv.total;
  });

  const rateBreakdown = calculateGSTRateBreakdown(filtered, gstSettings.stateCode, customers);

  return {
    invoicesCount: filtered.length,
    taxableSales: Math.round(taxableSales),
    cgst: Math.round(cgst),
    sgst: Math.round(sgst),
    igst: Math.round(igst),
    totalTax: Math.round(totalTax),
    totalInvoicesAmount: Math.round(totalInvoicesAmount),
    rateBreakdown,
    filteredInvoices: filtered,
  };
};

/**
 * 8. Generate Payment Report Data
 */
export const generatePaymentReportData = (
  payments: Payment[],
  dateFilter: DateFilterRange
) => {
  const filtered = payments.filter(
    p => p.status === 'completed' && isDateInRange(p.date, dateFilter)
  );

  const total = filtered.reduce((s, p) => s + p.amount, 0);

  const methodMap: Record<string, { amount: number; count: number }> = {
    UPI: { amount: 0, count: 0 },
    Cash: { amount: 0, count: 0 },
    Card: { amount: 0, count: 0 },
    'Bank Transfer': { amount: 0, count: 0 },
    Other: { amount: 0, count: 0 },
  };

  filtered.forEach(p => {
    const m = (p.method || '').toLowerCase();
    if (m === 'upi') { methodMap.UPI.amount += p.amount; methodMap.UPI.count += 1; }
    else if (m === 'cash') { methodMap.Cash.amount += p.amount; methodMap.Cash.count += 1; }
    else if (m === 'card') { methodMap.Card.amount += p.amount; methodMap.Card.count += 1; }
    else if (m === 'bank_transfer') { methodMap['Bank Transfer'].amount += p.amount; methodMap['Bank Transfer'].count += 1; }
    else { methodMap.Other.amount += p.amount; methodMap.Other.count += 1; }
  });

  const methodBreakdown = Object.entries(methodMap).map(([name, data]) => ({
    name,
    amount: data.amount,
    count: data.count,
    percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
  }));

  // Daily collection trend
  const dayMap = new Map<string, number>();
  filtered.forEach(p => {
    dayMap.set(p.date, (dayMap.get(p.date) || 0) + p.amount);
  });
  const collectionTrend = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount,
    }));

  return {
    total,
    count: filtered.length,
    methodBreakdown,
    collectionTrend,
    filteredPayments: filtered,
  };
};

/**
 * Universal CSV Export Generator
 */
type ReportType = 'dashboard' | 'sales' | 'revenue' | 'payments' | 'customers' | 'inventory' | 'expenses' | 'gst';

export const exportReportCSV = (
  reportType: ReportType,
  data: any,
  period: string
): void => {
  let rows: string[][] = [];
  let filename = `billflow-${reportType}-report-${period}.csv`;

  switch (reportType) {
    case 'dashboard':
      rows = [
        ['BillFlow Pro – Dashboard KPIs', '', `Period: ${period}`],
        [],
        ['Metric', 'Value'],
        ['Total Sales (Billed)', `₹${(data.totalSales || 0).toFixed(0)}`],
        ['Total Revenue (Collected)', `₹${(data.totalRevenue || 0).toFixed(0)}`],
        ['Total Payments Received', `₹${(data.totalPaymentsReceived || 0).toFixed(0)}`],
        ['Pending Payments', `₹${(data.pendingPayments || 0).toFixed(0)}`],
        ['Total Expenses', `₹${(data.totalExpenses || 0).toFixed(0)}`],
        ['Estimated Profit', `₹${(data.estimatedProfit || 0).toFixed(0)}`],
        ['Profit Margin', `${data.profitMargin || 0}%`],
        ['Total Customers', `${data.totalCustomers || 0}`],
        ['Low-Stock Products', `${data.lowStockProductsCount || 0}`],
        ['Out-of-Stock Products', `${data.outOfStockProductsCount || 0}`],
      ];
      break;

    case 'sales':
      rows = [
        ['BillFlow Pro – Sales Report', '', `Period: ${period}`],
        [],
        ['Invoice Number', 'Customer', 'Date', 'Items', 'Subtotal', 'Discount', 'GST', 'Total', 'Paid', 'Balance', 'Status'],
        ...(data.filteredInvoices || []).map((inv: Invoice) => [
          inv.invoiceNumber,
          inv.customerName,
          inv.date,
          String((inv.items || []).length),
          String(inv.subtotal),
          String(inv.discount),
          String(inv.gst),
          String(inv.total),
          String(inv.paid),
          String(inv.balance),
          inv.status,
        ]),
      ];
      break;

    case 'revenue':
      rows = [
        ['BillFlow Pro – Revenue Report', '', `Period: ${period}`],
        [],
        ['Metric', 'Value'],
        ['Total Billed', `₹${(data.totalBilled || 0).toFixed(0)}`],
        ['Total Collected', `₹${(data.totalCollected || 0).toFixed(0)}`],
        ['Total Pending', `₹${(data.totalPending || 0).toFixed(0)}`],
        ['Collection Efficiency', `${data.collectionEfficiency || 0}%`],
        [],
        ['Payment Method', 'Amount', 'Share (%)'],
        ...(data.methodDistribution || []).map((m: any) => [m.name, `₹${m.amount}`, `${m.percent}%`]),
      ];
      break;

    case 'payments':
      rows = [
        ['BillFlow Pro – Payment Transactions', '', `Period: ${period}`],
        [],
        ['Date', 'Invoice No', 'Customer', 'Method', 'Amount', 'Reference', 'Status'],
        ...(data.filteredPayments || []).map((p: Payment) => [
          p.date,
          p.invoiceNumber,
          p.customerName,
          p.method,
          String(p.amount),
          p.reference || '',
          p.status,
        ]),
      ];
      break;

    case 'customers':
      rows = [
        ['BillFlow Pro – Customer Report', '', `Period: ${period}`],
        [],
        ['Customer Name', 'City', 'Invoices', 'Total Purchases', 'Paid', 'Pending Dues'],
        ...(data.topCustomers || []).map((c: any) => [
          c.customer?.name || '',
          c.customer?.city || '',
          String(c.invoicesCount),
          String(c.purchases),
          String(c.paid),
          String(c.balance),
        ]),
      ];
      break;

    case 'inventory':
      rows = [
        ['BillFlow Pro – Inventory Report', '', `Period: ${period}`],
        [],
        ['Product', 'SKU', 'Category', 'Stock', 'Min Stock', 'Unit', 'MRP', 'Cost Price', 'Status', 'Stock Value'],
        ...(data.lowStockProducts || []).concat(data.outOfStockProducts || []).map((p: Product) => [
          p.name, p.sku, p.category, String(p.stock), String(p.minStock),
          p.unit, String(p.price), String(p.costPrice), p.status,
          String(p.stock * p.price),
        ]),
      ];
      break;

    case 'expenses':
      rows = [
        ['BillFlow Pro – Expense Report', '', `Period: ${period}`],
        [],
        ['Date', 'Title', 'Category', 'Vendor', 'Amount', 'Payment Method', 'Status'],
        ...(data.filteredExpenses || []).map((e: Expense) => [
          e.date, e.title, e.category, e.vendor || '', String(e.amount),
          e.paymentMethod, e.status || 'recorded',
        ]),
      ];
      break;

    case 'gst':
      rows = [
        ['BillFlow Pro – GST Report', '', `Period: ${period}`],
        [],
        ['Metric', 'Value'],
        ['Total Invoices', String(data.invoicesCount)],
        ['Taxable Turnover', `₹${data.taxableSales}`],
        ['Output CGST', `₹${data.cgst}`],
        ['Output SGST', `₹${data.sgst}`],
        ['Output IGST', `₹${data.igst}`],
        ['Total Output Tax', `₹${data.totalTax}`],
        ['Total Invoice Amount', `₹${data.totalInvoicesAmount}`],
      ];
      break;
  }

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

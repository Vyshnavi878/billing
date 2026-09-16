// Types for the billing application

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
}

export interface Store {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  gstin?: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  status: 'active' | 'inactive';
  avatar?: string;
  notes?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  hsnCode: string;
  gstRate: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;
  openingStock?: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'increase' | 'decrease' | 'sale' | 'return' | 'initial';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
  notes?: string;
  reference?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  name?: string;
  quantity: number;
  unit: string;
  price: number;
  rate?: number;
  discount: number;
  gstRate: number;
  total: number;
  hsnCode?: string;
}

export interface SalesReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  gstRate: number;
  refundAmount: number;
  reason: string;
}

export interface SalesReturn {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  items: SalesReturnItem[];
  totalRefund: number;
  refundMethod: 'cash' | 'upi' | 'store_credit' | 'bank_transfer';
  reason: string;
  status: 'completed' | 'pending';
}

export interface InvoicePaymentRecord {
  id: string;
  amount: number;
  method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  date: string;
  reference?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  customerAddress?: string;
  customerEmail?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paid: number;
  balance: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  paymentRecords?: InvoicePaymentRecord[];
  salesReturns?: SalesReturn[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerId?: string;
  amount: number;
  method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other';
  date: string;
  reference?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  notes?: string;
  vendor?: string;
  description?: string;
  receipt?: string;
  status?: 'recorded' | 'pending';
}

export type NotificationCategory = 'payments' | 'inventory' | 'billing' | 'expenses' | 'gst';
export type NotificationType = 'invoice' | 'payment' | 'stock' | 'reminder' | 'gst' | 'expense' | 'billing';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  targetPath?: string;
  actionLabel?: string;
}

export interface DashboardStats {
  todaySales: number;
  todaySalesChange: number;
  totalCustomers: number;
  customersChange: number;
  pendingInvoices: number;
  pendingAmount: number;
  gstPayable: number;
  gstPeriod: string;
  totalExpenses: number;
  expensesChange: number;
  totalRevenue: number;
  revenueChange: number;
}

export interface RevenueData {
  day: string;
  revenue: number;
  expenses: number;
}

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  showLogo: boolean;
  termsAndConditions: string;
  footerText: string;
  accentColor: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  details?: string;
  icon?: string;
}

export interface GSTSettings {
  gstin: string;
  businessState: string;
  stateCode: string;
  defaultGstRate: number;
  taxScheme: 'regular' | 'composition';
  enableRCM: boolean;
  eWayBillThreshold: number;
  priceInclusiveTax?: boolean;
}

export interface GSTInvoiceReportRow {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  placeOfSupply: string;
  supplyType: 'intra' | 'inter';
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  invoiceTotal: number;
  status: string;
}

export interface GSTRateBreakdown {
  rate: number;
  rateLabel: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}


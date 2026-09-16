import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Owner, Store, Invoice, Product, Customer, Payment, Expense, StockMovement, InvoiceSettings, PaymentMethodConfig, GSTSettings, Notification } from '../types';
import { mockOwner, mockStore, mockInvoices, mockProducts, mockCustomers, mockPayments, mockExpenses, mockStockMovements, mockNotifications } from '../data/mockData';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  owner: Owner;
  store: Store;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  payments: Payment[];
  expenses: Expense[];
  expenseCategories: string[];
  stockMovements: StockMovement[];
  invoiceSettings: InvoiceSettings;
  paymentMethods: PaymentMethodConfig[];
  gstSettings: GSTSettings;
  toast: ToastNotification | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  deletePayment: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (category: string) => void;
  updateStore: (data: Partial<Store>) => void;
  updateOwner: (data: Partial<Owner>) => void;
  updateInvoiceSettings: (data: Partial<InvoiceSettings>) => void;
  updatePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  updateGstSettings: (data: Partial<GSTSettings>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  getInvoice: (idOrNumber: string) => Invoice | undefined;
  recordPayment: (invoiceId: string, payment: { amount: number; method: any; date?: string; reference?: string; notes?: string }) => void;
  cancelInvoice: (invoiceId: string, reason: string) => void;
  createSalesReturn: (invoiceId: string, returnData: { items: any[]; refundMethod: any; reason: string }) => any;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, adjustment: { type: 'increase' | 'decrease'; quantity: number; reason: string; notes?: string }) => void;
  addCustomer: (custData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastPurchase'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('billing_auth') !== 'false';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([
    'Rent',
    'Salaries',
    'Electricity',
    'Transport',
    'Marketing',
    'Maintenance',
    'Stationery',
    'Internet',
    'Tea & Refreshments',
    'Other',
  ]);

  // Settings states
  const [store, setStore] = useState<Store>(mockStore);
  const [owner, setOwner] = useState<Owner>(mockOwner);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: 'INV-2026-',
    nextNumber: 90,
    showLogo: true,
    termsAndConditions: '1. Goods once sold will not be taken back or exchanged.\n2. Payment is due within 15 days from the date of invoice.\n3. All disputes are subject to local jurisdiction.',
    footerText: 'Thank you for choosing Kumar Enterprises!',
    accentColor: '#4f46e5',
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
    { id: 'upi', name: 'UPI / QR', enabled: true, isDefault: true, details: 'kumar@icici' },
    { id: 'cash', name: 'Cash', enabled: true, isDefault: false, details: 'Counter Cash' },
    { id: 'card', name: 'Card Swipe', enabled: true, isDefault: false, details: 'POS Terminal' },
    { id: 'bank_transfer', name: 'Bank Transfer (NEFT/RTGS)', enabled: true, isDefault: false, details: 'ICICI Bank A/C: 002105001234, IFSC: ICIC0000021' },
    { id: 'other', name: 'Other', enabled: true, isDefault: false, details: 'Cheque / Draft' },
  ]);
  const [gstSettings, setGstSettings] = useState<GSTSettings>({
    gstin: '29AABCK1234L1Z5',
    businessState: 'Karnataka',
    stateCode: '29',
    defaultGstRate: 18,
    taxScheme: 'regular',
    enableRCM: false,
    eWayBillThreshold: 50000,
  });
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3000);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification deleted', 'info');
  }, [showToast]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    showToast('All notifications cleared', 'info');
  }, [showToast]);

  const updateStore = useCallback((data: Partial<Store>) => {
    setStore(prev => ({ ...prev, ...data }));
    showToast('Business profile updated successfully');
  }, [showToast]);

  const updateOwner = useCallback((data: Partial<Owner>) => {
    setOwner(prev => ({ ...prev, ...data }));
    showToast('Account details saved');
  }, [showToast]);

  const updateInvoiceSettings = useCallback((data: Partial<InvoiceSettings>) => {
    setInvoiceSettings(prev => ({ ...prev, ...data }));
    showToast('Invoice preferences updated');
  }, [showToast]);

  const updatePaymentMethods = useCallback((methods: PaymentMethodConfig[]) => {
    setPaymentMethods(methods);
    showToast('Payment methods updated');
  }, [showToast]);

  const updateGstSettings = useCallback((data: Partial<GSTSettings>) => {
    setGstSettings(prev => ({ ...prev, ...data }));
    showToast('GST configuration saved');
  }, [showToast]);

  const addProduct = useCallback((prodData: Omit<Product, 'id'>) => {
    const stock = Number(prodData.stock) || 0;
    const minStock = Number(prodData.minStock) || 5;
    const status: Product['status'] = stock === 0 ? 'out_of_stock' : stock <= minStock ? 'low_stock' : 'in_stock';
    const newProduct: Product = {
      ...prodData,
      id: `p-${Date.now()}`,
      stock,
      minStock,
      status,
    };
    setProducts(prev => [newProduct, ...prev]);

    if (stock > 0) {
      setStockMovements(prev => [
        {
          id: `sm-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'initial',
          quantity: stock,
          previousStock: 0,
          newStock: stock,
          date: new Date().toISOString().slice(0, 10),
          reason: 'Initial opening stock entered',
        },
        ...prev,
      ]);
    }
    return newProduct;
  }, []);

  const updateProduct = useCallback((updated: Product) => {
    const stock = Number(updated.stock) || 0;
    const minStock = Number(updated.minStock) || 5;
    const status: Product['status'] = stock === 0 ? 'out_of_stock' : stock <= minStock ? 'low_stock' : 'in_stock';
    setProducts(prev => prev.map(p => (p.id === updated.id ? { ...updated, stock, minStock, status } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const adjustStock = useCallback((productId: string, adjustment: { type: 'increase' | 'decrease'; quantity: number; reason: string; notes?: string }) => {
    let affectedProduct: Product | undefined;
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      affectedProduct = p;
      const change = Number(adjustment.quantity) || 0;
      const newStock = adjustment.type === 'increase' ? p.stock + change : Math.max(0, p.stock - change);
      const status: Product['status'] = newStock === 0 ? 'out_of_stock' : newStock <= p.minStock ? 'low_stock' : 'in_stock';
      return {
        ...p,
        stock: newStock,
        status,
      };
    }));

    if (affectedProduct) {
      const prod = affectedProduct as Product;
      const change = Number(adjustment.quantity) || 0;
      const newStock = adjustment.type === 'increase' ? prod.stock + change : Math.max(0, prod.stock - change);
      setStockMovements(prev => [
        {
          id: `sm-${Date.now()}`,
          productId,
          productName: prod.name,
          type: adjustment.type,
          quantity: change,
          previousStock: prod.stock,
          newStock,
          date: new Date().toISOString().slice(0, 10),
          reason: adjustment.reason,
          notes: adjustment.notes,
        },
        ...prev,
      ]);
    }
  }, []);

  const addCustomer = useCallback((custData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastPurchase'>) => {
    const newCust: Customer = {
      ...custData,
      id: `c-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
      lastPurchase: new Date().toISOString().slice(0, 10),
      status: custData.status || 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomers(prev => [newCust, ...prev]);
    showToast(`Customer "${newCust.name}" added successfully`);
    return newCust;
  }, [showToast]);

  const updateCustomer = useCallback((updated: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    showToast(`Customer "${updated.name}" updated`);
  }, [showToast]);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast('Customer record removed');
  }, [showToast]);

  const getCustomer = useCallback((id: string) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  const addPayment = useCallback((paymentData: Omit<Payment, 'id'>) => {
    const newPay: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments(prev => [newPay, ...prev]);

    // Update target invoice if provided
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== paymentData.invoiceId && inv.invoiceNumber !== paymentData.invoiceNumber) return inv;
      const newPaid = inv.paid + paymentData.amount;
      const newBalance = Math.max(0, inv.total - newPaid);
      const newStatus = newBalance === 0 ? 'paid' : 'partial';
      const record = {
        id: `pr-${Date.now()}`,
        amount: paymentData.amount,
        method: paymentData.method as any,
        date: paymentData.date,
        reference: paymentData.reference,
        notes: paymentData.notes,
      };
      return {
        ...inv,
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
        paymentRecords: [record, ...(inv.paymentRecords || [])],
      };
    }));

    showToast(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} recorded`);
    return newPay;
  }, [showToast]);

  const deletePayment = useCallback((id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    showToast('Payment transaction removed');
  }, [showToast]);

  const addExpense = useCallback((expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      status: expData.status || 'recorded',
    };
    setExpenses(prev => [newExp, ...prev]);
    showToast(`Expense "${newExp.title}" added`);
    return newExp;
  }, [showToast]);

  const updateExpense = useCallback((updated: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    showToast(`Expense "${updated.title}" updated`);
  }, [showToast]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense record deleted');
  }, [showToast]);

  const addExpenseCategory = useCallback((cat: string) => {
    if (!cat.trim()) return;
    setExpenseCategories(prev => (prev.includes(cat.trim()) ? prev : [...prev, cat.trim()]));
    showToast(`Category "${cat.trim()}" added`);
  }, [showToast]);

  const addInvoice = useCallback((newInv: Invoice) => {
    setInvoices(prev => [newInv, ...prev.filter(i => i.id !== newInv.id && i.invoiceNumber !== newInv.invoiceNumber)]);
  }, []);

  const updateInvoice = useCallback((updated: Invoice) => {
    setInvoices(prev => prev.map(i => (i.id === updated.id || i.invoiceNumber === updated.invoiceNumber ? updated : i)));
  }, []);

  const getInvoice = useCallback((idOrNumber: string) => {
    return invoices.find(i => i.id === idOrNumber || i.invoiceNumber === idOrNumber);
  }, [invoices]);

  const recordPayment = useCallback((invoiceId: string, payment: { amount: number; method: any; date?: string; reference?: string; notes?: string }) => {
    let matchedInv: Invoice | undefined;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId && inv.invoiceNumber !== invoiceId) return inv;
      matchedInv = inv;
      const newPaid = inv.paid + payment.amount;
      const newBalance = Math.max(0, inv.total - newPaid);
      const newStatus = newBalance === 0 ? 'paid' : 'partial';
      const newPaymentRecord = {
        id: `pr-${Date.now()}`,
        amount: payment.amount,
        method: payment.method,
        date: payment.date || new Date().toISOString().slice(0, 10),
        reference: payment.reference,
        notes: payment.notes,
      };

      return {
        ...inv,
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod: payment.method ? String(payment.method).toUpperCase() : inv.paymentMethod,
        paymentRecords: [newPaymentRecord, ...(inv.paymentRecords || [])],
      };
    }));

    if (matchedInv) {
      const inv = matchedInv as Invoice;
      const payRecord: Payment = {
        id: `pay-${Date.now()}`,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerId: inv.customerId,
        amount: payment.amount,
        method: (payment.method || 'cash') as any,
        date: payment.date || new Date().toISOString().slice(0, 10),
        reference: payment.reference,
        notes: payment.notes,
        status: 'completed',
      };
      setPayments(prev => [payRecord, ...prev]);
    }
  }, []);

  const cancelInvoice = useCallback((invoiceId: string, reason: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId && inv.invoiceNumber !== invoiceId) return inv;
      return {
        ...inv,
        status: 'cancelled',
        cancelledAt: new Date().toISOString().slice(0, 10),
        cancelledReason: reason,
      };
    }));
  }, []);

  const createSalesReturn = useCallback((invoiceId: string, returnData: { items: any[]; refundMethod: any; reason: string }) => {
    let createdReturn: any = null;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId && inv.invoiceNumber !== invoiceId) return inv;

      const totalRefund = returnData.items.reduce((s, i) => s + (Number(i.refundAmount) || 0), 0);
      createdReturn = {
        id: `sr-${Date.now()}`,
        creditNoteNumber: `CN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        date: new Date().toISOString().slice(0, 10),
        items: returnData.items,
        totalRefund,
        refundMethod: returnData.refundMethod,
        reason: returnData.reason,
        status: 'completed',
      };

      return {
        ...inv,
        salesReturns: [createdReturn, ...(inv.salesReturns || [])],
      };
    }));
    return createdReturn;
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && _password.length >= 6) {
      localStorage.setItem('billing_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.setItem('billing_auth', 'false');
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <AppContext.Provider value={{
      owner,
      store,
      isAuthenticated,
      sidebarCollapsed,
      mobileMenuOpen,
      invoices,
      products,
      customers,
      payments,
      expenses,
      expenseCategories,
      stockMovements,
      invoiceSettings,
      paymentMethods,
      gstSettings,
      toast,
      notifications,
      unreadNotificationsCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearAllNotifications,
      addPayment,
      deletePayment,
      addExpense,
      updateExpense,
      deleteExpense,
      addExpenseCategory,
      updateStore,
      updateOwner,
      updateInvoiceSettings,
      updatePaymentMethods,
      updateGstSettings,
      showToast,
      addInvoice,
      updateInvoice,
      getInvoice,
      recordPayment,
      cancelInvoice,
      createSalesReturn,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomer,
      login,
      logout,
      toggleSidebar,
      toggleMobileMenu,
      closeMobileMenu,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

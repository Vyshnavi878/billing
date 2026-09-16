import type { Customer, Product, Invoice, Payment, Expense, Notification, DashboardStats, RevenueData, Owner, Store, StockMovement } from '../types';

// ─── Owner / Store ────────────────────────────────────────────────────────────

export const mockOwner: Owner = {
  id: 'owner-1',
  name: 'Rajesh Kumar',
  email: 'rajesh@billflow.in',
  phone: '+91 98765 43210',
  role: 'Store Owner',
};

export const mockStore: Store = {
  id: 'store-1',
  name: 'Kumar Enterprises',
  tagline: 'Quality & Trust Since 2010',
  address: '42, MG Road, Near City Mall',
  city: 'Bengaluru',
  state: 'Karnataka',
  gstin: '29AABCK1234L1Z5',
  phone: '+91 80 4567 8901',
  email: 'info@kumarenterprises.in',
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const mockCustomers: Customer[] = [
  { id: 'c-1', name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 99887 76655', address: '15 Park Street', city: 'Bengaluru', state: 'Karnataka (29)', gstin: '29BBBCP1234M1Z3', totalOrders: 24, totalSpent: 184500, lastPurchase: '2026-09-15', status: 'active', notes: 'Key retail customer. Prefers UPI payment on delivery.', createdAt: '2025-11-12' },
  { id: 'c-2', name: 'Amit Verma', email: 'amit.v@business.com', phone: '+91 97654 32109', address: '8 Commercial Road', city: 'Mysuru', state: 'Karnataka (29)', gstin: '29CCCAV5678N2Z1', totalOrders: 18, totalSpent: 256000, lastPurchase: '2026-09-14', status: 'active', notes: 'Wholesale furniture contractor. 15-day payment terms.', createdAt: '2025-08-20' },
  { id: 'c-3', name: 'Sunita Rao', email: 'sunita.rao@mail.com', phone: '+91 96543 21098', address: '22 Gandhi Nagar', city: 'Hubli', state: 'Karnataka (29)', totalOrders: 9, totalSpent: 67800, lastPurchase: '2026-09-10', status: 'active', notes: 'Regular stationery supplies for local academy.', createdAt: '2026-01-15' },
  { id: 'c-4', name: 'Kiran Patel', email: 'kiran.patel@kirana.in', phone: '+91 95432 10987', address: '5 Market Lane', city: 'Mangaluru', state: 'Karnataka (29)', gstin: '29DDDKP9012O3Z4', totalOrders: 31, totalSpent: 432100, lastPurchase: '2026-09-13', status: 'active', notes: 'Electrical goods bulk distributor. Prompt payer.', createdAt: '2025-06-04' },
  { id: 'c-5', name: 'Meera Nair', email: 'meera.n@outlook.com', phone: '+91 94321 09876', address: '77 Ring Road', city: 'Bengaluru', state: 'Karnataka (29)', totalOrders: 5, totalSpent: 28900, lastPurchase: '2026-08-22', status: 'inactive', notes: 'Occasional buyer. Inactive over past 30 days.', createdAt: '2026-03-10' },
  { id: 'c-6', name: 'Suresh Babu', email: 'sbabu@wholesale.com', phone: '+91 93210 98765', address: '33 Industrial Area', city: 'Belgaum', state: 'Karnataka (29)', gstin: '29EEESB3456P4Z7', totalOrders: 47, totalSpent: 891200, lastPurchase: '2026-09-16', status: 'active', notes: 'VIP customer. Largest wholesale buyer of electronics and hardware.', createdAt: '2025-02-18' },
  { id: 'c-7', name: 'Ananya Krishnan', email: 'ananya.k@gmail.com', phone: '+91 92109 87654', address: '12 Residency Road', city: 'Bengaluru', state: 'Karnataka (29)', totalOrders: 7, totalSpent: 41300, lastPurchase: '2026-09-01', status: 'active', notes: 'Walk-in corporate order client.', createdAt: '2026-04-22' },
  { id: 'c-8', name: 'Ravi Teja', email: 'ravi.t@trades.com', phone: '+91 91098 76543', address: '88 Outer Ring Road', city: 'Bengaluru', state: 'Karnataka (29)', gstin: '29FFFRT7890Q5Z9', totalOrders: 22, totalSpent: 312500, lastPurchase: '2026-09-12', status: 'active', notes: 'Hardware and UPS supplies. Settles via GPay / UPI.', createdAt: '2025-09-30' },
  { id: 'c-9', name: 'Vikram Sundaram', email: 'vikram.s@coastal.in', phone: '+91 90123 45678', address: '45 Mount Road', city: 'Chennai', state: 'Tamil Nadu (33)', gstin: '33AAAPL1234F1Z8', totalOrders: 14, totalSpent: 165000, lastPurchase: '2026-09-14', status: 'active', notes: 'Inter-state wholesale client from Chennai. Requires IGST billing.', createdAt: '2025-10-05' },
  { id: 'c-10', name: 'Rajesh Patel & Co', email: 'rajesh@pateltrades.com', phone: '+91 98200 11223', address: '102 Nariman Point', city: 'Mumbai', state: 'Maharashtra (27)', gstin: '27AAPCR5678K1Z2', totalOrders: 8, totalSpent: 98400, lastPurchase: '2026-09-11', status: 'active', notes: 'Inter-state commercial buyer from Mumbai. 18% IGST applies.', createdAt: '2026-02-14' },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  { id: 'p-1', name: 'Office Chair Ergonomic Pro', sku: 'FURN-001', category: 'Furniture', price: 12500, costPrice: 8200, stock: 15, minStock: 5, unit: 'pcs', hsnCode: '9401', gstRate: 18, status: 'in_stock', description: 'High-back mesh ergonomic executive chair with lumbar support and 3D armrests.', openingStock: 20 },
  { id: 'p-2', name: 'Executive Desk 6ft', sku: 'FURN-002', category: 'Furniture', price: 18900, costPrice: 12500, stock: 8, minStock: 3, unit: 'pcs', hsnCode: '9403', gstRate: 18, status: 'in_stock', description: 'Engineered wood executive desk with modesty panel and cable management grommets.', openingStock: 12 },
  { id: 'p-3', name: 'HP LaserJet Printer 1020', sku: 'ELEC-001', category: 'Electronics', price: 8500, costPrice: 6100, stock: 3, minStock: 5, unit: 'pcs', hsnCode: '8443', gstRate: 18, status: 'low_stock', description: 'Monochrome laser printer with 14ppm speed, USB 2.0 connectivity, and instant-on technology.', openingStock: 8 },
  { id: 'p-4', name: 'A4 Paper Ream 500 sheets', sku: 'STAT-001', category: 'Stationery', price: 350, costPrice: 210, stock: 0, minStock: 20, unit: 'ream', hsnCode: '4802', gstRate: 12, status: 'out_of_stock', description: '75 GSM multi-purpose copier paper, high brightness for laser and inkjet printing.', openingStock: 50 },
  { id: 'p-5', name: 'Whiteboard 4x3 ft', sku: 'STAT-002', category: 'Stationery', price: 2800, costPrice: 1750, stock: 12, minStock: 4, unit: 'pcs', hsnCode: '3924', gstRate: 18, status: 'in_stock', description: 'Magnetic dry-erase whiteboard with aluminum frame and integrated marker tray.', openingStock: 15 },
  { id: 'p-6', name: 'UPS 600VA Sine Wave', sku: 'ELEC-002', category: 'Electronics', price: 3200, costPrice: 2100, stock: 4, minStock: 5, unit: 'pcs', hsnCode: '8504', gstRate: 18, status: 'low_stock', description: 'Microprocessor-controlled line interactive UPS with AVR and overload protection.', openingStock: 10 },
  { id: 'p-7', name: 'Filing Cabinet 4 Drawer', sku: 'FURN-003', category: 'Furniture', price: 7500, costPrice: 4800, stock: 6, minStock: 3, unit: 'pcs', hsnCode: '9403', gstRate: 18, status: 'in_stock', description: 'Heavy-gauge steel filing cabinet with central locking mechanism.', openingStock: 8 },
  { id: 'p-8', name: 'CCTV Camera 4MP', sku: 'ELEC-003', category: 'Electronics', price: 4500, costPrice: 2900, stock: 9, minStock: 4, unit: 'pcs', hsnCode: '8525', gstRate: 18, status: 'in_stock', description: 'Smart infrared night-vision IP dome camera with motion detection.', openingStock: 15 },
  { id: 'p-9', name: 'Stapler Heavy Duty', sku: 'STAT-003', category: 'Stationery', price: 450, costPrice: 280, stock: 25, minStock: 8, unit: 'pcs', hsnCode: '8305', gstRate: 18, status: 'in_stock', description: 'All-metal desk stapler with rotating anvil for pinning and tacking.', openingStock: 35 },
  { id: 'p-10', name: 'LED Tube Light 36W', sku: 'ELEC-004', category: 'Electronics', price: 320, costPrice: 195, stock: 50, minStock: 15, unit: 'pcs', hsnCode: '8539', gstRate: 18, status: 'in_stock', description: 'Energy-saving cool daylight 4ft LED batten with polycarbonate diffuser.', openingStock: 150 },
];

export const mockStockMovements: StockMovement[] = [
  { id: 'sm-1', productId: 'p-1', productName: 'Office Chair Ergonomic Pro', type: 'sale', quantity: 2, previousStock: 17, newStock: 15, date: '2026-09-15', reason: 'Customer invoice billed', reference: 'INV-2026-0089' },
  { id: 'sm-2', productId: 'p-5', productName: 'Whiteboard 4x3 ft', type: 'sale', quantity: 1, previousStock: 13, newStock: 12, date: '2026-09-15', reason: 'Customer invoice billed', reference: 'INV-2026-0089' },
  { id: 'sm-3', productId: 'p-2', productName: 'Executive Desk 6ft', type: 'sale', quantity: 3, previousStock: 11, newStock: 8, date: '2026-09-14', reason: 'Customer invoice billed', reference: 'INV-2026-0088' },
  { id: 'sm-4', productId: 'p-7', productName: 'Filing Cabinet 4 Drawer', type: 'sale', quantity: 2, previousStock: 8, newStock: 6, date: '2026-09-14', reason: 'Customer invoice billed', reference: 'INV-2026-0088' },
  { id: 'sm-5', productId: 'p-3', productName: 'HP LaserJet Printer 1020', type: 'sale', quantity: 2, previousStock: 5, newStock: 3, date: '2026-09-13', reason: 'Customer invoice billed', reference: 'INV-2026-0087' },
  { id: 'sm-6', productId: 'p-10', productName: 'LED Tube Light 36W', type: 'sale', quantity: 100, previousStock: 150, newStock: 50, date: '2026-09-12', reason: 'Bulk commercial order billed', reference: 'INV-2026-0086' },
  { id: 'sm-7', productId: 'p-4', productName: 'A4 Paper Ream 500 sheets', type: 'sale', quantity: 20, previousStock: 20, newStock: 0, date: '2026-09-09', reason: 'Customer invoice billed', reference: 'INV-2026-0084' },
  { id: 'sm-8', productId: 'p-9', productName: 'Stapler Heavy Duty', type: 'return', quantity: 5, previousStock: 20, newStock: 25, date: '2026-09-07', reason: 'Sales return / Credit note processed', reference: 'CN-2026-0012' },
  { id: 'sm-9', productId: 'p-1', productName: 'Office Chair Ergonomic Pro', type: 'increase', quantity: 10, previousStock: 7, newStock: 17, date: '2026-09-01', reason: 'Supplier purchase batch received', reference: 'PO-2026-004' },
  { id: 'sm-10', productId: 'p-6', productName: 'UPS 600VA Sine Wave', type: 'decrease', quantity: 1, previousStock: 5, newStock: 4, date: '2026-09-03', reason: 'Damaged in shop handling / written off', notes: 'Casing cracked during shelf reorganization' },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1', invoiceNumber: 'INV-2026-0089', customerId: 'c-1', customerName: 'Priya Sharma', customerPhone: '+91 99887 76655', customerEmail: 'priya@gmail.com', customerAddress: '15 Park Street, Bengaluru', customerGstin: '29BBBCP1234M1Z3',
    date: '2026-09-15', dueDate: '2026-09-30',
    items: [
      { productId: 'p-1', productName: 'Office Chair Ergonomic Pro', hsnCode: '9401', quantity: 2, unit: 'pcs', price: 12500, discount: 500, gstRate: 18, total: 28320 },
      { productId: 'p-5', productName: 'Whiteboard 4x3 ft', hsnCode: '3924', quantity: 1, unit: 'pcs', price: 2800, discount: 0, gstRate: 18, total: 3304 },
    ],
    subtotal: 27800, discount: 500, gst: 4824, total: 31624, paid: 31624, balance: 0, status: 'paid', paymentMethod: 'UPI',
    notes: 'Thank you for your business! Goods once sold are not returnable.',
    paymentRecords: [
      { id: 'pr-1', amount: 31624, method: 'upi', date: '2026-09-15', reference: 'UPI/265489123', notes: 'Full payment received via PhonePe QR' },
    ],
  },
  {
    id: 'inv-2', invoiceNumber: 'INV-2026-0088', customerId: 'c-2', customerName: 'Amit Verma', customerPhone: '+91 97654 32109', customerEmail: 'amit.v@business.com', customerAddress: '8 Commercial Road, Mysuru', customerGstin: '29CCCAV5678N2Z1',
    date: '2026-09-14', dueDate: '2026-09-29',
    items: [
      { productId: 'p-2', productName: 'Executive Desk 6ft', hsnCode: '9403', quantity: 3, unit: 'pcs', price: 18900, discount: 1000, gstRate: 18, total: 64386 },
      { productId: 'p-7', productName: 'Filing Cabinet 4 Drawer', hsnCode: '9403', quantity: 2, unit: 'pcs', price: 7500, discount: 0, gstRate: 18, total: 17700 },
    ],
    subtotal: 55700, discount: 1000, gst: 10386, total: 82086, paid: 40000, balance: 42086, status: 'partial', paymentMethod: 'Bank Transfer',
    paymentRecords: [
      { id: 'pr-2', amount: 40000, method: 'bank_transfer', date: '2026-09-14', reference: 'NEFT/REF/892341', notes: 'Advance 50% deposit received' },
    ],
  },
  {
    id: 'inv-3', invoiceNumber: 'INV-2026-0087', customerId: 'c-6', customerName: 'Suresh Babu', customerPhone: '+91 93210 98765', customerEmail: 'sbabu@wholesale.com', customerAddress: '33 Industrial Area, Belgaum', customerGstin: '29EEESB3456P4Z7',
    date: '2026-09-13', dueDate: '2026-09-20',
    items: [
      { productId: 'p-3', productName: 'HP LaserJet Printer 1020', hsnCode: '8443', quantity: 2, unit: 'pcs', price: 8500, discount: 0, gstRate: 18, total: 20060 },
      { productId: 'p-8', productName: 'CCTV Camera 4MP', hsnCode: '8525', quantity: 4, unit: 'pcs', price: 4500, discount: 200, gstRate: 18, total: 20532 },
    ],
    subtotal: 25800, discount: 200, gst: 4604, total: 40592, paid: 0, balance: 40592, status: 'pending', paymentMethod: 'Bank Transfer',
  },
  {
    id: 'inv-4', invoiceNumber: 'INV-2026-0086', customerId: 'c-4', customerName: 'Kiran Patel', customerPhone: '+91 95432 10987', customerEmail: 'kiran.patel@kirana.in', customerAddress: '5 Market Lane, Mangaluru', customerGstin: '29DDDKP9012O3Z4',
    date: '2026-09-12', dueDate: '2026-09-27',
    items: [
      { productId: 'p-10', productName: 'LED Tube Light 36W', hsnCode: '8539', quantity: 100, unit: 'pcs', price: 320, discount: 1500, gstRate: 18, total: 35430 },
    ],
    subtotal: 32000, discount: 1500, gst: 5490, total: 35990, paid: 35990, balance: 0, status: 'paid', paymentMethod: 'Cash',
    paymentRecords: [
      { id: 'pr-3', amount: 35990, method: 'cash', date: '2026-09-12', notes: 'Cash payment counter receipt' },
    ],
  },
  {
    id: 'inv-5', invoiceNumber: 'INV-2026-0085', customerId: 'c-8', customerName: 'Ravi Teja', customerPhone: '+91 91098 76543', customerEmail: 'ravi.t@trades.com', customerAddress: '88 Outer Ring Road, Bengaluru', customerGstin: '29FFFRT7890Q5Z9',
    date: '2026-09-10', dueDate: '2026-09-25',
    items: [
      { productId: 'p-6', productName: 'UPS 600VA Sine Wave', hsnCode: '8504', quantity: 5, unit: 'pcs', price: 3200, discount: 0, gstRate: 18, total: 18880 },
    ],
    subtotal: 16000, discount: 0, gst: 2880, total: 18880, paid: 18880, balance: 0, status: 'paid', paymentMethod: 'UPI',
    paymentRecords: [
      { id: 'pr-4', amount: 18880, method: 'upi', date: '2026-09-10', reference: 'UPI/264789012', notes: 'Google Pay transaction' },
    ],
  },
  {
    id: 'inv-6', invoiceNumber: 'INV-2026-0084', customerId: 'c-3', customerName: 'Sunita Rao', customerPhone: '+91 96543 21098', customerEmail: 'sunita.rao@mail.com', customerAddress: '22 Gandhi Nagar, Hubli',
    date: '2026-09-09', dueDate: '2026-09-24',
    items: [
      { productId: 'p-9', productName: 'Stapler Heavy Duty', hsnCode: '8305', quantity: 10, unit: 'pcs', price: 450, discount: 0, gstRate: 18, total: 5310 },
      { productId: 'p-4', productName: 'A4 Paper Ream 500 sheets', hsnCode: '4802', quantity: 20, unit: 'ream', price: 350, discount: 0, gstRate: 12, total: 7840 },
    ],
    subtotal: 11500, discount: 0, gst: 1650, total: 13150, paid: 7000, balance: 6150, status: 'partial', paymentMethod: 'Card',
    paymentRecords: [
      { id: 'pr-5', amount: 7000, method: 'card', date: '2026-09-09', reference: 'TXN-78234', notes: 'Debit card swipe' },
    ],
  },
  {
    id: 'inv-7', invoiceNumber: 'INV-2026-0083', customerId: 'c-7', customerName: 'Ananya Krishnan', customerPhone: '+91 92109 87654', customerEmail: 'ananya.k@gmail.com', customerAddress: '12 Residency Road, Bengaluru',
    date: '2026-09-08', dueDate: '2026-09-15',
    items: [
      { productId: 'p-1', productName: 'Office Chair Ergonomic Pro', hsnCode: '9401', quantity: 1, unit: 'pcs', price: 12500, discount: 0, gstRate: 18, total: 14750 },
    ],
    subtotal: 12500, discount: 0, gst: 2250, total: 14750, paid: 0, balance: 14750, status: 'pending', paymentMethod: 'UPI',
  },
  {
    id: 'inv-8', invoiceNumber: 'INV-2026-0082', customerId: 'c-5', customerName: 'Meera Nair', customerPhone: '+91 94321 09876', customerEmail: 'meera.n@outlook.com', customerAddress: '77 Ring Road, Bengaluru',
    date: '2026-09-06', dueDate: '2026-09-20',
    items: [
      { productId: 'p-5', productName: 'Whiteboard 4x3 ft', hsnCode: '3924', quantity: 2, unit: 'pcs', price: 2800, discount: 200, gstRate: 18, total: 6372 },
    ],
    subtotal: 5600, discount: 200, gst: 972, total: 6372, paid: 0, balance: 6372, status: 'cancelled', paymentMethod: 'Cash',
    cancelledAt: '2026-09-07',
    cancelledReason: 'Customer requested cancellation: placed order by mistake.',
  },
  {
    id: 'inv-9', invoiceNumber: 'INV-2026-0081', customerId: 'c-2', customerName: 'Amit Verma', customerPhone: '+91 97654 32109', customerEmail: 'amit.v@business.com', customerAddress: '8 Commercial Road, Mysuru', customerGstin: '29CCCAV5678N2Z1',
    date: '2026-09-05', dueDate: '2026-09-18',
    items: [
      { productId: 'p-3', productName: 'HP LaserJet Printer 1020', hsnCode: '8443', quantity: 1, unit: 'pcs', price: 8500, discount: 0, gstRate: 18, total: 10030 },
      { productId: 'p-9', productName: 'Stapler Heavy Duty', hsnCode: '8305', quantity: 5, unit: 'pcs', price: 450, discount: 0, gstRate: 18, total: 2655 },
    ],
    subtotal: 10750, discount: 0, gst: 1935, total: 12685, paid: 12685, balance: 0, status: 'paid', paymentMethod: 'UPI',
    paymentRecords: [
      { id: 'pr-6', amount: 12685, method: 'upi', date: '2026-09-05', reference: 'UPI/261984210', notes: 'GPay payment' },
    ],
    salesReturns: [
      {
        id: 'sr-1',
        creditNoteNumber: 'CN-2026-0012',
        invoiceId: 'inv-9',
        invoiceNumber: 'INV-2026-0081',
        customerName: 'Amit Verma',
        date: '2026-09-07',
        totalRefund: 2655,
        refundMethod: 'store_credit',
        reason: 'Customer returned 5 staplers - ordered surplus stationery',
        status: 'completed',
        items: [
          {
            productId: 'p-9',
            productName: 'Stapler Heavy Duty',
            quantity: 5,
            unit: 'pcs',
            price: 450,
            gstRate: 18,
            refundAmount: 2655,
            reason: 'Excess quantity ordered by staff',
          },
        ],
      },
    ],
  },
  {
    id: 'inv-10', invoiceNumber: 'INV-2026-0090', customerId: 'c-9', customerName: 'Vikram Sundaram', customerPhone: '+91 90123 45678', customerEmail: 'vikram.s@coastal.in', customerAddress: '45 Mount Road, Chennai, Tamil Nadu', customerGstin: '33AAAPL1234F1Z8',
    date: '2026-09-14', dueDate: '2026-09-29',
    items: [
      { productId: 'p-2', productName: 'Executive Desk 6ft', hsnCode: '9403', quantity: 2, unit: 'pcs', price: 18900, discount: 800, gstRate: 18, total: 43660 },
    ],
    subtotal: 37800, discount: 800, gst: 6660, total: 43660, paid: 43660, balance: 0, status: 'paid', paymentMethod: 'Bank Transfer',
    notes: 'Inter-state delivery to Chennai via VRL Logistics. 18% IGST applicable.',
  },
  {
    id: 'inv-11', invoiceNumber: 'INV-2026-0091', customerId: 'c-10', customerName: 'Rajesh Patel & Co', customerPhone: '+91 98200 11223', customerEmail: 'rajesh@pateltrades.com', customerAddress: '102 Nariman Point, Mumbai, Maharashtra', customerGstin: '27AAPCR5678K1Z2',
    date: '2026-09-11', dueDate: '2026-09-26',
    items: [
      { productId: 'p-1', productName: 'Office Chair Ergonomic Pro', hsnCode: '9401', quantity: 4, unit: 'pcs', price: 12500, discount: 2000, gstRate: 18, total: 56640 },
    ],
    subtotal: 50000, discount: 2000, gst: 8640, total: 56640, paid: 30000, balance: 26640, status: 'partial', paymentMethod: 'Bank Transfer',
    notes: 'Inter-state commercial B2B supply to Mumbai. Full e-Way Bill generated.',
  },
];

// ─── Payments ─────────────────────────────────────────────────────────────────

export const mockPayments: Payment[] = [
  { id: 'pay-1', invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0089', customerName: 'Priya Sharma', customerId: 'c-1', amount: 31624, method: 'upi', date: '2026-09-16', reference: 'UPI/265489123', notes: 'Full invoice settlement via PhonePe QR', status: 'completed' },
  { id: 'pay-2', invoiceId: 'inv-2', invoiceNumber: 'INV-2026-0088', customerName: 'Amit Verma', customerId: 'c-2', amount: 40000, method: 'bank_transfer', date: '2026-09-14', reference: 'NEFT/REF/892341', notes: '50% advance deposit received', status: 'completed' },
  { id: 'pay-3', invoiceId: 'inv-4', invoiceNumber: 'INV-2026-0086', customerName: 'Kiran Patel', customerId: 'c-4', amount: 35990, method: 'cash', date: '2026-09-12', notes: 'Counter cash settlement with cash receipt', status: 'completed' },
  { id: 'pay-4', invoiceId: 'inv-5', invoiceNumber: 'INV-2026-0085', customerName: 'Ravi Teja', customerId: 'c-8', amount: 18880, method: 'upi', date: '2026-09-10', reference: 'UPI/264789012', notes: 'Google Pay transfer', status: 'completed' },
  { id: 'pay-5', invoiceId: 'inv-6', invoiceNumber: 'INV-2026-0084', customerName: 'Sunita Rao', customerId: 'c-3', amount: 7000, method: 'card', date: '2026-09-09', reference: 'TXN-78234', notes: 'HDFC swipe machine', status: 'completed' },
];

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const mockExpenses: Expense[] = [
  { id: 'exp-1', title: 'Monthly Store Rent', category: 'Rent', description: 'Shop rent for September 2026', amount: 25000, date: '2026-09-01', paymentMethod: 'bank_transfer', vendor: 'Property Owner', notes: 'Paid directly via RTGS to landlord', status: 'recorded' },
  { id: 'exp-2', title: 'BESCOM Power Bill', category: 'Electricity', description: 'BESCOM electricity bill', amount: 4800, date: '2026-09-05', paymentMethod: 'upi', vendor: 'BESCOM', notes: 'Monthly utility electricity meter bill', status: 'recorded' },
  { id: 'exp-3', title: 'Store Staff Salaries', category: 'Salaries', description: 'Staff salary for August', amount: 35000, date: '2026-09-03', paymentMethod: 'bank_transfer', notes: 'Salaries for 2 helpers and 1 billing cashier', status: 'recorded' },
  { id: 'exp-4', title: 'Goods Local Delivery', category: 'Transport', description: 'Delivery charges', amount: 2200, date: '2026-09-08', paymentMethod: 'cash', vendor: 'Local Auto Transport', notes: 'Freight outward charges', status: 'recorded' },
  { id: 'exp-5', title: 'Local Google Ads', category: 'Marketing', description: 'Google Ads campaign', amount: 5000, date: '2026-09-10', paymentMethod: 'card', vendor: 'Google India', notes: 'Online store promotions', status: 'recorded' },
  { id: 'exp-6', title: 'Store AC Servicing', category: 'Maintenance', description: 'AC servicing', amount: 1500, date: '2026-09-11', paymentMethod: 'cash', vendor: 'Cool Air Services', notes: 'Annual AC filter cleaning and gas top-up', status: 'recorded' },
  { id: 'exp-7', title: 'Billing Rolls & Paper', category: 'Stationery', description: 'Office supplies', amount: 890, date: '2026-09-13', paymentMethod: 'cash', notes: 'Thermal paper rolls for receipt printer', status: 'recorded' },
  { id: 'exp-8', title: 'Store Fiber Broadband', category: 'Internet', description: 'Airtel broadband bill', amount: 1199, date: '2026-09-05', paymentMethod: 'upi', vendor: 'Airtel Broadband', notes: 'High speed fiber for POS terminal & CCTV', status: 'recorded' },
  { id: 'exp-9', title: 'Staff Tea & Refreshments', category: 'Tea & Refreshments', description: 'Daily tea and snacks', amount: 450, date: '2026-09-16', paymentMethod: 'cash', notes: 'Daily tea stall weekly payment', status: 'recorded' },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    type: 'payment',
    category: 'payments',
    title: 'Invoice #INV-00125 paid',
    message: 'Ravi Kumar paid ₹2,500 via UPI',
    time: '5 min ago',
    read: false,
    targetPath: '/payments',
    actionLabel: 'Mark as read',
  },
  {
    id: 'n-2',
    type: 'stock',
    category: 'inventory',
    title: 'Low stock alert',
    message: 'Product "T-Shirt" has only 3 units remaining',
    time: '1 hour ago',
    read: false,
    targetPath: '/inventory',
    actionLabel: 'View Inventory',
  },
  {
    id: 'n-3',
    type: 'expense',
    category: 'expenses',
    title: 'New expense added',
    message: 'Electricity Bill · ₹3,200 recorded under Utilities',
    time: '3 hours ago',
    read: false,
    targetPath: '/expenses',
    actionLabel: 'View Expenses',
  },
  {
    id: 'n-4',
    type: 'gst',
    category: 'gst',
    title: 'GST report ready',
    message: 'Monthly GST summary is available for download and review',
    time: '5 hours ago',
    read: false,
    targetPath: '/gst',
    actionLabel: 'View Report',
  },
  {
    id: 'n-5',
    type: 'invoice',
    category: 'billing',
    title: 'Invoice #INV-2026-0083 overdue',
    message: 'Payment from Ananya Krishnan (₹14,500) is overdue by 1 day',
    time: '1 day ago',
    read: true,
    targetPath: '/invoices',
    actionLabel: 'View Invoices',
  },
  {
    id: 'n-6',
    type: 'payment',
    category: 'payments',
    title: 'Payment Received',
    message: '₹31,624 received from Priya Sharma via UPI',
    time: '2 days ago',
    read: true,
    targetPath: '/payments',
    actionLabel: 'View Payments',
  },
  {
    id: 'n-7',
    type: 'gst',
    category: 'gst',
    title: 'GST Filing Reminder',
    message: 'GSTR-1 filing due in 14 days (30 Sep 2026)',
    time: '3 days ago',
    read: true,
    targetPath: '/gst',
    actionLabel: 'View Report',
  },
  {
    id: 'n-8',
    type: 'stock',
    category: 'inventory',
    title: 'Out of Stock Alert',
    message: 'A4 Paper Ream is out of stock. Reorder immediately.',
    time: '4 days ago',
    read: true,
    targetPath: '/inventory',
    actionLabel: 'View Inventory',
  },
  {
    id: 'n-9',
    type: 'billing',
    category: 'billing',
    title: 'New Invoice Created',
    message: 'Invoice #INV-2026-0089 created for Vikram Patel (₹8,920)',
    time: '5 days ago',
    read: true,
    targetPath: '/invoices',
    actionLabel: 'View Invoices',
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  todaySales: 87450,
  todaySalesChange: 12.4,
  totalCustomers: 8,
  customersChange: 2.1,
  pendingInvoices: 3,
  pendingAmount: 103388,
  gstPayable: 42680,
  gstPeriod: 'Sep 2026',
  totalExpenses: 75589,
  expensesChange: -5.2,
  totalRevenue: 612450,
  revenueChange: 18.7,
};

// ─── Revenue Chart Data ───────────────────────────────────────────────────────

export const mockRevenueData: RevenueData[] = [
  { day: 'Mon', revenue: 42500, expenses: 8200 },
  { day: 'Tue', revenue: 68900, expenses: 12400 },
  { day: 'Wed', revenue: 52300, expenses: 9800 },
  { day: 'Thu', revenue: 89100, expenses: 15600 },
  { day: 'Fri', revenue: 73400, expenses: 11200 },
  { day: 'Sat', revenue: 112000, expenses: 18900 },
  { day: 'Sun', revenue: 87450, expenses: 14500 },
];

// ─── Today's hourly sales data ────────────────────────────────────────────────

export const mockTodayData: RevenueData[] = [
  { day: '9am',  revenue: 4200,  expenses: 0 },
  { day: '10am', revenue: 8900,  expenses: 0 },
  { day: '11am', revenue: 11500, expenses: 1200 },
  { day: '12pm', revenue: 15800, expenses: 0 },
  { day: '1pm',  revenue: 9200,  expenses: 2400 },
  { day: '2pm',  revenue: 13400, expenses: 0 },
  { day: '3pm',  revenue: 16700, expenses: 0 },
  { day: '4pm',  revenue: 7750,  expenses: 0 },
];

// ─── Monthly sales data (last 30 days) ───────────────────────────────────────

export const mockMonthData: RevenueData[] = [
  { day: '1 Sep', revenue: 38200, expenses: 29500 },
  { day: '3 Sep', revenue: 52100, expenses: 6000 },
  { day: '5 Sep', revenue: 44800, expenses: 12000 },
  { day: '7 Sep', revenue: 67300, expenses: 8000 },
  { day: '9 Sep', revenue: 39100, expenses: 5000 },
  { day: '11 Sep', revenue: 58900, expenses: 3500 },
  { day: '13 Sep', revenue: 72400, expenses: 4800 },
  { day: '15 Sep', revenue: 49600, expenses: 7200 },
  { day: '16 Sep', revenue: 87450, expenses: 14500 },
];

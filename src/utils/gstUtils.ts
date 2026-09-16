import type { Invoice, Customer, GSTInvoiceReportRow, GSTRateBreakdown, GSTSettings } from '../types';

export interface StateInfo {
  code: string;
  name: string;
}

export const INDIAN_STATES: StateInfo[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli & Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
];

/**
 * Extract 2-digit GST state code from customer GSTIN or address / customer record
 */
export const getCustomerStateCode = (
  customerGstin?: string,
  customerAddress?: string,
  customer?: Customer,
  defaultBusinessStateCode = '29'
): string => {
  // 1. Check GSTIN (First 2 digits are state code)
  if (customerGstin && customerGstin.trim().length >= 2) {
    const code = customerGstin.trim().slice(0, 2);
    if (/^\d{2}$/.test(code)) return code;
  }

  // 2. Check Customer record state field e.g. "Karnataka (29)" or "Tamil Nadu (33)"
  if (customer?.state) {
    const match = customer.state.match(/\((\d{2})\)/);
    if (match) return match[1];
    const foundState = INDIAN_STATES.find(s =>
      customer.state?.toLowerCase().includes(s.name.toLowerCase())
    );
    if (foundState) return foundState.code;
  }

  // 3. Check address text
  if (customerAddress) {
    for (const state of INDIAN_STATES) {
      if (customerAddress.toLowerCase().includes(state.name.toLowerCase())) {
        return state.code;
      }
    }
  }

  return defaultBusinessStateCode;
};

export const getStateNameByCode = (code: string): string => {
  const found = INDIAN_STATES.find(s => s.code === code);
  return found ? found.name : 'Unknown State';
};

/**
 * Check whether supply is Intra-State or Inter-State
 */
export const isInterStateSupply = (
  customerStateCode: string,
  businessStateCode = '29'
): boolean => {
  return customerStateCode !== businessStateCode;
};

/**
 * Calculate tax breakdown for an invoice
 */
export const calculateInvoiceTax = (
  inv: Invoice,
  businessStateCode = '29',
  customers: Customer[] = []
): {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  supplyType: 'intra' | 'inter';
  placeOfSupply: string;
} => {
  const customer = customers.find(c => c.id === inv.customerId);
  const custStateCode = getCustomerStateCode(
    inv.customerGstin,
    inv.customerAddress,
    customer,
    businessStateCode
  );

  const isInterState = isInterStateSupply(custStateCode, businessStateCode);
  const stateName = getStateNameByCode(custStateCode);
  const placeOfSupply = `${custStateCode} - ${stateName}`;

  // Taxable value = subtotal - discount (minimum 0)
  const taxableValue = Math.max(0, (inv.subtotal || 0) - (inv.discount || 0));
  const totalTax = inv.gst || 0;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalTax;
    cgst = 0;
    sgst = 0;
  } else {
    cgst = Math.round((totalTax / 2) * 100) / 100;
    sgst = Math.round((totalTax - cgst) * 100) / 100;
    igst = 0;
  }

  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    supplyType: isInterState ? 'inter' : 'intra',
    placeOfSupply,
  };
};

/**
 * Build report rows for all active invoices
 */
export const generateGSTReportRows = (
  invoices: Invoice[],
  businessStateCode = '29',
  customers: Customer[] = []
): GSTInvoiceReportRow[] => {
  return invoices
    .filter(inv => inv.status !== 'cancelled')
    .map(inv => {
      const taxData = calculateInvoiceTax(inv, businessStateCode, customers);
      return {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerGstin: inv.customerGstin,
        placeOfSupply: taxData.placeOfSupply,
        supplyType: taxData.supplyType,
        taxableValue: taxData.taxableValue,
        cgst: taxData.cgst,
        sgst: taxData.sgst,
        igst: taxData.igst,
        totalTax: taxData.totalTax,
        invoiceTotal: inv.total,
        status: inv.status,
      };
    });
};

/**
 * Group sales by GST rate brackets (0%, 5%, 12%, 18%, 28%)
 */
export const calculateGSTRateBreakdown = (
  invoices: Invoice[],
  businessStateCode = '29',
  customers: Customer[] = []
): GSTRateBreakdown[] => {
  const activeInvoices = invoices.filter(inv => inv.status !== 'cancelled');

  const standardRates = [0, 5, 12, 18, 28];
  const rateMap = new Map<number, { taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number }>();

  standardRates.forEach(rate => {
    rateMap.set(rate, { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
  });

  activeInvoices.forEach(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const custStateCode = getCustomerStateCode(
      inv.customerGstin,
      inv.customerAddress,
      customer,
      businessStateCode
    );
    const isInter = isInterStateSupply(custStateCode, businessStateCode);

    // If items have explicit gstRate, sum item-by-item
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach(item => {
        const rate = item.gstRate || 18;
        if (!rateMap.has(rate)) {
          rateMap.set(rate, { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
        }
        const entry = rateMap.get(rate)!;

        const unitPrice = item.price ?? item.rate ?? 0;
        const lineTaxable = Math.max(0, (item.quantity * unitPrice) - (item.discount || 0));
        const lineTax = (lineTaxable * rate) / 100;

        entry.taxableValue += lineTaxable;
        entry.totalTax += lineTax;

        if (isInter) {
          entry.igst += lineTax;
        } else {
          entry.cgst += lineTax / 2;
          entry.sgst += lineTax / 2;
        }
      });
    } else {
      // Fallback: allocate entire invoice to default 18% rate
      const entry = rateMap.get(18)!;
      const taxable = Math.max(0, inv.subtotal - inv.discount);
      entry.taxableValue += taxable;
      entry.totalTax += inv.gst;
      if (isInter) {
        entry.igst += inv.gst;
      } else {
        entry.cgst += inv.gst / 2;
        entry.sgst += inv.gst / 2;
      }
    }
  });

  return standardRates.map(rate => {
    const entry = rateMap.get(rate) || { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    return {
      rate,
      rateLabel: `${rate}%`,
      taxableValue: Math.round(entry.taxableValue),
      cgst: Math.round(entry.cgst),
      sgst: Math.round(entry.sgst),
      igst: Math.round(entry.igst),
      totalTax: Math.round(entry.totalTax),
    };
  });
};

/**
 * Formats Indian Currency (₹)
 */
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

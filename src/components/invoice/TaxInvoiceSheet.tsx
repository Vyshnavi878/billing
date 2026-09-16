import React from 'react';
import { Building2, Phone, Mail, MapPin, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { numberToWordsINR } from '../../utils/numberToWords';

export interface TaxInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerGstin?: string;
  placeOfSupply?: string;
  items: Array<{
    id?: string;
    productId?: string;
    productName?: string;
    name?: string;
    hsnCode?: string;
    unit?: string;
    quantity: number;
    price?: number;
    unitPrice?: number;
    discount?: number;
    gstRate: number;
    total?: number;
  }>;
  subtotal?: number;
  discount?: number;
  taxableAmount?: number;
  gst?: number;
  cgst?: number;
  sgst?: number;
  roundOff?: number;
  total: number;
  paid?: number;
  balance?: number;
  status?: string;
  paymentMethod?: string;
  notes?: string;
}

interface TaxInvoiceSheetProps {
  data: TaxInvoiceData;
  storeDetails?: {
    name: string;
    tagline: string;
    address: string;
    city: string;
    state: string;
    gstin: string;
    phone: string;
    email: string;
  };
}

export const TaxInvoiceSheet: React.FC<TaxInvoiceSheetProps> = ({
  data,
  storeDetails = {
    name: 'Kumar Enterprises',
    tagline: 'Quality & Trust Since 2010',
    address: '42, MG Road, Near City Mall',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29AABCK1234L1Z5',
    phone: '+91 80 4567 8901',
    email: 'info@kumarenterprises.in',
  },
}) => {
  // Normalize items
  const items = (data.items || []).map((item, idx) => {
    const name = item.productName || item.name || `Item ${idx + 1}`;
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPrice ?? item.price ?? 0);
    const disc = Number(item.discount ?? 0);
    const gstRate = Number(item.gstRate ?? 18);
    const hsn = item.hsnCode || '9403';
    const unit = item.unit || 'pcs';

    const gross = qty * rate;
    const taxable = gross - disc;
    const gstVal = (taxable * gstRate) / 100;
    const lineTotal = taxable + gstVal;

    return {
      sl: idx + 1,
      name,
      hsn,
      qty,
      unit,
      rate,
      disc,
      taxable,
      gstRate,
      cgstRate: gstRate / 2,
      cgstAmt: gstVal / 2,
      sgstRate: gstRate / 2,
      sgstAmt: gstVal / 2,
      gstVal,
      lineTotal,
    };
  });

  const subtotal = data.subtotal ?? items.reduce((s, i) => s + (i.qty * i.rate), 0);
  const totalDiscount = data.discount ?? items.reduce((s, i) => s + i.disc, 0);
  const taxableAmount = data.taxableAmount ?? (subtotal - totalDiscount);
  const totalCgst = data.cgst ?? items.reduce((s, i) => s + i.cgstAmt, 0);
  const totalSgst = data.sgst ?? items.reduce((s, i) => s + i.sgstAmt, 0);
  const totalGst = data.gst ?? (totalCgst + totalSgst);
  const rawTotal = taxableAmount + totalGst;
  const grandTotal = data.total ?? Math.round(rawTotal);
  const roundOff = data.roundOff ?? (grandTotal - rawTotal);

  const paidAmount = data.paid ?? (data.status === 'paid' ? grandTotal : 0);
  const balanceDue = data.balance ?? Math.max(0, grandTotal - paidAmount);

  // Group GST by rate for tax breakup
  const gstGroups: Record<number, { taxable: number; cgst: number; sgst: number; totalGst: number }> = {};
  items.forEach(item => {
    if (!gstGroups[item.gstRate]) {
      gstGroups[item.gstRate] = { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 };
    }
    gstGroups[item.gstRate].taxable += item.taxable;
    gstGroups[item.gstRate].cgst += item.cgstAmt;
    gstGroups[item.gstRate].sgst += item.sgstAmt;
    gstGroups[item.gstRate].totalGst += item.gstVal;
  });

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

  const formatNum = (v: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(v);

  return (
    <div className="bg-white text-slate-800 text-[13px] leading-snug font-sans p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto printable-invoice">
      {/* ── Top Header & Store Info ────────────────────────────────────── */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-lg print:bg-slate-900">
                KE
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {storeDetails.name}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{storeDetails.tagline}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 print:hidden" />
                <span>{storeDetails.address}, {storeDetails.city}, {storeDetails.state} - 560001</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 print:hidden" /> {storeDetails.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 print:hidden" /> {storeDetails.email}
                </span>
              </div>
              <p className="font-semibold text-slate-900">
                GSTIN: <span className="font-mono">{storeDetails.gstin}</span> &nbsp;|&nbsp; State: {storeDetails.state} (Code: 29)
              </p>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
            <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-1">
              TAX INVOICE
            </div>
            <p className="text-[11px] text-slate-500 italic">Original for Recipient</p>
            <div className="mt-2 text-xs">
              <p className="font-bold text-slate-900 text-sm font-mono">{data.invoiceNumber}</p>
              <p className="text-slate-600">Date: <span className="font-semibold">{data.invoiceDate}</span></p>
              <p className="text-slate-600">Due Date: <span className="font-semibold">{data.dueDate}</span></p>
              <p className="text-slate-600">Place of Supply: <span className="font-semibold">{data.placeOfSupply || 'Karnataka (29)'}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bill To Section ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3.5 mb-4 bg-slate-50/50">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Bill To / Customer Details
          </span>
          <p className="font-bold text-slate-900 text-sm">{data.customerName}</p>
          {data.customerAddress && (
            <p className="text-xs text-slate-600 mt-0.5">{data.customerAddress}</p>
          )}
          {data.customerPhone && (
            <p className="text-xs text-slate-600 mt-0.5">Phone: <span className="font-medium text-slate-800">{data.customerPhone}</span></p>
          )}
          {data.customerEmail && (
            <p className="text-xs text-slate-600">Email: {data.customerEmail}</p>
          )}
        </div>

        <div className="sm:text-right flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Tax Details
            </span>
            <p className="text-xs text-slate-700">
              GSTIN: <span className="font-mono font-bold text-slate-900">{data.customerGstin || 'URP (Unregistered Person)'}</span>
            </p>
            <p className="text-xs text-slate-600">State: Karnataka (Code: 29)</p>
            <p className="text-xs text-slate-600">Reverse Charge: <span className="font-medium">No</span></p>
          </div>
          <div className="mt-2 flex items-center sm:justify-end gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              data.status === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : data.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : data.status === 'overdue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {data.status || 'Paid'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Items Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-2.5 px-2 text-center w-8">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-2 text-center">HSN</th>
              <th className="py-2.5 px-2 text-center">Qty</th>
              <th className="py-2.5 px-2 text-right">Rate (₹)</th>
              <th className="py-2.5 px-2 text-right">Disc (₹)</th>
              <th className="py-2.5 px-2 text-right">Taxable (₹)</th>
              <th className="py-2.5 px-2 text-right">GST %</th>
              <th className="py-2.5 px-3 text-right font-bold">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.sl} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">{item.sl}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  {item.name}
                  <span className="text-[10px] text-slate-400 block font-normal sm:hidden">
                    HSN: {item.hsn}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.hsn}</td>
                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                  {item.qty} <span className="text-[10px] text-slate-400">{item.unit}</span>
                </td>
                <td className="py-2.5 px-2 text-right font-mono">{formatNum(item.rate)}</td>
                <td className="py-2.5 px-2 text-right font-mono text-emerald-700">
                  {item.disc > 0 ? formatNum(item.disc) : '—'}
                </td>
                <td className="py-2.5 px-2 text-right font-mono">{formatNum(item.taxable)}</td>
                <td className="py-2.5 px-2 text-right font-mono">{item.gstRate}%</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {formatNum(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary & Calculations ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Left: GST Breakup Table & Words */}
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              GST Tax Breakup (CGST + SGST)
            </p>
            <table className="w-full text-[11px] border border-slate-200 rounded text-center">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-1 px-1">GST Rate</th>
                  <th className="py-1 px-1 text-right">Taxable</th>
                  <th className="py-1 px-1 text-right">CGST</th>
                  <th className="py-1 px-1 text-right">SGST</th>
                  <th className="py-1 px-1 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(gstGroups).map(([rate, g]) => (
                  <tr key={rate}>
                    <td className="py-1 px-1 text-slate-700">{rate}%</td>
                    <td className="py-1 px-1 text-right">{formatNum(g.taxable)}</td>
                    <td className="py-1 px-1 text-right">{formatNum(g.cgst)}</td>
                    <td className="py-1 px-1 text-right">{formatNum(g.sgst)}</td>
                    <td className="py-1 px-1 text-right font-semibold">{formatNum(g.totalGst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Amount in Words
            </span>
            <p className="text-xs font-semibold text-slate-800 italic mt-0.5">
              {numberToWordsINR(grandTotal)}
            </p>
          </div>
        </div>

        {/* Right: Total Breakdown */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurr(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Total Discount:</span>
              <span className="font-mono">- {formatCurr(totalDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span className="font-mono">{formatCurr(taxableAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500 pl-2">
            <span>CGST:</span>
            <span className="font-mono">{formatCurr(totalCgst)}</span>
          </div>
          <div className="flex justify-between text-slate-500 pl-2">
            <span>SGST:</span>
            <span className="font-mono">{formatCurr(totalSgst)}</span>
          </div>
          {Math.abs(roundOff) > 0.001 && (
            <div className="flex justify-between text-slate-500">
              <span>Round Off:</span>
              <span className="font-mono">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t-2 border-slate-900 pt-2 mt-1 flex justify-between items-center text-slate-900">
            <span className="font-black text-sm uppercase tracking-wide">Grand Total:</span>
            <span className="font-mono font-black text-base text-primary-700">
              {formatCurr(grandTotal)}
            </span>
          </div>

          {/* Payment breakdown */}
          <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode:</span>
              <span className="capitalize font-semibold text-slate-800">{data.paymentMethod || 'Cash'}</span>
            </div>
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Amount Paid:</span>
              <span className="font-mono">{formatCurr(paidAmount)}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between text-rose-700 font-bold">
                <span>Balance Due:</span>
                <span className="font-mono">{formatCurr(balanceDue)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer: Bank details, Terms, Signature ────────────────────── */}
      <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-slate-600">
        <div>
          <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Bank Details</p>
          <p>Bank: <span className="font-semibold text-slate-800">HDFC Bank Ltd</span></p>
          <p>A/c Name: <span className="font-semibold text-slate-800">Kumar Enterprises</span></p>
          <p>A/c No: <span className="font-mono font-semibold text-slate-800">50200012345678</span></p>
          <p>IFSC: <span className="font-mono font-semibold text-slate-800">HDFC0001234</span></p>
          <p>Branch: <span className="text-slate-800">MG Road, Bengaluru</span></p>
          <p className="mt-1">UPI ID: <span className="font-mono text-primary-600 font-semibold">kumarenterprises@hdfcbank</span></p>
        </div>

        <div>
          <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Terms & Conditions</p>
          <ol className="list-decimal pl-3.5 space-y-0.5 text-slate-500">
            <li>Goods once sold will not be accepted back or exchanged.</li>
            <li>Interest @ 18% p.a. will be charged for delayed payments.</li>
            <li>Subject to Bengaluru jurisdiction only.</li>
          </ol>
          {data.notes && (
            <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[10px]">
              <span className="font-bold">Note: </span>{data.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between sm:items-end text-left sm:text-right">
          <p className="font-bold text-slate-800">For KUMAR ENTERPRISES</p>
          <div className="my-6 border-b border-dashed border-slate-300 w-32 sm:ml-auto"></div>
          <div>
            <p className="font-bold text-slate-900">Authorized Signatory</p>
            <p className="text-[10px] text-slate-400">This is a computer generated invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoiceSheet;

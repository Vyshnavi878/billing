import React from 'react';
import { X, FileText, Building2, MapPin, CheckCircle, AlertTriangle, ShieldCheck, Printer, ArrowRight, Truck } from 'lucide-react';
import type { Invoice, Customer, GSTSettings, Store } from '../../types';
import { calculateInvoiceTax, formatCurrency } from '../../utils/gstUtils';

interface GSTInvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  customer?: Customer;
  gstSettings: GSTSettings;
  store: Store;
  onViewFullInvoice?: (invoice: Invoice) => void;
}

export const GSTInvoiceDetailModal: React.FC<GSTInvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  customer,
  gstSettings,
  store,
  onViewFullInvoice,
}) => {
  if (!isOpen || !invoice) return null;

  const taxBreakdown = calculateInvoiceTax(invoice, gstSettings.stateCode, customer ? [customer] : []);
  const isEWayBillRequired = invoice.total >= (gstSettings.eWayBillThreshold || 50000);
  const isB2B = !!(invoice.customerGstin && invoice.customerGstin.trim().length >= 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">GST Invoice Information</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isB2B
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {isB2B ? 'B2B Regular' : 'B2C Small'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {invoice.invoiceNumber} • Date: {invoice.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Supplier & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Supplier / Store */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier (Store)</span>
              <p className="font-bold text-slate-900 text-sm">{store.name}</p>
              <div className="space-y-0.5 text-slate-600">
                <p>GSTIN: <strong className="font-mono text-slate-800">{gstSettings.gstin}</strong></p>
                <p>State / POS: <span className="font-medium text-slate-700">{gstSettings.stateCode} - {gstSettings.businessState}</span></p>
                <p>Tax Scheme: <span className="capitalize font-semibold text-emerald-700">{gstSettings.taxScheme} Scheme</span></p>
              </div>
            </div>

            {/* Buyer / Customer */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient (Buyer)</span>
              <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
              <div className="space-y-0.5 text-slate-600">
                <p>
                  GSTIN: {invoice.customerGstin ? (
                    <strong className="font-mono text-slate-800">{invoice.customerGstin}</strong>
                  ) : (
                    <span className="text-slate-400 italic">Unregistered (Consumer)</span>
                  )}
                </p>
                <p>Place of Supply: <strong className="text-slate-800">{taxBreakdown.placeOfSupply}</strong></p>
                <p>
                  Supply Type: <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    taxBreakdown.supplyType === 'intra'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {taxBreakdown.supplyType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Banners: RCM & E-Way Bill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Reverse Charge (RCM): No</p>
                <p className="text-[11px] text-slate-500">Tax is payable by the supplier on forward charge</p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              isEWayBillRequired
                ? 'border-amber-200 bg-amber-50/80 text-amber-900'
                : 'border-slate-200 bg-slate-50/70 text-slate-700'
            }`}>
              <Truck className={`w-5 h-5 shrink-0 ${isEWayBillRequired ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold">
                  {isEWayBillRequired ? 'E-Way Bill Required' : 'E-Way Bill: Not Applicable'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isEWayBillRequired
                    ? `Total value (${formatCurrency(invoice.total)}) exceeds threshold limit of ${formatCurrency(gstSettings.eWayBillThreshold || 50000)}`
                    : `Invoice value is below the threshold limit of ${formatCurrency(gstSettings.eWayBillThreshold || 50000)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Tax Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Item-Level GST Calculation</span>
              <span className="text-[11px] font-normal text-slate-500">{invoice.items?.length || 0} line items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base text-xs">
                <thead>
                  <tr>
                    <th>Item & HSN</th>
                    <th>Qty</th>
                    <th>Taxable Value</th>
                    <th>GST %</th>
                    {taxBreakdown.supplyType === 'intra' ? (
                      <>
                        <th>CGST</th>
                        <th>SGST</th>
                      </>
                    ) : (
                      <th>IGST</th>
                    )}
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items && invoice.items.map((item, idx) => {
                    const lineRate = item.price ?? item.rate ?? 0;
                    const lineTaxable = Math.max(0, (item.quantity * lineRate) - (item.discount || 0));
                    const rate = item.gstRate || 18;
                    const lineTax = (lineTaxable * rate) / 100;
                    const cgst = taxBreakdown.supplyType === 'intra' ? lineTax / 2 : 0;
                    const sgst = taxBreakdown.supplyType === 'intra' ? lineTax / 2 : 0;
                    const igst = taxBreakdown.supplyType === 'inter' ? lineTax : 0;

                    return (
                      <tr key={idx}>
                        <td>
                          <p className="font-bold text-slate-900">{item.productName || item.name || 'Item'}</p>
                          <span className="font-mono text-[10px] text-slate-400">HSN: {item.hsnCode || '—'}</span>
                        </td>
                        <td>{item.quantity} {item.unit || 'pcs'}</td>
                        <td className="font-mono font-medium">{formatCurrency(lineTaxable)}</td>
                        <td>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                            {rate}%
                          </span>
                        </td>
                        {taxBreakdown.supplyType === 'intra' ? (
                          <>
                            <td className="font-mono text-slate-600">{formatCurrency(cgst)}</td>
                            <td className="font-mono text-slate-600">{formatCurrency(sgst)}</td>
                          </>
                        ) : (
                          <td className="font-mono text-indigo-700 font-semibold">{formatCurrency(igst)}</td>
                        )}
                        <td className="text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aggregate Tax Calculation Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Total Taxable Value (Sales Value):</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(taxBreakdown.taxableValue)}</span>
            </div>
            {taxBreakdown.supplyType === 'intra' ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(taxBreakdown.cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State GST (SGST):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(taxBreakdown.sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-indigo-700">
                <span>Integrated GST (IGST - Inter-State):</span>
                <span className="font-mono font-bold text-indigo-700">{formatCurrency(taxBreakdown.igst)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200 font-semibold">
              <span>Total Output GST (Tax Liability):</span>
              <span className="font-mono text-slate-900">{formatCurrency(taxBreakdown.totalTax)}</span>
            </div>
            <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200 text-sm font-black">
              <span>Invoice Total (Taxable + Tax):</span>
              <span className="font-mono text-primary-700">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-xs"
          >
            Close
          </button>
          {onViewFullInvoice && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullInvoice(invoice);
              }}
              className="btn-primary px-4 py-2 text-xs gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Full Tax Invoice Sheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Printer, Download, Share2, Eye, Plus,
  FileText, LayoutDashboard, Copy, Check, ArrowRight,
  Receipt, ShieldCheck, Sparkles
} from 'lucide-react';
import { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';

export const InvoiceSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const stateData = (location.state || {}) as Partial<TaxInvoiceData> & {
    invoiceNo?: string;
    paidAmount?: number;
    balanceDue?: number;
    payMode?: string;
  };

  const invoiceNo = stateData.invoiceNumber || stateData.invoiceNo || 'INV-2026-0090';
  const customerName = stateData.customerName || 'Walk-in Customer';
  const customerPhone = stateData.customerPhone || '+91 98765 43210';
  const grandTotal = stateData.total ?? stateData.subtotal ?? 31624;
  const paidAmount = stateData.paid ?? stateData.paidAmount ?? grandTotal;
  const balanceDue = stateData.balance ?? stateData.balanceDue ?? 0;
  const status = stateData.status || (balanceDue === 0 ? 'paid' : 'partial');
  const payMode = stateData.paymentMethod || stateData.payMode || 'Cash';
  const invoiceDate = stateData.invoiceDate || new Date().toISOString().slice(0, 10);
  const itemsCount = stateData.items?.length || 2;

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    navigate('/billing/preview', { state: { ...stateData, invoiceNumber: invoiceNo, total: grandTotal, paid: paidAmount, balance: balanceDue, status, paymentMethod: payMode } });
    setTimeout(() => window.print(), 300);
  };

  const handleDownloadPdf = () => {
    navigate('/billing/preview', { state: { ...stateData, invoiceNumber: invoiceNo, total: grandTotal, paid: paidAmount, balance: balanceDue, status, paymentMethod: payMode } });
    setTimeout(() => window.print(), 300);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${customerName},\n\nThank you for shopping with Kumar Enterprises!\n\nYour invoice ${invoiceNo} for ${formatCurr(grandTotal)} is confirmed.\nStatus: ${status.toUpperCase()}\nPayment Mode: ${payMode.toUpperCase()}${balanceDue > 0 ? `\nBalance Due: ${formatCurr(balanceDue)}` : ''}\n\nHave a great day!`
    );
    const phoneClean = customerPhone.replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleViewInvoice = () => {
    navigate('/billing/preview', {
      state: {
        ...stateData,
        invoiceNumber: invoiceNo,
        total: grandTotal,
        paid: paidAmount,
        balance: balanceDue,
        status,
        paymentMethod: payMode,
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 animate-fade-in">
      {/* ── Celebration Icon & Headline ───────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1.5 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-5 tracking-tight">
          Invoice Generated Successfully!
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
          The tax invoice has been saved and is ready to share with the customer.
        </p>
      </div>

      {/* ── Invoice Key Summary Card ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Header with Invoice Number */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice No.</span>
            <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">{invoiceNo}</span>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Customer</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">{customerName}</p>
              <p className="text-xs text-slate-500 font-mono">{customerPhone}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Date</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{invoiceDate}</p>
              <p className="text-xs text-slate-400">{itemsCount} item{itemsCount > 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Payment Mode</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5 capitalize">{payMode}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${
                status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {status}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">GST Compliant</span>
              <p className="font-semibold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </p>
              <p className="text-[11px] text-slate-400 font-mono">Karnataka (29)</p>
            </div>
          </div>

          {/* Financial summary banner */}
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50/50 rounded-xl p-4 border border-primary-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Grand Total</span>
              <p className="text-2xl sm:text-3xl font-black text-primary-900 mt-0.5 font-mono">
                {formatCurr(grandTotal)}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Paid</span>
                <p className="text-sm sm:text-base font-bold text-emerald-700 font-mono">
                  {formatCurr(paidAmount)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Balance</span>
                <p className={`text-sm sm:text-base font-bold font-mono ${balanceDue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {formatCurr(balanceDue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Action Buttons ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={handlePrint}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <Printer className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Print Invoice</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Download PDF</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Send WhatsApp</span>
        </button>

        <button
          onClick={handleViewInvoice}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">View Invoice</span>
        </button>
      </div>

      {/* ── Quick Navigation Footer ───────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => navigate('/billing/create')}
          className="btn-primary w-full sm:w-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Another Invoice
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/billing')}
            className="btn-secondary flex-1 sm:flex-initial gap-1.5 text-xs font-semibold"
          >
            <FileText className="w-4 h-4" />
            Go to Invoices
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost flex-1 sm:flex-initial gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuccessPage;

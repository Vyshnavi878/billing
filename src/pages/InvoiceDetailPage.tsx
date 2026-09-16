import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Download, Share2, CreditCard, Ban,
  RotateCcw, Eye, CheckCircle2, Clock, AlertTriangle, XCircle,
  Building2, Phone, Mail, MapPin, User, Calendar, Hash,
  Receipt, FileText, ChevronRight, Check, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecordPaymentModal } from '../components/invoice/RecordPaymentModal';
import { CancelInvoiceModal } from '../components/invoice/CancelInvoiceModal';
import { SalesReturnModal } from '../components/invoice/SalesReturnModal';
import { InvoicePreviewModal } from '../components/invoice/InvoicePreviewModal';
import type { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, store, recordPayment, cancelInvoice, createSalesReturn } = useApp();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const invoice = invoices.find(i => i.id === id || i.invoiceNumber === id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!invoice) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-800">Invoice Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested invoice ID &quot;{id}&quot; does not exist.</p>
        <button
          onClick={() => navigate('/invoices')}
          className="btn-primary mt-4 mx-auto text-xs px-5 py-2.5"
        >
          Return to Invoices
        </button>
      </div>
    );
  }

  const formatCurr = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const fDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isCancelled = invoice.status === 'cancelled';
  const isPaid = invoice.status === 'paid' || invoice.balance === 0;

  const handlePrint = () => {
    setShowPreviewModal(true);
    setTimeout(() => window.print(), 300);
  };

  const handleDownload = () => {
    setShowPreviewModal(true);
    setTimeout(() => window.print(), 300);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${invoice.customerName},\n\nYour invoice ${invoice.invoiceNumber} for ${formatCurr(invoice.total)} from ${store.name} is available.\nStatus: ${invoice.status.toUpperCase()}\nAmount Paid: ${formatCurr(invoice.paid)}\nBalance Due: ${formatCurr(invoice.balance)}\n\nThank you!`
    );
    const phoneClean = invoice.customerPhone.replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Invoice link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const previewData: TaxInvoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.date,
    dueDate: invoice.dueDate,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    customerGstin: invoice.customerGstin,
    customerAddress: invoice.customerAddress,
    items: invoice.items.map(item => ({
      productName: item.productName,
      hsnCode: item.hsnCode || '9403',
      unit: item.unit || 'pcs',
      quantity: item.quantity,
      unitPrice: item.price,
      discount: item.discount,
      gstRate: item.gstRate,
      total: item.total,
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    gst: invoice.gst,
    total: invoice.total,
    paid: invoice.paid,
    balance: invoice.balance,
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    notes: invoice.notes,
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'paid':
        return <span className="badge badge-success gap-1 px-3 py-1 font-bold text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> PAID</span>;
      case 'partial':
        return <span className="badge badge-warning gap-1 px-3 py-1 font-bold text-xs"><Clock className="w-3.5 h-3.5" /> PARTIALLY PAID</span>;
      case 'pending':
        return <span className="badge badge-warning gap-1 px-3 py-1 font-bold text-xs"><Clock className="w-3.5 h-3.5" /> PAYMENT PENDING</span>;
      case 'overdue':
        return <span className="badge badge-danger gap-1 px-3 py-1 font-bold text-xs"><XCircle className="w-3.5 h-3.5" /> OVERDUE</span>;
      case 'cancelled':
        return <span className="badge bg-slate-200 text-slate-800 gap-1 px-3 py-1 font-bold text-xs"><Ban className="w-3.5 h-3.5" /> CANCELLED</span>;
      default:
        return <span className="badge badge-slate gap-1 px-3 py-1 font-bold text-xs">{invoice.status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-24 lg:pb-12">
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="btn-secondary gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/invoices')}>Invoices</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-mono text-slate-600 font-semibold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="page-title text-xl sm:text-2xl">{invoice.invoiceNumber}</h1>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Desktop Primary Actions */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="btn-secondary gap-1.5 text-xs py-2 px-3.5 text-primary-700 border-primary-200 hover:bg-primary-50"
          >
            <Eye className="w-3.5 h-3.5" />
            Tax Invoice Sheet
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary gap-1.5 text-xs py-2 px-3"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="btn-secondary gap-1.5 text-xs py-2 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs py-2 px-3"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Cancellation Banner (If Cancelled) ────────────────────────── */}
      {isCancelled && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-rose-950 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Ban className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base text-rose-900">This Invoice Has Been Cancelled</h3>
            <p className="text-xs text-rose-800">
              Reason: <strong>{invoice.cancelledReason || 'Cancelled by store owner'}</strong>
            </p>
            <p className="text-[11px] text-rose-600">
              Cancelled on: {fDate(invoice.cancelledAt || invoice.date)}. All financial dues for this invoice are voided.
            </p>
          </div>
        </div>
      )}

      {/* ── Key Metrics & Business Overview ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Business Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-slate-900 text-sm">{store.name}</span>
          </div>
          <p className="text-slate-500">{store.address}, {store.city}, {store.state}</p>
          <div className="space-y-0.5 text-slate-600 pt-1">
            <p className="font-semibold text-slate-800">GSTIN: <span className="font-mono">{store.gstin}</span></p>
            <p>Phone: {store.phone}</p>
            <p>Email: {store.email}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-slate-900 text-sm">Customer Details</span>
          </div>
          <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
          <div className="space-y-0.5 text-slate-600">
            <p>Phone: <span className="font-mono text-slate-800">{invoice.customerPhone}</span></p>
            {invoice.customerEmail && <p>Email: {invoice.customerEmail}</p>}
            {invoice.customerAddress && <p>Address: {invoice.customerAddress}</p>}
            <p>
              GSTIN: <span className="font-mono font-semibold text-slate-800">{invoice.customerGstin || 'URP (Unregistered)'}</span>
            </p>
          </div>
        </div>

        {/* Payment Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-0.5">{formatCurr(invoice.total)}</p>
            <p className="text-xs text-slate-400 mt-1">
              Billed on {fDate(invoice.date)} · Due {fDate(invoice.dueDate)}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Paid</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurr(invoice.paid)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Pending Due</span>
              <span className={`font-mono font-bold text-sm ${invoice.balance > 0 && !isCancelled ? 'text-rose-400' : 'text-slate-300'}`}>
                {formatCurr(isCancelled ? 0 : invoice.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operational Action Buttons Bar ────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Operations:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Record Payment Button */}
          {!isCancelled && invoice.balance > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary text-xs py-2 px-4 shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          )}

          {/* Sales Return Button */}
          {!isCancelled && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="btn-secondary text-xs py-2 px-3.5 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              Create Sales Return
            </button>
          )}

          {/* Cancel Invoice Button */}
          {!isCancelled && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-ghost text-xs py-2 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* ── Products & Items Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-slate-900 text-sm">Billed Products & Services</h3>
          </div>
          <span className="text-xs text-slate-400">{invoice.items.length} line item{invoice.items.length > 1 ? 's' : ''}</span>
        </div>

        {/* Desktop View Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="table-base text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="w-10 text-center">#</th>
                <th>Product Description</th>
                <th className="w-24 text-center">HSN/SAC</th>
                <th className="w-20 text-center">Qty</th>
                <th className="w-28 text-right">Unit Rate</th>
                <th className="w-24 text-right">Discount</th>
                <th className="w-20 text-center">GST %</th>
                <th className="w-28 text-right font-bold pr-6">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td>
                    <p className="font-semibold text-slate-900 text-xs">{item.productName}</p>
                  </td>
                  <td className="text-center font-mono text-slate-600">{item.hsnCode || '9403'}</td>
                  <td className="text-center font-mono font-semibold">
                    {item.quantity} {item.unit || 'pcs'}
                  </td>
                  <td className="text-right font-mono">{formatCurr(item.price)}</td>
                  <td className="text-right font-mono text-emerald-700">
                    {item.discount > 0 ? formatCurr(item.discount) : '—'}
                  </td>
                  <td className="text-center font-mono">{item.gstRate}%</td>
                  <td className="text-right font-mono font-bold text-slate-900 pr-6">
                    {formatCurr(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
          {invoice.items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                <span className="font-mono font-bold text-slate-900">{formatCurr(item.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Qty: <strong>{item.quantity} {item.unit || 'pcs'}</strong></span>
                <span>Rate: {formatCurr(item.price)}</span>
                <span>GST: {item.gstRate}%</span>
              </div>
              {item.discount > 0 && (
                <p className="text-emerald-700 text-[11px] font-semibold">Discount: -{formatCurr(item.discount)}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Summary Calculation */}
        <div className="bg-slate-50/80 border-t border-slate-200 p-5">
          <div className="max-w-md ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatCurr(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Discount:</span>
                <span className="font-mono font-medium">- {formatCurr(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST Total:</span>
              <span className="font-mono font-medium">{formatCurr(invoice.gst)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono text-lg text-primary-700">{formatCurr(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Records & History ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Payment History & Transactions</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>Method: <strong className="capitalize text-slate-800">{invoice.paymentMethod || 'Cash'}</strong></span>
            <span>Total Collected: <strong className="font-mono text-emerald-700">{formatCurr(invoice.paid)}</strong></span>
          </div>
        </div>

        {invoice.paymentRecords && invoice.paymentRecords.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Reference / Transaction ID</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right font-bold pr-5">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.paymentRecords.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-600">{fDate(pr.date)}</td>
                    <td className="py-2.5 px-3 font-semibold uppercase">{pr.method}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{pr.reference || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-500">{pr.notes || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 pr-5">
                      {formatCurr(pr.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            {invoice.paid > 0 ? (
              <p>Primary payment of {formatCurr(invoice.paid)} recorded via {invoice.paymentMethod || 'Cash'}.</p>
            ) : (
              <p>No payments recorded yet for this invoice.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Sales Returns & Credit Notes ──────────────────────────────── */}
      {invoice.salesReturns && invoice.salesReturns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Issued Credit Notes (Sales Returns)</h3>
          </div>

          <div className="space-y-3">
            {invoice.salesReturns.map((sr) => (
              <div key={sr.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded border border-primary-200">
                      {sr.creditNoteNumber}
                    </span>
                    <span className="badge badge-success text-[10px] font-bold uppercase">{sr.status}</span>
                  </div>
                  <span className="text-slate-400">{fDate(sr.date)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 text-slate-700">
                  <div>
                    <p className="font-semibold">Reason: {sr.reason}</p>
                    <p className="text-slate-500 text-[11px]">
                      Refund Mode: <span className="capitalize font-medium">{sr.refundMethod.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Refund</span>
                    <span className="font-mono font-black text-rose-700 text-sm">{formatCurr(sr.totalRefund)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile Sticky Action Footer (375px) ───────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl z-30 flex items-center gap-2">
        <button
          onClick={() => setShowPreviewModal(true)}
          className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        {!isCancelled && invoice.balance > 0 ? (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-primary flex-[2] py-2.5 text-xs font-bold shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Record Payment
          </button>
        ) : (
          <button
            onClick={handleWhatsAppShare}
            className="btn-primary flex-[2] py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Invoice
          </button>
        )}
      </div>

      {/* ── Interactive Modals ────────────────────────────────────────── */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onRecordPayment={(payment) => {
          recordPayment(invoice.id, payment);
          showToast(`Recorded payment of ${formatCurr(payment.amount)} successfully!`);
        }}
      />

      <CancelInvoiceModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        invoice={invoice}
        onConfirmCancel={(reason) => {
          cancelInvoice(invoice.id, reason);
          showToast(`Invoice ${invoice.invoiceNumber} cancelled.`);
        }}
      />

      <SalesReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        invoice={invoice}
        onCreateSalesReturn={(returnData) => {
          const ret = createSalesReturn(invoice.id, returnData);
          showToast(`Created Credit Note ${ret.creditNoteNumber}!`);
          return ret;
        }}
      />

      <InvoicePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        invoiceData={previewData}
      />
    </div>
  );
};

export default InvoiceDetailPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, Eye, Printer,
  FileText, Clock, CheckCircle2,
  XCircle, Receipt, Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Invoice } from '../types';
import InvoicePreviewModal from '../components/invoice/InvoicePreviewModal';
import type { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';

// ─── Utilities ────────────────────────────────────────────────────────────────
const fc = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const fDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

type StatusFilter = 'all' | 'paid' | 'pending' | 'cancelled' | 'overdue' | 'draft';

const statusCfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:      { label: 'Paid',      cls: 'badge badge-success', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:   { label: 'Pending',   cls: 'badge badge-warning', icon: <Clock className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', cls: 'badge bg-slate-200 text-slate-700', icon: <Ban className="w-3 h-3" /> },
  overdue:   { label: 'Overdue',   cls: 'badge badge-danger',  icon: <XCircle className="w-3 h-3" /> },
  draft:     { label: 'Draft',     cls: 'badge badge-slate',   icon: <FileText className="w-3 h-3" /> },
};

// ─── BillingPage ─────────────────────────────────────────────────────────────
export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [previewData, setPreviewData] = useState<TaxInvoiceData | null>(null);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerPhone.includes(q);
    const matchS = statusFilter === 'all' || inv.status === statusFilter;
    return matchQ && matchS;
  });

  // Summary stats
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.balance, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const counts: Record<StatusFilter, number> = {
    all:       invoices.length,
    paid:      invoices.filter(i => i.status === 'paid').length,
    pending:   invoices.filter(i => i.status === 'pending').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    overdue:   invoices.filter(i => i.status === 'overdue').length,
    draft:     invoices.filter(i => i.status === 'draft').length,
  };

  const openPreview = (inv: Invoice) => {
    const data: TaxInvoiceData = {
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.date,
      dueDate: inv.dueDate,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      customerGstin: inv.customerGstin,
      customerAddress: inv.customerAddress,
      items: inv.items.map(item => ({
        productName: item.productName,
        hsnCode: item.hsnCode || '9403',
        unit: item.unit || 'pcs',
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        gstRate: item.gstRate,
        total: item.total,
      })),
      subtotal: inv.subtotal,
      discount: inv.discount,
      gst: inv.gst,
      total: inv.total,
      paid: inv.paid,
      balance: inv.balance,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      notes: inv.notes,
    };
    setPreviewData(data);
  };

  const handlePrint = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    openPreview(inv);
    setTimeout(() => window.print(), 300);
  };

  const handleExportCsv = () => {
    const header = ['Invoice Number', 'Customer Name', 'Phone', 'Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Status', 'Payment Method'];
    const rows = filtered.map(i => [
      i.invoiceNumber,
      `"${i.customerName}"`,
      i.customerPhone,
      i.date,
      i.dueDate,
      i.total,
      i.paid,
      i.balance,
      i.status,
      i.paymentMethod || '—'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invoices_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="page-subtitle text-slate-500 mt-0.5">
            Manage your store invoices, payments, and tax receipts.
          </p>
        </div>
        <button
          id="create-invoice-btn"
          onClick={() => navigate('/billing/create')}
          className="btn-primary shadow-md shadow-primary-600/25 px-5"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* ── Summary KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Invoices"
          value={invoices.length.toString()}
          sub="All store records"
          color="slate"
          icon={<Receipt className="w-5 h-5" />}
        />
        <SummaryCard
          label="Amount Collected"
          value={fc(totalRevenue)}
          sub={`${counts.paid} paid in full`}
          color="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard
          label="Pending Dues"
          value={fc(totalPending)}
          sub={`${counts.pending + counts.overdue} receivables`}
          color="amber"
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard
          label="Overdue Invoices"
          value={overdueCount.toString()}
          sub="Needs immediate attention"
          color="red"
          icon={<XCircle className="w-5 h-5" />}
        />
      </div>

      {/* ── Filter Bar & Search Area ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100/90 rounded-xl p-1 gap-1 overflow-x-auto scrollbar-none">
            {(['all', 'paid', 'pending', 'cancelled', 'overdue', 'draft'] as StatusFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {key}
                <span className="ml-1 text-[10px] font-normal opacity-70">
                  ({counts[key] ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Search + Export */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search invoice no, customer, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10 text-xs sm:text-sm py-2"
              />
            </div>
            <button
              onClick={handleExportCsv}
              className="btn-secondary gap-1.5 text-xs font-semibold py-2 px-3 flex-shrink-0"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── Desktop Invoice Table ─────────────────────────────────── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const cfg = statusCfg[inv.status] ?? statusCfg.draft;
                return (
                  <tr
                    key={inv.id}
                    className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                    onClick={() => openPreview(inv)}
                  >
                    <td>
                      <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {inv.customerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{inv.customerName}</p>
                          <p className="text-xs text-slate-400 font-mono">{inv.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 font-medium">{fDate(inv.date)}</span>
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${inv.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {fDate(inv.dueDate)}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-slate-900 text-sm">{fc(inv.total)}</span>
                    </td>
                    <td>
                      <span className={`font-mono text-xs font-bold ${inv.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {inv.balance > 0 ? fc(inv.balance) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`${cfg.cls} inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5 pr-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openPreview(inv); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="View Invoice Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handlePrint(inv, e)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-400 max-w-sm mx-auto">
                      <FileText className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-semibold text-slate-600">No matching invoices found</p>
                      <p className="text-xs text-slate-400 text-center">
                        Try changing the status tab or clearing your search term.
                      </p>
                      <button
                        onClick={() => navigate('/billing/create')}
                        className="btn-primary text-xs px-4 py-2 mt-2 gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Invoice Card List (375px) ──────────────────────── */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.map(inv => {
            const cfg = statusCfg[inv.status] ?? statusCfg.draft;
            return (
              <div
                key={inv.id}
                onClick={() => openPreview(inv)}
                className="p-4 active:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                    {inv.invoiceNumber}
                  </span>
                  <span className={`${cfg.cls} inline-flex items-center gap-1 text-[10px] font-bold uppercase`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{inv.customerName}</p>
                    <p className="text-xs text-slate-400 font-mono">{inv.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-slate-900 text-base">{fc(inv.total)}</p>
                    {inv.balance > 0 ? (
                      <p className="text-[11px] font-semibold text-rose-600">Due: {fc(inv.balance)}</p>
                    ) : (
                      <p className="text-[11px] font-semibold text-emerald-600">Paid in full</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-400">
                  <span>Date: {fDate(inv.date)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openPreview(inv); }}
                      className="text-primary-600 font-semibold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No invoices match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tax Invoice Live Preview Modal ───────────────────────────── */}
      <InvoicePreviewModal
        isOpen={Boolean(previewData)}
        onClose={() => setPreviewData(null)}
        invoiceData={previewData}
      />
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  slate:   'bg-slate-100 text-slate-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber:   'bg-amber-100 text-amber-700',
  red:     'bg-rose-100 text-rose-700',
};

const SummaryCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, color, icon }) => (
  <div className="stat-card p-4 sm:p-5">
    <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3 shadow-xs`}>
      {icon}
    </div>
    <p className="text-xl lg:text-2xl font-black text-slate-900 leading-tight font-mono">{value}</p>
    <p className="text-xs font-bold text-slate-600 mt-1">{label}</p>
    <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
  </div>
);

export default BillingPage;

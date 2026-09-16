import React, { useState, useMemo } from 'react';
import {
  Calculator, FileText, Download, CheckCircle, Clock, AlertTriangle,
  Building2, Percent, ShieldCheck, Search, Filter, Calendar, ExternalLink,
  ChevronRight, ArrowUpRight, TrendingUp, Layers, HelpCircle, Save, Info,
  Eye, Truck, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GSTInvoiceDetailModal } from '../components/gst/GSTInvoiceDetailModal';
import { InvoicePreviewModal } from '../components/invoice/InvoicePreviewModal';
import type { TaxInvoiceData } from '../components/invoice/TaxInvoiceSheet';
import {
  calculateInvoiceTax,
  calculateGSTRateBreakdown,
  generateGSTReportRows,
  formatCurrency,
  INDIAN_STATES,
  getStateNameByCode
} from '../utils/gstUtils';
import type { Invoice, GSTInvoiceReportRow } from '../types';

export const GSTPage: React.FC = () => {
  const { invoices, customers, gstSettings, store, updateGstSettings, showToast } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'settings'>('overview');

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Filters
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'month' | 'last_month' | 'quarter'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [supplyTypeFilter, setSupplyTypeFilter] = useState<'all' | 'intra' | 'inter'>('all');
  const [b2bFilter, setB2bFilter] = useState<'all' | 'b2b' | 'b2c'>('all');

  // In-Page Settings Form State
  const [formGstin, setFormGstin] = useState(gstSettings.gstin);
  const [formStateCode, setFormStateCode] = useState(gstSettings.stateCode || '29');
  const [formDefaultRate, setFormDefaultRate] = useState(gstSettings.defaultGstRate || 18);
  const [formTaxScheme, setFormTaxScheme] = useState<'regular' | 'composition'>(gstSettings.taxScheme || 'regular');
  const [formEnableRcm, setFormEnableRcm] = useState(gstSettings.enableRCM || false);
  const [formEWayBillThreshold, setFormEWayBillThreshold] = useState(gstSettings.eWayBillThreshold || 50000);

  // Date constants matching mock system date (2026-09-16)
  const todayStr = '2026-09-16';
  const currentMonthStr = '2026-09';
  const lastMonthStr = '2026-08';

  // Filtered Invoices for calculation
  const activeInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (inv.status === 'cancelled') return false;
      if (datePreset === 'today') return inv.date === todayStr;
      if (datePreset === 'month') return (inv.date || '').startsWith(currentMonthStr);
      if (datePreset === 'last_month') return (inv.date || '').startsWith(lastMonthStr);
      if (datePreset === 'quarter') {
        const d = inv.date || '';
        return d >= '2026-07-01' && d <= '2026-09-30';
      }
      return true;
    });
  }, [invoices, datePreset, todayStr, currentMonthStr, lastMonthStr]);

  // 1. Dashboard KPIs
  const dashboardStats = useMemo(() => {
    let totalTaxableSales = 0;
    let outputGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    activeInvoices.forEach(inv => {
      const tax = calculateInvoiceTax(inv, gstSettings.stateCode, customers);
      totalTaxableSales += tax.taxableValue;
      outputGST += tax.totalTax;
      totalCGST += tax.cgst;
      totalSGST += tax.sgst;
      totalIGST += tax.igst;
    });

    return {
      totalTaxableSales: Math.round(totalTaxableSales),
      outputGST: Math.round(outputGST),
      totalCGST: Math.round(totalCGST),
      totalSGST: Math.round(totalSGST),
      totalIGST: Math.round(totalIGST),
    };
  }, [activeInvoices, gstSettings.stateCode, customers]);

  // Rate Breakdown across active invoices
  const rateBreakdown = useMemo(() => {
    return calculateGSTRateBreakdown(activeInvoices, gstSettings.stateCode, customers);
  }, [activeInvoices, gstSettings.stateCode, customers]);

  // Supply Distribution (Intra vs Inter)
  const supplyDistribution = useMemo(() => {
    let intraTaxable = 0;
    let interTaxable = 0;

    activeInvoices.forEach(inv => {
      const tax = calculateInvoiceTax(inv, gstSettings.stateCode, customers);
      if (tax.supplyType === 'intra') {
        intraTaxable += tax.taxableValue;
      } else {
        interTaxable += tax.taxableValue;
      }
    });

    const total = intraTaxable + interTaxable || 1;
    return {
      intraTaxable,
      interTaxable,
      intraPercent: Math.round((intraTaxable / total) * 100),
      interPercent: Math.round((interTaxable / total) * 100),
    };
  }, [activeInvoices, gstSettings.stateCode, customers]);

  // Full GST Report Rows
  const reportRows: GSTInvoiceReportRow[] = useMemo(() => {
    return generateGSTReportRows(activeInvoices, gstSettings.stateCode, customers);
  }, [activeInvoices, gstSettings.stateCode, customers]);

  // Filtered Report Rows for Table
  const filteredReportRows = useMemo(() => {
    return reportRows.filter(row => {
      const term = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        row.invoiceNumber.toLowerCase().includes(term) ||
        row.customerName.toLowerCase().includes(term) ||
        (row.customerGstin || '').toLowerCase().includes(term);

      const matchSupply =
        supplyTypeFilter === 'all' || row.supplyType === supplyTypeFilter;

      const isB2B = !!(row.customerGstin && row.customerGstin.trim().length >= 15);
      const matchB2B =
        b2bFilter === 'all' ||
        (b2bFilter === 'b2b' ? isB2B : !isB2B);

      return matchSearch && matchSupply && matchB2B;
    });
  }, [reportRows, searchQuery, supplyTypeFilter, b2bFilter]);

  // Filtered Totals
  const filteredTotals = useMemo(() => {
    return filteredReportRows.reduce(
      (acc, r) => ({
        taxable: acc.taxable + r.taxableValue,
        cgst: acc.cgst + r.cgst,
        sgst: acc.sgst + r.sgst,
        igst: acc.igst + r.igst,
        tax: acc.tax + r.totalTax,
        total: acc.total + r.invoiceTotal,
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0 }
    );
  }, [filteredReportRows]);

  // Handlers
  const handleOpenDetailModal = (row: GSTInvoiceReportRow) => {
    const inv = invoices.find(i => i.id === row.invoiceId);
    if (inv) {
      setSelectedInvoice(inv);
      setShowDetailModal(true);
    }
  };

  const handleOpenFullInvoice = (inv: Invoice) => {
    setPreviewInvoice(inv);
    setShowPreviewModal(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const stateName = getStateNameByCode(formStateCode);
    updateGstSettings({
      gstin: formGstin.trim().toUpperCase(),
      businessState: stateName,
      stateCode: formStateCode,
      defaultGstRate: Number(formDefaultRate),
      taxScheme: formTaxScheme,
      enableRCM: formEnableRcm,
      eWayBillThreshold: Number(formEWayBillThreshold) || 50000,
    });
    showToast('GST configuration updated successfully');
  };

  // CSV Export for GSTR-1
  const handleExportGSTR1 = () => {
    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Customer Name',
      'Customer GSTIN',
      'Place of Supply',
      'Supply Type',
      'Taxable Value',
      'CGST Amount',
      'SGST Amount',
      'IGST Amount',
      'Total Tax',
      'Invoice Total Value'
    ];

    const rows = filteredReportRows.map(r => [
      r.invoiceNumber,
      r.date,
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.customerGstin || 'URP',
      `"${r.placeOfSupply.replace(/"/g, '""')}"`,
      r.supplyType === 'intra' ? 'Intra-State' : 'Inter-State',
      r.taxableValue,
      r.cgst,
      r.sgst,
      r.igst,
      r.totalTax,
      r.invoiceTotal
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_Report_${gstSettings.gstin}_${datePreset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('GSTR-1 CSV report downloaded');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Calculator className="w-5 h-5" />
            </span>
            GST & Tax Compliance
          </h1>
          <p className="page-subtitle text-xs sm:text-sm text-slate-500 mt-1">
            Goods & Services Tax computation, outward supplies reporting, and GSTR summaries
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportGSTR1}
            className="btn-secondary text-xs py-2.5 px-3.5 gap-1.5"
            title="Download GSTR-1 Outward Supplies Report in CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export GSTR-1 (CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="btn-primary text-xs py-2.5 px-4 gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Building2 className="w-4 h-4" />
            <span>GST Settings</span>
          </button>
        </div>
      </div>

      {/* Business GSTIN Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Registered Taxpayer
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-400/30">
                <CheckCircle className="w-3 h-3" /> Active Regular GSTIN
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black font-mono tracking-wide text-white">
              {gstSettings.gstin}
            </p>
            <p className="text-xs text-slate-300">
              {store.name} • Place of Business: <strong className="text-white">{gstSettings.stateCode} - {gstSettings.businessState}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 text-xs">
            <div className="text-right">
              <span className="text-slate-300 block text-[11px]">Default GST Rate</span>
              <span className="font-mono font-bold text-base text-white">{gstSettings.defaultGstRate}%</span>
            </div>
            <div className="h-7 w-px bg-white/20" />
            <div className="text-right">
              <span className="text-slate-300 block text-[11px]">E-Way Bill Threshold</span>
              <span className="font-mono font-bold text-base text-white">{formatCurrency(gstSettings.eWayBillThreshold || 50000)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GST Dashboard: 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Taxable Sales */}
        <div className="stat-card bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Taxable Sales</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              ₹
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2 font-mono">
            {formatCurrency(dashboardStats.totalTaxableSales)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Outward supplies base</p>
        </div>

        {/* Total Output GST */}
        <div className="stat-card bg-gradient-to-br from-white to-purple-50/40 border border-purple-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Output GST</span>
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-purple-700 mt-2 font-mono">
            {formatCurrency(dashboardStats.outputGST)}
          </p>
          <p className="text-[11px] text-purple-600 mt-1 font-medium">Total tax liability</p>
        </div>

        {/* CGST */}
        <div className="stat-card bg-gradient-to-br from-white to-blue-50/40 border border-blue-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">CGST (Central)</span>
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              C
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-blue-700 mt-2 font-mono">
            {formatCurrency(dashboardStats.totalCGST)}
          </p>
          <p className="text-[11px] text-blue-600 mt-1">50% of local supplies</p>
        </div>

        {/* SGST */}
        <div className="stat-card bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100/80 shadow-sm p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SGST (State)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              S
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-700 mt-2 font-mono">
            {formatCurrency(dashboardStats.totalSGST)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">50% of local supplies</p>
        </div>

        {/* IGST */}
        <div className="stat-card bg-gradient-to-br from-white to-amber-50/40 border border-amber-100/80 shadow-sm p-4 rounded-2xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">IGST (Integrated)</span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              I
            </span>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-700 mt-2 font-mono">
            {formatCurrency(dashboardStats.totalIGST)}
          </p>
          <p className="text-[11px] text-amber-600 mt-1">Inter-state supplies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          GST Summary & Rates
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          GST Reports (GSTR-1 Table)
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          GST Settings & Configuration
        </button>
      </div>

      {/* TAB 1: GST Overview & Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filter Bar for Summary */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">Reporting Period:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'today', label: 'Today (16 Sep)' },
                { id: 'month', label: 'This Month (Sep 2026)' },
                { id: 'last_month', label: 'Last Month (Aug 2026)' },
                { id: 'quarter', label: 'Q2 (Jul - Sep 2026)' },
                { id: 'all', label: 'All Invoices' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    datePreset === p.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rate-Wise GST Summary Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sales by GST Rate Bracket</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rate-wise breakdown of taxable values and tax liabilities</p>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                Period: {datePreset.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>GST Rate</th>
                    <th>Taxable Sales</th>
                    <th>CGST (Central)</th>
                    <th>SGST (State)</th>
                    <th>IGST (Integrated)</th>
                    <th className="text-right">Total GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {rateBreakdown.map(row => (
                    <tr key={row.rate} className="hover:bg-slate-50/70 transition-colors">
                      <td>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                          {row.rateLabel}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-900 font-mono">
                          {formatCurrency(row.taxableValue)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-slate-600">
                          {formatCurrency(row.cgst)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-slate-600">
                          {formatCurrency(row.sgst)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-amber-700 font-semibold">
                          {formatCurrency(row.igst)}
                        </span>
                      </td>
                      <td className="text-right font-mono font-bold text-indigo-700">
                        {formatCurrency(row.totalTax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                  <tr>
                    <td>Total</td>
                    <td className="font-mono text-slate-900">
                      {formatCurrency(rateBreakdown.reduce((s, r) => s + r.taxableValue, 0))}
                    </td>
                    <td className="font-mono text-slate-700">
                      {formatCurrency(rateBreakdown.reduce((s, r) => s + r.cgst, 0))}
                    </td>
                    <td className="font-mono text-slate-700">
                      {formatCurrency(rateBreakdown.reduce((s, r) => s + r.sgst, 0))}
                    </td>
                    <td className="font-mono text-amber-700">
                      {formatCurrency(rateBreakdown.reduce((s, r) => s + r.igst, 0))}
                    </td>
                    <td className="text-right font-mono text-indigo-700 font-black">
                      {formatCurrency(rateBreakdown.reduce((s, r) => s + r.totalTax, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Intra-State vs Inter-State Supply Comparison Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Intra-State Supplies (Local)</h4>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {supplyDistribution.intraPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Supplies within Karnataka ({gstSettings.stateCode}) split equally into CGST & SGST.
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">Local Taxable Sales:</span>
                  <span className="font-mono text-slate-900">{formatCurrency(supplyDistribution.intraTaxable)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.max(5, supplyDistribution.intraPercent)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">Inter-State Supplies (Outside State)</h4>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {supplyDistribution.interPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Supplies to Tamil Nadu, Maharashtra, etc. attract 100% IGST.
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">Interstate Taxable Sales:</span>
                  <span className="font-mono text-slate-900">{formatCurrency(supplyDistribution.interTaxable)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.max(5, supplyDistribution.interPercent)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Filing Reminders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">GST Filing Schedule & Due Dates</h3>
              </div>
              <span className="text-xs text-slate-400">Monthly Indian Tax Compliance</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">GSTR-1</span>
                    <span className="text-slate-500">· Outward Supplies Statement</span>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px]">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Tax period: <strong>September 2026</strong> · Due date: <strong className="text-slate-800">11 Oct 2026</strong>
                  </p>
                </div>
                <button
                  onClick={handleExportGSTR1}
                  className="btn-secondary text-xs py-1.5 px-3 gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export Data
                </button>
              </div>

              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">GSTR-3B</span>
                    <span className="text-slate-500">· Monthly Summary Return & Payment</span>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px]">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Tax period: <strong>September 2026</strong> · Due date: <strong className="text-slate-800">20 Oct 2026</strong> · Net tax: <strong className="text-indigo-700 font-mono">{formatCurrency(dashboardStats.outputGST)}</strong>
                  </p>
                </div>
                <span className="text-slate-400 text-xs">Ready for filing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GST Reports (GSTR-1 Outward Supplies Table) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #, customer name, GSTIN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-base pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <select
                value={supplyTypeFilter}
                onChange={e => setSupplyTypeFilter(e.target.value as any)}
                className="input-base text-xs py-1.5 px-2.5 w-auto"
              >
                <option value="all">All Supplies (Local & Inter)</option>
                <option value="intra">Intra-State (CGST + SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>

              <select
                value={b2bFilter}
                onChange={e => setB2bFilter(e.target.value as any)}
                className="input-base text-xs py-1.5 px-2.5 w-auto"
              >
                <option value="all">All Customers</option>
                <option value="b2b">B2B (With GSTIN)</option>
                <option value="b2c">B2C (Unregistered)</option>
              </select>

              <select
                value={datePreset}
                onChange={e => setDatePreset(e.target.value as any)}
                className="input-base text-xs py-1.5 px-2.5 w-auto"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>

          {/* Desktop GST Report Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Date</th>
                    <th>Customer & GSTIN</th>
                    <th>Taxable Value</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>Total Tax</th>
                    <th>Invoice Total</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReportRows.map(row => {
                    const isB2B = !!(row.customerGstin && row.customerGstin.trim().length >= 15);
                    return (
                      <tr key={row.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                        <td>
                          <button
                            onClick={() => handleOpenDetailModal(row)}
                            className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100 hover:underline"
                          >
                            {row.invoiceNumber}
                          </button>
                        </td>
                        <td>
                          <span className="text-slate-600">{row.date}</span>
                        </td>
                        <td>
                          <div>
                            <p className="font-bold text-slate-900">{row.customerName}</p>
                            <p className="font-mono text-[11px] text-slate-400">
                              {isB2B ? row.customerGstin : 'B2C / Unregistered'}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono font-medium text-slate-900">
                            {formatCurrency(row.taxableValue)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-slate-600">
                            {row.cgst > 0 ? formatCurrency(row.cgst) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-slate-600">
                            {row.sgst > 0 ? formatCurrency(row.sgst) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-amber-700 font-semibold">
                            {row.igst > 0 ? formatCurrency(row.igst) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-indigo-700">
                            {formatCurrency(row.totalTax)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-black text-slate-900">
                            {formatCurrency(row.invoiceTotal)}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleOpenDetailModal(row)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View GST Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReportRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400">
                        <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No GST transactions found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                  <tr>
                    <td colSpan={3}>Summary Totals ({filteredReportRows.length} bills)</td>
                    <td className="font-mono text-slate-900">{formatCurrency(filteredTotals.taxable)}</td>
                    <td className="font-mono text-slate-700">{formatCurrency(filteredTotals.cgst)}</td>
                    <td className="font-mono text-slate-700">{formatCurrency(filteredTotals.sgst)}</td>
                    <td className="font-mono text-amber-700">{formatCurrency(filteredTotals.igst)}</td>
                    <td className="font-mono text-indigo-700 font-black">{formatCurrency(filteredTotals.tax)}</td>
                    <td className="font-mono text-slate-900 font-black">{formatCurrency(filteredTotals.total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mobile GST Report Cards (375x667 optimized) */}
          <div className="block md:hidden space-y-3">
            {filteredReportRows.map(row => (
              <div key={row.invoiceId} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {row.invoiceNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      row.supplyType === 'intra' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.supplyType === 'intra' ? 'Intra' : 'Inter (IGST)'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{row.date}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{row.customerName}</p>
                    <p className="font-mono text-[11px] text-slate-400">
                      {row.customerGstin || 'B2C Consumer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Tax</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {formatCurrency(row.totalTax)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] text-center border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Taxable</span>
                    <span className="font-mono font-semibold text-slate-800">{formatCurrency(row.taxableValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      {row.supplyType === 'intra' ? 'CGST/SGST' : 'IGST'}
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {row.supplyType === 'intra' ? `${formatCurrency(row.cgst)} ea` : formatCurrency(row.igst)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Bill Value</span>
                    <span className="font-mono font-black text-slate-900">{formatCurrency(row.invoiceTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => handleOpenDetailModal(row)}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View GST Info
                  </button>
                </div>
              </div>
            ))}
            {filteredReportRows.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No invoices found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GST Settings & Tax Configuration */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">GST Registration & Tax Configuration</h3>
                <p className="text-xs text-slate-500">Configure business GSTIN, place of supply, and default tax rules</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Business GSTIN */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business GSTIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={15}
                value={formGstin}
                onChange={e => setFormGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 29AABCK1234L1Z5"
                className="input-base font-mono font-bold text-sm tracking-wider uppercase"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standard 15-character Goods and Services Taxpayer Identification Number
              </p>
            </div>

            {/* Business State & State Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business State & POS Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={formStateCode}
                  onChange={e => setFormStateCode(e.target.value)}
                  className="input-base text-xs"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  State of registration determines Intra-State vs Inter-State supply
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default GST Rate (%) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDefaultRate}
                  onChange={e => setFormDefaultRate(Number(e.target.value))}
                  className="input-base text-xs font-semibold"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Essential Commodities)</option>
                  <option value={12}>12% (Standard Goods)</option>
                  <option value={18}>18% (General Standard Rate)</option>
                  <option value={28}>28% (Luxury / De-merit)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Applied to new products and bills by default
                </p>
              </div>
            </div>

            {/* Tax Scheme */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Tax Scheme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormTaxScheme('regular')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formTaxScheme === 'regular'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Regular Scheme</span>
                  <span className="text-[11px] text-slate-500">Collects and offsets CGST, SGST, IGST with Input Tax Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormTaxScheme('composition')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formTaxScheme === 'composition'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Composition Scheme</span>
                  <span className="text-[11px] text-slate-500">Simplified flat rate without collecting tax on invoices</span>
                </button>
              </div>
            </div>

            {/* E-Way Bill Threshold & RCM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  E-Way Bill Mandatory Threshold (₹)
                </label>
                <input
                  type="number"
                  value={formEWayBillThreshold}
                  onChange={e => setFormEWayBillThreshold(Number(e.target.value))}
                  className="input-base font-mono font-bold"
                  step={5000}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  National limit is ₹50,000 for consignment movement
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <label className="font-semibold text-slate-700 mb-1">
                  Reverse Charge Mechanism (RCM)
                </label>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={formEnableRcm}
                    onChange={e => setFormEnableRcm(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span className="text-slate-600">Enable RCM flag options in billing</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-100">
              <button
                type="submit"
                className="btn-primary text-xs px-6 py-2.5 gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" /> Save GST Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GST Invoice Details Modal */}
      <GSTInvoiceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        invoice={selectedInvoice}
        customer={customers.find(c => c.id === selectedInvoice?.customerId)}
        gstSettings={gstSettings}
        store={store}
        onViewFullInvoice={handleOpenFullInvoice}
      />

      {/* Full Tax Invoice Sheet Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          invoiceData={{
            invoiceNumber: previewInvoice.invoiceNumber,
            invoiceDate: previewInvoice.date,
            dueDate: previewInvoice.dueDate,
            customerName: previewInvoice.customerName,
            customerPhone: previewInvoice.customerPhone,
            customerGstin: previewInvoice.customerGstin,
            customerAddress: previewInvoice.customerAddress,
            items: (previewInvoice.items || []).map(item => ({
              productName: item.productName || item.name || 'Product',
              hsnCode: item.hsnCode || '9403',
              unit: item.unit || 'pcs',
              quantity: item.quantity,
              unitPrice: item.price ?? item.rate ?? 0,
              discount: item.discount || 0,
              gstRate: item.gstRate || 18,
              total: item.total,
            })),
            subtotal: previewInvoice.subtotal,
            discount: previewInvoice.discount,
            gst: previewInvoice.gst,
            total: previewInvoice.total,
            paid: previewInvoice.paid,
            balance: previewInvoice.balance,
            status: previewInvoice.status,
            paymentMethod: previewInvoice.paymentMethod,
            notes: previewInvoice.notes,
          }}
        />
      )}
    </div>
  );
};

export default GSTPage;

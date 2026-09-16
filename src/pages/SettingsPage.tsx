import React, { useState } from 'react';
import {
  Store as StoreIcon, User, Phone, Mail, MapPin, FileText,
  CreditCard, Shield, Save, CheckCircle2, AlertCircle, LogOut,
  Eye, EyeOff, Building2, Smartphone, Banknote, HelpCircle,
  Upload, Check, ArrowRight, X, AlertTriangle, KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PaymentMethodConfig } from '../types';
import LogoutConfirmationModal from '../components/layout/LogoutConfirmationModal';

type SettingsTab = 'business' | 'invoice' | 'gst' | 'payment_methods' | 'account' | 'security';

const INDIAN_STATES = [
  'Karnataka (29)',
  'Maharashtra (27)',
  'Tamil Nadu (33)',
  'Delhi (07)',
  'Gujarat (24)',
  'Uttar Pradesh (09)',
  'Telangana (36)',
  'Andhra Pradesh (37)',
  'Kerala (32)',
  'West Bengal (19)',
  'Rajasthan (08)',
  'Madhya Pradesh (23)',
  'Haryana (06)',
  'Punjab (03)',
  'Bihar (10)',
  'Odisha (21)',
  'Assam (18)',
  'Goa (30)',
];

export const SettingsPage: React.FC = () => {
  const {
    owner,
    store,
    invoiceSettings,
    paymentMethods,
    gstSettings,
    updateStore,
    updateOwner,
    updateInvoiceSettings,
    updatePaymentMethods,
    updateGstSettings,
    showToast,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  // Business Profile Form State
  const [storeName, setStoreName] = useState(store.name);
  const [storeTagline, setStoreTagline] = useState(store.tagline);
  const [storePhone, setStorePhone] = useState(store.phone);
  const [storeEmail, setStoreEmail] = useState(store.email);
  const [storeAddress, setStoreAddress] = useState(store.address);
  const [storeCity, setStoreCity] = useState(store.city);
  const [storeState, setStoreState] = useState(`${store.state} (29)`);
  const [storeGstin, setStoreGstin] = useState(store.gstin);
  const [storeLogo, setStoreLogo] = useState<string | undefined>(store.logo);

  // Invoice Settings Form State
  const [invoicePrefix, setInvoicePrefix] = useState(invoiceSettings.prefix);
  const [startingNumber, setStartingNumber] = useState(invoiceSettings.nextNumber);
  const [showLogo, setShowLogo] = useState(invoiceSettings.showLogo);
  const [terms, setTerms] = useState(invoiceSettings.termsAndConditions);
  const [footerText, setFooterText] = useState(invoiceSettings.footerText);

  // GST Settings Form State
  const [gstGstin, setGstGstin] = useState(gstSettings.gstin);
  const [gstState, setGstState] = useState(`${gstSettings.businessState} (${gstSettings.stateCode})`);
  const [defaultGstRate, setDefaultGstRate] = useState(gstSettings.defaultGstRate);
  const [taxScheme, setTaxScheme] = useState(gstSettings.taxScheme);
  const [enableRCM, setEnableRCM] = useState(gstSettings.enableRCM);
  const [eWayBillThreshold, setEWayBillThreshold] = useState(gstSettings.eWayBillThreshold);

  // Payment Methods Form State
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(paymentMethods);

  // Account Form State
  const [ownerName, setOwnerName] = useState(owner.name);
  const [ownerEmail, setOwnerEmail] = useState(owner.email);
  const [ownerPhone, setOwnerPhone] = useState(owner.phone);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handlers
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    const stateName = storeState.split(' (')[0];
    updateStore({
      name: storeName,
      tagline: storeTagline,
      phone: storePhone,
      email: storeEmail,
      address: storeAddress,
      city: storeCity,
      state: stateName,
      gstin: storeGstin.toUpperCase(),
      logo: storeLogo,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo image must be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setStoreLogo(result);
        showToast('Logo uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setStoreLogo(undefined);
    showToast('Logo reset to default initials', 'info');
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoiceSettings({
      prefix: invoicePrefix,
      nextNumber: Number(startingNumber) || 1,
      showLogo,
      termsAndConditions: terms,
      footerText,
    });
  };

  const handleSaveGST = (e: React.FormEvent) => {
    e.preventDefault();
    const stateName = gstState.split(' (')[0];
    const codeMatch = gstState.match(/\((\d+)\)/);
    const code = codeMatch ? codeMatch[1] : '29';
    updateGstSettings({
      gstin: gstGstin.toUpperCase(),
      businessState: stateName,
      stateCode: code,
      defaultGstRate: Number(defaultGstRate),
      taxScheme,
      enableRCM,
      eWayBillThreshold: Number(eWayBillThreshold) || 50000,
    });
  };

  const handleToggleMethod = (id: string) => {
    setMethods(prev => prev.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleSetDefaultMethod = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id, enabled: m.id === id ? true : m.enabled })));
  };

  const handleMethodDetailChange = (id: string, detail: string) => {
    setMethods(prev => prev.map(m => (m.id === id ? { ...m, details: detail } : m)));
  };

  const handleSavePaymentMethods = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMethods(methods);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwner({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(true);
    showToast('Password changed successfully');
  };

  const tabs = [
    { id: 'business' as SettingsTab, label: 'Business Profile', icon: Building2, desc: 'Store info & branding' },
    { id: 'invoice' as SettingsTab, label: 'Invoice Settings', icon: FileText, desc: 'Numbering & templates' },
    { id: 'gst' as SettingsTab, label: 'GST Settings', icon: StoreIcon, desc: 'Taxes & compliance' },
    { id: 'payment_methods' as SettingsTab, label: 'Payment Methods', icon: CreditCard, desc: 'UPI, Cash & POS' },
    { id: 'account' as SettingsTab, label: 'Account', icon: User, desc: 'Owner profile & contact' },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield, desc: 'Password & session' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your store profile, invoices, taxes, and system preferences
          </p>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="btn-ghost text-red-600 hover:bg-red-50 border border-red-200 self-start sm:self-auto gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Settings Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Tabs (Desktop sidebar / Mobile horizontal scroll) */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex lg:flex-col overflow-x-auto gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-left font-medium transition-all duration-200 flex-shrink-0 lg:w-full
                    ${isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">{tab.label}</p>
                    <p className={`text-[11px] hidden lg:block ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 min-w-0">
          {/* 1. BUSINESS PROFILE TAB */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Official business information printed on your invoices and receipts.</p>
                </div>
                <span className="badge badge-success hidden sm:inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Store
                </span>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-6">
                {/* Logo & Branding */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-200 flex-shrink-0 overflow-hidden">
                    {storeLogo ? (
                      <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                    ) : (
                      storeName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <p className="font-bold text-slate-900 text-sm">Store Brand Logo</p>
                    <p className="text-xs text-slate-500 mt-0.5">Appears on invoices, bill printouts, and tax documents (PNG, JPG max 2MB).</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <label className="btn-secondary py-1.5 px-3 text-xs cursor-pointer gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      {storeLogo && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="btn-ghost py-1.5 px-3 text-xs text-slate-400 hover:text-slate-600"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Business / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={storeTagline}
                      onChange={e => setStoreTagline(e.target.value)}
                      className="input-base"
                      placeholder="e.g. Quality & Trust Since 2010"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Official Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={storePhone}
                      onChange={e => setStorePhone(e.target.value)}
                      className="input-base font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store Email Address *</label>
                    <input
                      type="email"
                      required
                      value={storeEmail}
                      onChange={e => setStoreEmail(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={storeAddress}
                      onChange={e => setStoreAddress(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={storeCity}
                      onChange={e => setStoreCity(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Business State *</label>
                    <select
                      value={storeState}
                      onChange={e => setStoreState(e.target.value)}
                      className="input-base"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store GSTIN *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={storeGstin}
                      onChange={e => setStoreGstin(e.target.value.toUpperCase())}
                      className="input-base font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Business Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. INVOICE SETTINGS TAB */}
          {activeTab === 'invoice' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Invoice Settings</h2>
                <p className="text-xs sm:text-sm text-slate-500">Configure numbering format, printing preferences, and legal terms on invoices.</p>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Invoice Number Prefix *</label>
                    <input
                      type="text"
                      required
                      value={invoicePrefix}
                      onChange={e => setInvoicePrefix(e.target.value)}
                      className="input-base font-mono"
                      placeholder="e.g. INV-2026-"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Generated sample: <strong className="font-mono text-slate-700">{invoicePrefix}0090</strong></p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Next Sequence Number</label>
                    <input
                      type="number"
                      min={1}
                      value={startingNumber}
                      onChange={e => setStartingNumber(Number(e.target.value))}
                      className="input-base font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Increments automatically with each new bill issued.</p>
                  </div>
                </div>

                {/* Logo Visibility Switch */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Show Store Logo on Printouts</p>
                    <p className="text-xs text-slate-500">Include your business logo in the top header of printable A4 invoices.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={e => setShowLogo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Default Terms & Conditions</label>
                  <textarea
                    rows={4}
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                    className="input-base text-xs font-mono"
                    placeholder="Enter policy, return window, or warranty disclaimer..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Prints at the bottom-left of every generated customer invoice.</p>
                </div>

                {/* Footer message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Invoice Footer Note</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={e => setFooterText(e.target.value)}
                    className="input-base"
                    placeholder="e.g. Thank you for your business with Kumar Enterprises!"
                  />
                </div>

                {/* Live Preview Card */}
                <div className="p-4 rounded-2xl border border-primary-200 bg-primary-50/50 space-y-2">
                  <p className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Preview of Invoice Footer
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-primary-100 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Terms & Conditions:</p>
                    <p className="whitespace-pre-line text-slate-500 font-mono text-[11px]">{terms}</p>
                    <p className="text-center pt-2 font-medium text-primary-700 border-t border-slate-100">{footerText}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Invoice Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. GST SETTINGS TAB */}
          {activeTab === 'gst' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">GST Settings</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Manage tax rates, GSTIN registration parameters, and supply rules.</p>
                </div>
                <span className="badge badge-info">Indian GST Compliant</span>
              </div>

              <form onSubmit={handleSaveGST} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Registered Business GSTIN *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstGstin}
                      onChange={e => setGstGstin(e.target.value.toUpperCase())}
                      className="input-base font-mono uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Registered State & Code *</label>
                    <select
                      value={gstState}
                      onChange={e => setGstState(e.target.value)}
                      className="input-base"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Default GST Tax Rate</label>
                    <select
                      value={defaultGstRate}
                      onChange={e => setDefaultGstRate(Number(e.target.value))}
                      className="input-base"
                    >
                      <option value={0}>0% (Exempt / Nil Rated)</option>
                      <option value={5}>5% (Essential Goods)</option>
                      <option value={12}>12% (Standard Lower)</option>
                      <option value={18}>18% (Standard Higher / Services)</option>
                      <option value={28}>28% (Luxury / De-merit)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Pre-selected when creating new items without assigned tax.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tax Scheme</label>
                    <select
                      value={taxScheme}
                      onChange={e => setTaxScheme(e.target.value as any)}
                      className="input-base"
                    >
                      <option value="regular">Regular Scheme (Input Tax Credit eligible)</option>
                      <option value="composition">Composition Scheme (Fixed 1% turnover tax)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">E-Way Bill Threshold (₹)</label>
                    <input
                      type="number"
                      value={eWayBillThreshold}
                      onChange={e => setEWayBillThreshold(Number(e.target.value))}
                      className="input-base font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Statutory threshold for generation of mandatory e-Way bill.</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 self-end">
                    <div>
                      <p className="font-bold text-slate-900 text-xs uppercase">Reverse Charge (RCM)</p>
                      <p className="text-xs text-slate-500">Enable if liable to pay tax on inward supplies</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableRCM}
                      onChange={e => setEnableRCM(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-5 h-5"
                    />
                  </div>
                </div>

                {/* Tax Breakdown Explainer */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-primary-600" />
                    How BillFlow Pro Computes GST for Your Store:
                  </p>
                  <p>• <strong>Intrastate Supplies (within Karnataka - 29):</strong> Tax is automatically divided equally into <strong>CGST (50%)</strong> and <strong>SGST (50%)</strong>.</p>
                  <p>• <strong>Interstate Supplies (outside Karnataka):</strong> Full tax is levied as <strong>IGST (100%)</strong>.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save GST Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. PAYMENT METHODS TAB */}
          {activeTab === 'payment_methods' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Accepted Payment Methods</h2>
                <p className="text-xs sm:text-sm text-slate-500">Enable or disable payment options and set your preferred default payment method for fast billing.</p>
              </div>

              <form onSubmit={handleSavePaymentMethods} className="space-y-4">
                {methods.map(method => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                      ${method.enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                        {method.id === 'upi' && <Smartphone className="w-5 h-5 text-violet-600" />}
                        {method.id === 'cash' && <Banknote className="w-5 h-5 text-emerald-600" />}
                        {method.id === 'card' && <CreditCard className="w-5 h-5 text-blue-600" />}
                        {method.id === 'bank_transfer' && <Building2 className="w-5 h-5 text-amber-600" />}
                        {method.id === 'other' && <FileText className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{method.name}</p>
                          {method.isDefault && (
                            <span className="badge badge-success text-[10px] py-0.5">Default</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={method.details || ''}
                          onChange={e => handleMethodDetailChange(method.id, e.target.value)}
                          disabled={!method.enabled}
                          className="input-base py-1 px-2.5 text-xs mt-1.5 max-w-sm"
                          placeholder={`Instructions or account details for ${method.name}...`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleSetDefaultMethod(method.id)}
                        disabled={method.isDefault || !method.enabled}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors
                          ${method.isDefault ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                      >
                        {method.isDefault ? 'Default' : 'Set as Default'}
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={() => handleToggleMethod(method.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Payment Methods</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 5. ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Owner Account</h2>
                <p className="text-xs sm:text-sm text-slate-500">Manage your profile credentials and application sign-in identity.</p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-6">
                {/* Avatar Banner */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-primary-200 flex-shrink-0">
                    {ownerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{ownerName}</h3>
                    <p className="text-xs text-slate-500">{owner.role} · Administrator</p>
                    <span className="badge badge-success text-[10px] mt-1 inline-flex">Single-Store Owner</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role / Designation</label>
                    <input
                      type="text"
                      disabled
                      value={owner.role}
                      className="input-base bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sign-in Email Address *</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      className="input-base font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change password</span>
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setShowLogoutModal(true)}
                      className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Account Details</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 6. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
                <p className="text-xs sm:text-sm text-slate-500">Update your store owner password and review active session status.</p>
              </div>

              {/* Password update form */}
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary-600" />
                  Change Store Password
                </h3>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Your password was successfully updated!</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="input-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input-base"
                  />
                </div>

                <button type="submit" className="btn-primary w-full sm:w-auto gap-2">
                  <Save className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>

              {/* Active Session & Logout */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Active Session</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="font-bold text-slate-900 text-sm">Current Browser Session</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Device: Windows Desktop · Logged in as {owner.email}</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="btn-ghost text-red-600 border border-red-200 hover:bg-red-50 text-xs px-3 py-2 gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        ownerEmail={owner.email}
      />
    </div>
  );
};

export default SettingsPage;

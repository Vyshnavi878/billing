import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Building2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: any) => void;
  initialData?: Customer | null;
}

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

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka (29)');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setState(initialData.state || 'Karnataka (29)');
      setGstin(initialData.gstin || '');
      setNotes(initialData.notes || '');
      setStatus(initialData.status || 'active');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('Bengaluru');
      setState('Karnataka (29)');
      setGstin('');
      setNotes('');
      setStatus('active');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Customer name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Enter a valid 10-digit phone number';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (gstin.trim() && gstin.trim().length !== 15) {
      errs.gstin = 'GSTIN must be 15 alphanumeric characters (or leave empty if unregistered)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...(initialData ? { ...initialData } : {}),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim() || 'Bengaluru',
      state: state.trim(),
      gstin: gstin.trim() ? gstin.trim().toUpperCase() : undefined,
      notes: notes.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isEdit ? 'Edit Customer Record' : 'Add New Customer'}
              </h2>
              <p className="text-xs text-slate-400">Business ledger contact (Single-Store)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra / Krishna Enterprises"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`input-base pl-10 ${errors.name ? 'input-error' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`input-base pl-10 font-mono ${errors.phone ? 'input-error' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="customer@domain.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`input-base pl-10 ${errors.email ? 'input-error' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  placeholder="Plot/Shop #, Street, Landmark..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-base pl-10 text-xs resize-none"
                />
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State (Place of Supply)
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="input-base"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GSTIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Customer GSTIN
                </label>
                <span className="text-[11px] text-slate-400">Optional for B2C consumer</span>
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  maxLength={15}
                  placeholder="29AAAAA0000A1Z5 (15 chars)"
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  className={`input-base pl-10 font-mono uppercase font-semibold ${errors.gstin ? 'input-error' : ''}`}
                />
              </div>
              {errors.gstin && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.gstin}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Notes / Ledger Remarks
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  placeholder="Special discounts, credit terms, delivery instructions, etc."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-base pl-10 text-xs resize-none"
                />
              </div>
            </div>

            {/* Status (for edit mode) */}
            {isEdit && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800 uppercase">Account Status</p>
                  <p className="text-[11px] text-slate-400">Mark active or dormant</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      status === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      status === 'inactive' ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-2.5 px-5 text-xs font-semibold"
            >
              {isEdit ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

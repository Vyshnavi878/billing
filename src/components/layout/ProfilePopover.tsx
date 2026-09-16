import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfilePopover: React.FC = () => {
  const { owner, store } = useApp();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Extract owner initials (e.g., "Rajesh Kumar" -> "RK")
  const initials = owner.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex-shrink-0" ref={popoverRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-200/70 transition-all duration-200 group cursor-pointer"
        aria-label="Account information"
        aria-expanded={open}
      >
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Minimal Account / Business Popover */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-scale-in"
          role="dialog"
          aria-label="Store Owner Details"
        >
          {/* Owner info */}
          <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {owner.name}
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md mt-0.5">
                <ShieldCheck className="w-3 h-3 text-primary-500" />
                {owner.role || 'Store Owner'}
              </span>
            </div>
          </div>

          {/* Company / Business info */}
          <div className="pt-3 pb-2 space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{store.name}</p>
                  {store.tagline && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{store.tagline}</p>
                  )}
                  {store.gstin && (
                    <p className="text-[10px] font-mono font-medium text-slate-600 mt-1">
                      GSTIN: <span className="text-slate-800">{store.gstin}</span>
                    </p>
                  )}
                  {store.city && store.state && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{store.city}, {store.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="px-1 space-y-1.5">
              {owner.email && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </div>
              )}
              {owner.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-mono">{owner.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;

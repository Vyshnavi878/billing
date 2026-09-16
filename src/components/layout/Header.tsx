import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationBell from '../notifications/NotificationBell';
import ProfilePopover from './ProfilePopover';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back, Rajesh!' },
  '/billing': { title: 'Billing', subtitle: 'Create & manage bills' },
  '/invoices': { title: 'Invoices', subtitle: 'Track all invoices' },
  '/inventory': { title: 'Inventory', subtitle: 'Manage your products' },
  '/customers': { title: 'Customers', subtitle: 'View & manage customers' },
  '/payments': { title: 'Payments', subtitle: 'Payment transactions' },
  '/expenses': { title: 'Expenses', subtitle: 'Track your expenses' },
  '/gst': { title: 'GST', subtitle: 'GST reports & compliance' },
  '/reports': { title: 'Reports', subtitle: 'Business analytics' },
  '/settings': { title: 'Settings', subtitle: 'App preferences' },
  '/notifications': { title: 'Notifications', subtitle: 'Stay updated with important activity from your store' },
};

export const Header: React.FC = () => {
  const { toggleMobileMenu, mobileMenuOpen } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'BillFlow', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20 shadow-xs">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page title */}
      <div className="flex-shrink-0 min-w-0">
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{pageInfo.title}</h2>
        <p className="text-xs text-slate-500 leading-tight hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar (desktop) */}
      <div className={`relative hidden md:flex items-center transition-all duration-300 ${searchFocused ? 'w-72' : 'w-56'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search invoices, customers..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border border-transparent 
            outline-none transition-all duration-200
            focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Action items: Notifications Bell & Profile Popover */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <NotificationBell />
        <ProfilePopover />
      </div>
    </header>
  );
};

export default Header;

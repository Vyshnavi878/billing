import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, FileText, Package, Users,
  CreditCard, TrendingDown, Calculator, BarChart3, Settings,
  X, Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LogoutButton from './LogoutButton';

// Bottom nav - most used items
const bottomNavItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing', path: '/billing', icon: Receipt },
  { id: 'invoices', label: 'Invoices', path: '/invoices', icon: FileText },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
];

// Full drawer items
const drawerItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing', path: '/billing', icon: Receipt },
  { id: 'invoices', label: 'Invoices', path: '/invoices', icon: FileText },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users },
  { id: 'payments', label: 'Payments', path: '/payments', icon: CreditCard },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: TrendingDown },
  { id: 'gst', label: 'GST', path: '/gst', icon: Calculator },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

const MobileNav: React.FC = () => {
  const { mobileMenuOpen, closeMobileMenu, store } = useApp();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-area-bottom shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-0 flex-1 transition-all duration-200
                  ${isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-100' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium truncate ${isActive ? 'text-primary-600' : ''}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Full menu drawer overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-slate-900 z-50 flex flex-col animate-slide-in-left shadow-2xl">
            {/* Store header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">{store.name}</h1>
                  <p className="text-xs text-slate-400">BillFlow Pro</p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin space-y-0.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Main Menu</p>
              {drawerItems.slice(0, 6).map(item => <DrawerNavItem key={item.id} item={item} location={location.pathname} />)}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 mt-4">Finance & Reports</p>
              {drawerItems.slice(6, 9).map(item => <DrawerNavItem key={item.id} item={item} location={location.pathname} />)}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 mt-4">Settings</p>
              {drawerItems.slice(9).map(item => <DrawerNavItem key={item.id} item={item} location={location.pathname} />)}
            </nav>

            {/* Standalone Logout */}
            <div className="border-t border-white/10 p-3 flex-shrink-0">
              <LogoutButton isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DrawerNavItem: React.FC<{ item: typeof drawerItems[number]; location: string }> = ({ item, location }) => {
  const Icon = item.icon;
  const isActive = item.path === '/' ? location === '/' : location.startsWith(item.path);
  return (
    <NavLink
      to={item.path}
      className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export default MobileNav;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, FileText, Package, Users,
  CreditCard, TrendingDown, Calculator, BarChart3, Settings,
  ChevronLeft, Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LogoutButton from './LogoutButton';

const mainMenuNavItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing', path: '/billing', icon: Receipt },
  { id: 'invoices', label: 'Invoices', path: '/invoices', icon: FileText },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users },
  { id: 'payments', label: 'Payments', path: '/payments', icon: CreditCard },
];

const financeNavItems = [
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: TrendingDown },
  { id: 'gst', label: 'GST', path: '/gst', icon: Calculator },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
];

const settingsNavItems = [
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { store, sidebarCollapsed, toggleSidebar } = useApp();
  const location = useLocation();

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-slate-900 fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}`}
    >
      {/* Store header */}
      <div className={`flex items-center border-b border-white/10 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-5 py-4 gap-3'}`}>
        {/* Logo */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white truncate leading-tight">{store.name}</h1>
            <p className="text-xs text-slate-400 truncate leading-tight">BillFlow Pro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin space-y-0.5">
        {!sidebarCollapsed && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Main Menu</p>
        )}
        {mainMenuNavItems.map(item => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={sidebarCollapsed}
            active={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)}
          />
        ))}

        {!sidebarCollapsed && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 mt-4">Finance & Reports</p>
        )}
        {sidebarCollapsed && <div className="h-px bg-white/10 my-2" />}
        {financeNavItems.map(item => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={sidebarCollapsed}
            active={location.pathname.startsWith(item.path)}
          />
        ))}

        {!sidebarCollapsed && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 mt-4">Settings</p>
        )}
        {sidebarCollapsed && <div className="h-px bg-white/10 my-2" />}
        {settingsNavItems.map(item => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={sidebarCollapsed}
            active={location.pathname.startsWith(item.path)}
          />
        ))}
      </nav>

      {/* Standalone Logout Section */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <LogoutButton collapsed={sidebarCollapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-[72px] w-7 h-7 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all duration-200 shadow-lg"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
};

interface SidebarNavItemProps {
  item: typeof mainMenuNavItems[number];
  collapsed: boolean;
  active: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, collapsed, active }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`nav-item relative group ${active ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed ? 'justify-center px-0 w-full' : ''}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {/* Active indicator dot */}
      {active && collapsed && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-400 rounded-full" />
      )}
      {/* Tooltip for collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </div>
      )}
    </NavLink>
  );
};

export default Sidebar;

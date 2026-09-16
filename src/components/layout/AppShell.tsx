import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppShell: React.FC = () => {
  const { sidebarCollapsed, toast } = useApp();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          lg:pl-64 ${sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-64'}`}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile navigation */}
        <MobileNav />
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300
            ${toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' :
              toast.type === 'error' ? 'bg-red-600 text-white border-red-500' :
              'bg-primary-600 text-white border-primary-500'}`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-primary-200 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, LogOut, ChevronDown, Store, Phone, Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProfileMenuProps {
  collapsed?: boolean;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ collapsed = false }) => {
  const { owner, store, logout } = useApp();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200
          hover:bg-white/10 text-white group ${collapsed ? 'justify-center' : ''}`}
        aria-label="Owner profile menu"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {owner.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{owner.name}</p>
              <p className="text-xs text-slate-400 truncate leading-tight">{owner.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 w-72 animate-scale-in
          ${collapsed ? 'left-full ml-3 bottom-0' : 'bottom-full mb-2 left-0 right-0'}`}>
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
                {owner.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{owner.name}</p>
                <p className="text-xs text-slate-500 truncate">{owner.email}</p>
                <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  <Store className="w-3 h-3" /> {store.name}
                </span>
              </div>
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3 h-3" /> {owner.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3 h-3" /> {owner.email}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <MenuItem icon={<User className="w-4 h-4" />} label="My Profile" onClick={() => { navigate('/settings'); setOpen(false); }} />
            <MenuItem icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => { navigate('/settings'); setOpen(false); }} />
            <MenuItem icon={<Store className="w-4 h-4" />} label="Store Info" onClick={() => { navigate('/settings'); setOpen(false); }} />
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150"
  >
    <span className="text-slate-500">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

export default ProfileMenu;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';

interface LogoutButtonProps {
  collapsed?: boolean;
  className?: string;
  isMobile?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  collapsed = false,
  className = '',
  isMobile = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { logout, owner } = useApp();
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    setShowModal(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        title={collapsed ? 'Logout' : undefined}
        className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:bg-rose-500/20 active:scale-[0.98]
          ${collapsed ? 'justify-center px-0' : ''} ${className}`}
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5 flex-shrink-0 text-rose-400 group-hover:text-rose-300 transition-colors" />
        {!collapsed && <span>Logout</span>}

        {/* Tooltip for collapsed desktop state */}
        {collapsed && !isMobile && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-rose-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
            Logout
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
          </div>
        )}
      </button>

      <LogoutConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmLogout}
        ownerEmail={owner.email}
      />
    </>
  );
};

export default LogoutButton;

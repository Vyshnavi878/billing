import React, { useEffect } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ownerEmail?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ownerEmail,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h3 id="logout-dialog-title" className="text-lg font-bold text-slate-900">
            Are you sure you want to log out?
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {ownerEmail
              ? `You will need to sign in again with ${ownerEmail} to access your store billing and reports.`
              : 'You will be signed out of your current session and returned to the login screen.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 px-4 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;

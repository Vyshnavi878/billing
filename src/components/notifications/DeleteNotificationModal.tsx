import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearAll?: boolean;
}

export const DeleteNotificationModal: React.FC<DeleteNotificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isClearAll = false,
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
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 className="w-7 h-7" />
        </div>

        <div>
          <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
            {isClearAll ? 'Clear all notifications?' : 'Delete notification?'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {isClearAll
              ? 'This will permanently remove all notifications from your notification history.'
              : 'Are you sure you want to delete this notification?'}
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearAll ? 'Clear all' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteNotificationModal;

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { unreadNotificationsCount } = useApp();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={bellRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer
          ${open ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-100' : 'text-slate-600 hover:bg-slate-100'}`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 transition-transform group-hover:scale-105" />
        <NotificationBadge count={unreadNotificationsCount} />
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
};

export default NotificationBell;

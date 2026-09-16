import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm ring-2 ring-white animate-scale-in ${className}`}
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;

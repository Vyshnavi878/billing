import React from 'react';
import {
  CheckCircle2, AlertTriangle, FileText, TrendingDown,
  Calculator, Package, ExternalLink, Check, Trash2,
} from 'lucide-react';
import type { Notification } from '../../types';

export interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'payments':
        return {
          icon: <CheckCircle2 className={compact ? "w-3.5 h-3.5 text-emerald-600" : "w-4 h-4 text-emerald-600"} />,
          bg: 'bg-emerald-50 border-emerald-200/60',
        };
      case 'inventory':
        return {
          icon: <AlertTriangle className={compact ? "w-3.5 h-3.5 text-amber-600" : "w-4 h-4 text-amber-600"} />,
          bg: 'bg-amber-50 border-amber-200/60',
        };
      case 'billing':
        return {
          icon: <FileText className={compact ? "w-3.5 h-3.5 text-indigo-600" : "w-4 h-4 text-indigo-600"} />,
          bg: 'bg-indigo-50 border-indigo-200/60',
        };
      case 'expenses':
        return {
          icon: <TrendingDown className={compact ? "w-3.5 h-3.5 text-rose-600" : "w-4 h-4 text-rose-600"} />,
          bg: 'bg-rose-50 border-rose-200/60',
        };
      case 'gst':
        return {
          icon: <Calculator className={compact ? "w-3.5 h-3.5 text-blue-600" : "w-4 h-4 text-blue-600"} />,
          bg: 'bg-blue-50 border-blue-200/60',
        };
      default:
        return {
          icon: <Package className={compact ? "w-3.5 h-3.5 text-slate-600" : "w-4 h-4 text-slate-600"} />,
          bg: 'bg-slate-50 border-slate-200',
        };
    }
  };

  const { icon, bg } = getIcon();

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`group relative flex items-start gap-3 transition-all duration-150 cursor-pointer text-left
        ${compact ? 'px-4 py-3 border-b border-slate-100 hover:bg-slate-50/80' : 'p-4 sm:p-5 rounded-2xl border mb-3 hover:shadow-md'}
        ${
          !notification.read
            ? compact
              ? 'bg-primary-50/30'
              : 'bg-primary-50/20 border-primary-200/60 shadow-sm'
            : compact
            ? 'bg-white'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
    >
      {/* Icon badge */}
      <div
        className={`${
          compact ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl'
        } flex items-center justify-center flex-shrink-0 border ${bg} transition-transform group-hover:scale-105 shadow-xs`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`leading-snug truncate ${
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                } ${
                  !notification.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                }`}
              >
                {notification.title}
              </h4>
              {!notification.read && (
                <span
                  className={`${
                    compact ? 'w-1.5 h-1.5' : 'w-2 h-2 ring-4 ring-primary-100/70'
                  } rounded-full bg-primary-600 flex-shrink-0`}
                  title="Unread"
                />
              )}
            </div>

            <p
              className={`${
                compact ? 'text-[11px] mt-0.5 line-clamp-2' : 'text-xs sm:text-sm mt-1'
              } text-slate-600 leading-relaxed`}
            >
              {notification.message}
            </p>

            <p
              className={`${
                compact ? 'text-[10px] mt-1' : 'text-[11px] mt-1.5'
              } text-slate-400 flex items-center gap-1`}
            >
              <span>{notification.time}</span>
            </p>
          </div>

          {/* Subtle delete button with accessible tooltip, prominent on hover */}
          {onDelete && (
            <button
              type="button"
              title="Delete notification"
              aria-label="Delete notification"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id, e);
              }}
              className={`${
                compact ? 'p-1.5' : 'p-2 sm:p-2.5'
              } rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-150 opacity-70 sm:opacity-40 group-hover:opacity-100 focus:opacity-100 focus:outline-hidden active:scale-90 flex-shrink-0 cursor-pointer`}
            >
              <Trash2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
            </button>
          )}
        </div>

        {/* Action row (only when not compact or if actionLabel exists) */}
        {!compact && (
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100/80">
            {notification.targetPath && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span>{notification.actionLabel || 'View Details'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {!notification.read && onMarkAsRead && (
              <button
                type="button"
                onClick={e => onMarkAsRead(notification.id, e)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors ml-auto cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Mark as read</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;

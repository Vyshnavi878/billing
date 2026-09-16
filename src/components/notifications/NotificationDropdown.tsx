import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCheck, BellOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Notification } from '../../types';
import NotificationItem from './NotificationItem';
import DeleteNotificationModal from './DeleteNotificationModal';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useApp();
  const navigate = useNavigate();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSelectNotification = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    onClose();
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteNotification(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <div
        className="absolute -right-14 sm:right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in z-50"
        role="dialog"
        aria-label="Recent notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {unreadNotificationsCount > 0 ? (
              <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                {unreadNotificationsCount} new
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">All caught up</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleViewAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
          {recentNotifications.length > 0 ? (
            recentNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onClick={handleSelectNotification}
                onDelete={handleDeleteNotification}
              />
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BellOff className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No notifications yet</p>
              <p className="text-[11px] text-slate-400">
                You're all caught up. New store activity will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleViewAll}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50/60 rounded-xl transition-all cursor-pointer"
          >
            <span>View all notifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteNotificationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isClearAll={false}
      />
    </>
  );
};

export default NotificationDropdown;

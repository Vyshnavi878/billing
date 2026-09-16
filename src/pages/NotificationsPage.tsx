import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, BellOff, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Notification, NotificationCategory } from '../types';
import NotificationItem from '../components/notifications/NotificationItem';
import DeleteNotificationModal from '../components/notifications/DeleteNotificationModal';

type FilterTab = 'all' | 'unread' | NotificationCategory;

interface TabConfig {
  id: FilterTab;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'payments', label: 'Payments' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'billing', label: 'Billing' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'gst', label: 'GST' },
];

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(n => !n.read);
      default:
        return notifications.filter(n => n.category === activeTab);
    }
  }, [notifications, activeTab]);

  const handleSelectNotification = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id);
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

  const confirmClearAll = () => {
    clearAllNotifications();
    setShowClearAllModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadNotificationsCount > 0 && (
              <span className="badge badge-danger font-bold text-xs">
                {unreadNotificationsCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with important activity from your store.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              disabled={unreadNotificationsCount === 0}
              className={`btn-secondary py-2 sm:py-2.5 px-3 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 border-slate-200 transition-colors ${
                unreadNotificationsCount === 0
                  ? 'opacity-50 cursor-not-allowed text-slate-400'
                  : 'hover:border-slate-300 cursor-pointer'
              }`}
            >
              <CheckCheck className="w-4 h-4 text-primary-600" />
              <span>Mark all as read</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="inline-flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-4 text-xs font-semibold rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-x-auto scrollbar-thin">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          let count = 0;
          if (tab.id === 'all') {
            count = notifications.length;
          } else if (tab.id === 'unread') {
            count = unreadNotificationsCount;
          } else {
            count = notifications.filter(n => n.category === tab.id).length;
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer
                ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold
                    ${
                      isActive
                        ? 'bg-primary-700/80 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification Cards List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleSelectNotification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            No notifications yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
            {notifications.length === 0 || activeTab === 'all'
              ? "You're all caught up. New store activity will appear here."
              : activeTab === 'unread'
              ? "You're all caught up. No unread notifications at the moment."
              : `No activity found under ${activeTab}. Store notifications will appear here.`}
          </p>

          {activeTab !== 'all' && notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="btn-secondary py-2 px-4 text-xs font-semibold mt-5 mx-auto cursor-pointer"
            >
              Show all notifications
            </button>
          )}
        </div>
      )}

      {/* Delete Single Notification Modal */}
      <DeleteNotificationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isClearAll={false}
      />

      {/* Clear All Notifications Modal */}
      <DeleteNotificationModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={confirmClearAll}
        isClearAll={true}
      />
    </div>
  );
};

export default NotificationsPage;

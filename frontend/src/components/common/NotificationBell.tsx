import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCircle2, Clock, Package, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService, AppNotification } from '@/services/notificationService';
import { formatRelativeTime } from '@/utils/dateFormatter';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(list || []);
      const unread = (list || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      // Silently catch in bell
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'DELIVERED':
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'ASSIGNED':
      case 'IN_TRANSIT':
      case 'PICKED_UP':
      case 'SHIPMENT':
        return <Package className="h-4 w-4 text-primary-500" />;
      case 'TICKET':
      case 'COMPLAINT':
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-navy-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-navy-500 hover:text-navy-700 relative rounded-lg hover:bg-navy-50 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-navy-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Dropdown Header */}
          <div className="px-4 py-2 border-b border-navy-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-navy-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-navy-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-navy-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkAsRead(n.id, { stopPropagation: () => {} } as any);
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className={`p-3.5 hover:bg-navy-50 cursor-pointer flex items-start gap-3 transition-colors ${
                    !n.isRead ? 'bg-primary-50/20' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-navy-50 flex-shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-navy-900' : 'font-medium text-navy-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-navy-400 whitespace-nowrap">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-navy-500 line-clamp-2 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="px-4 py-2 border-t border-navy-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold inline-flex items-center gap-1"
            >
              View all notifications <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Bell, Truck, AlertTriangle, CheckCircle2, Package, 
  HelpCircle, RefreshCw, Check, Search, Filter 
} from 'lucide-react';
import { notificationService, AppNotification } from '@/services/notificationService';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notificationService.getMyNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch ((type || '').toUpperCase()) {
      case 'DELIVERED':
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'ASSIGNED':
      case 'IN_TRANSIT':
      case 'PICKED_UP':
      case 'SHIPMENT':
        return <Package className="h-5 w-5 text-primary-500" />;
      case 'TICKET':
      case 'COMPLAINT':
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-navy-500" />;
    }
  };

  const filtered = notifications.filter(n => {
    const matchesFilter = filter === 'ALL' || (filter === 'UNREAD' && !n.isRead);
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notification Center</h1>
          <p className="text-sm text-navy-500 mt-1">
            Real-time delivery status alerts, dispatch announcements, and support updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchNotifications} disabled={loading} className="h-10">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} className="h-10">
              <Check className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
              <Input
                placeholder="Search alerts and notifications..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'ALL'
                    ? 'bg-primary-600 text-white'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'UNREAD'
                    ? 'bg-primary-600 text-white'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-navy-400">Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Bell className="h-12 w-12 text-navy-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">
                {filter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Yet'}
              </h3>
              <p className="text-sm text-navy-500 mt-1">
                You will receive alerts when shipments advance, drivers are assigned, or tickets update.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 flex items-start gap-4 transition-colors ${
                    !n.isRead ? 'bg-primary-50/20 hover:bg-primary-50/40' : 'hover:bg-navy-50/50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-white border border-navy-100 shadow-xs flex-shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm ${!n.isRead ? 'font-bold text-navy-900' : 'font-semibold text-navy-700'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary-500 inline-block" />
                        )}
                      </div>
                      <span className="text-xs text-navy-400 font-mono">
                        {formatFriendlyDate(n.createdAt)} ({formatRelativeTime(n.createdAt)})
                      </span>
                    </div>
                    <p className="text-sm text-navy-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs text-navy-500 hover:text-navy-800 flex-shrink-0"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

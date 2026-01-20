import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Eye, EyeOff, Clock, AlertTriangle, Package, DollarSign, Info, X, ChevronLeft, ChevronRight, ExternalLink, Trash2, Archive, BarChart3, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../../app/providers';
import { Notification, PaginatedResponse } from '../../types';
import { apiClient } from '../../services/apiClient';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchNotifications(1, searchTerm, filterType, filterRead);
  }, [searchTerm, filterType, filterRead]);

  const fetchNotifications = async (page: number = 1, search: string = '', typeFilter: string = 'all', readFilter: string = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(typeFilter !== 'all' && { notification_type: typeFilter }),
        ...(readFilter !== 'all' && { is_read: readFilter === 'read' ? 'true' : 'false' }),
      });

      const response = await apiClient.get<PaginatedResponse<Notification>>(`/medicines/notifications/?${params}`);
      setNotifications(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to non-paginated response
      try {
        const fallbackResponse = await apiClient.get<Notification[] | { results: Notification[] }>('/medicines/notifications/');
        const data = Array.isArray(fallbackResponse) ? fallbackResponse : fallbackResponse.results || [];
        setNotifications(data);
        setPagination(null);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.post(`/medicines/notifications/${notificationId}/mark_read/`, {});
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/medicines/notifications/mark_all_read/', {});
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Bulk Actions
  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    setBulkActionLoading(true);
    try {
      await apiClient.post('/medicines/notifications/bulk_mark_read/', {
        notification_ids: selectedNotifications,
      });
      setNotifications(prev =>
        prev.map(notif =>
          selectedNotifications.includes(notif.id) ? { ...notif, is_read: true } : notif
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) return;
    setBulkActionLoading(true);
    try {
      await apiClient.post('/medicines/notifications/bulk_delete/', {
        notification_ids: selectedNotifications,
      });
      setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  // Navigation helpers
  const navigateToRelatedItem = (notification: Notification) => {
    if (notification.medicine) {
      navigate(`/inventory?search=${encodeURIComponent(notification.medicine_name || '')}`);
    } else if (notification.sale) {
      navigate(`/sales/${notification.sale}`);
    }
  };

  // Statistics
  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.is_read).length;
    const read = total - unread;
    const critical = notifications.filter(n => n.priority === 'critical').length;
    const high = notifications.filter(n => n.priority === 'high').length;
    const medium = notifications.filter(n => n.priority === 'medium').length;
    const low = notifications.filter(n => n.priority === 'low').length;

    return { total, unread, read, critical, high, medium, low };
  };

  const stats = getNotificationStats();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'new_sale':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    const matchesRead = filterRead === 'all' ||
                       (filterRead === 'read' && notification.is_read) ||
                       (filterRead === 'unread' && !notification.is_read);

    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {pagination ? `${pagination.count} total notifications` : `${stats.total} notifications`} • {stats.unread} unread
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Toggle Statistics"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Notification Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.unread}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.high}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">High Priority</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="new_sale">New Sales</option>
              <option value="system">System</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Read Status Filter */}
          <div className="relative">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkMarkAsRead}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? 'Processing...' : 'Mark as Read'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? 'Processing...' : 'Delete'}
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="px-3 py-1.5 bg-slate-600 text-white rounded text-sm font-medium hover:bg-slate-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Bar */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {selectedNotifications.length === filteredNotifications.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {selectedNotifications.length === filteredNotifications.length
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
            </button>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredNotifications.length} of {pagination?.count || notifications.length} notifications
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No notifications found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filterType !== 'all' || filterRead !== 'all'
                ? 'Try adjusting your filters'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${getPriorityColor(notification.priority)} ${!notification.is_read ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <button
                      onClick={() => handleSelectNotification(notification.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {selectedNotifications.includes(notification.id) ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                          {notification.title}
                        </h3>
                        {/* Related Item Link */}
                        {(notification.medicine || notification.sale) && (
                          <button
                            onClick={() => navigateToRelatedItem(notification)}
                            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                            title={`View ${notification.medicine ? 'medicine' : 'sale'}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>{notification.medicine ? 'View Medicine' : 'View Sale'}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Unread
                          </span>
                        )}
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title={notification.is_read ? "Mark as unread" : "Mark as read"}
                        >
                          {notification.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span className="capitalize px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {notification.notification_type.replace('_', ' ')}
                        </span>
                        <span className="capitalize px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          {notification.priority} priority
                        </span>
                        {notification.medicine_name && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-xs">
                            {notification.medicine_name}
                          </span>
                        )}
                        {notification.sale_invoice && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded text-xs">
                            Invoice: {notification.sale_invoice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.count > 10 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {Math.ceil(pagination.count / 10)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchNotifications(currentPage - 1)}
              disabled={!pagination.previous || loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => fetchNotifications(currentPage + 1)}
              disabled={!pagination.next || loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// src/components/notifications/Notifications.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  X 
} from 'lucide-react';

import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Mock data — will show immediately (no "Failed to load" anymore)
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      const mockData = [
        {
          id: 'n1',
          type: 'borrow_request',
          title: 'New Borrow Request',
          message: 'Karim Hossain requested to borrow your Canon EOS R6 for 3 days.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          isRead: false
        },
        {
          id: 'n2',
          type: 'approval',
          title: 'Borrow Request Approved',
          message: 'You approved Nusrat Jahan to borrow your Rode VideoMic Pro+.',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isRead: true
        },
        {
          id: 'n3',
          type: 'fine',
          title: 'Minor Fine Issued',
          message: 'A small fine of ৳200 has been applied for late return of MacBook Pro.',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          isRead: false
        },
        {
          id: 'n4',
          type: 'system',
          title: 'Welcome to StackShare!',
          message: 'Thanks for joining! Start exploring devices or list your own gear.',
          createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
          isRead: true
        },
        {
          id: 'n5',
          type: 'damage_report',
          title: 'Damage Reported',
          message: 'A borrower reported minor scratch on your DJI Mini 4 Pro drone.',
          createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
          isRead: true
        }
      ];

      setNotifications(mockData);
      setUnreadCount(mockData.filter(n => !n.isRead).length);
      setLoading(false);
    }, 800);
  }, []);

  // Recalculate unread count when filter changes or notifications update
  useEffect(() => {
    if (notifications.length > 0) {
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifications, filter]);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    if (!window.confirm('Mark all notifications as read?')) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type) => {
    const colors = {
      borrow_request: '#00f0ff',    // cyan
      approval: '#00ff9d',          // green
      fine: '#ffaa00',              // orange
      damage_report: '#ff3366',     // red
      system: '#c300ff',            // purple
    };
    return colors[type] || '#b0e0ff';
  };

  const formatTimeAgo = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <Loader2 size={48} className="spin" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">

      {/* Background */}
      <div className="bg-layer"></div>
      <div className="overlay-gradient"></div>

      <div className="container notifications-content">

        {/* Header */}
        <motion.header
          className="notifications-header"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="header-title">
            <Bell size={32} />
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>

          <div className="header-actions">
            <button
              className="filter-btn"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? 'Show Unread Only' : 'Show All'}
            </button>

            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                <CheckCheck size={18} /> Mark All as Read
              </button>
            )}
          </div>
        </motion.header>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No notifications yet</h3>
            <p>You'll see borrow requests, approvals, fines, and updates here</p>
          </div>
        ) : (
          <motion.div 
            className="notifications-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div 
                  className="type-indicator"
                  style={{ backgroundColor: getTypeColor(notif.type) }}
                />

                <div className="notification-content">
                  <div className="notification-message">
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                  </div>

                  <div className="notification-meta">
                    <span className="timestamp">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <span className="type-label">
                      {notif.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="notification-actions">
                  {!notif.isRead && (
                    <button
                      className="action-btn read-btn"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <Check size={18} /> Mark Read
                    </button>
                  )}

                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(notif.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
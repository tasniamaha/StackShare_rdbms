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
  X,
  Package,
  Clock,
  CalendarCheck,
  Smartphone,
  Laptop,
  Camera,
  Radio
} from 'lucide-react';

import './Notifications.css';

// Mock device data (consistent with DeviceList & DeviceDetails)
const mockDevices = [
  { id: "1", name: 'MacBook Pro 16" M2 Pro', category: 'Laptop' },
  { id: "101", name: 'MacBook Pro 16″ M2 Max', category: 'Laptop' },
  { id: "102", name: 'DJI Mini 4 Pro + extra battery', category: 'Drone' },
  { id: "103", name: 'Canon EOS R6 + 24-70mm', category: 'Camera' },
  { id: "104", name: 'iPad Pro 12.9″ M2', category: 'Tablet' },
  { id: "105", name: 'Rode VideoMic Pro+', category: 'Audio' },
];

// Mock availability status (change manually to test notifications)
const mockDeviceAvailability = {
  "1": "available",
  "101": "borrowed",
  "102": "borrowed",
  "103": "borrowed",
  "104": "available",
  "105": "borrowed"
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Load subscribed devices from localStorage (set in DeviceDetails.js)
  const [subscribedDevices, setSubscribedDevices] = useState(() => {
    const saved = localStorage.getItem('notifySubscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Simulate API loading of initial notifications
    setTimeout(() => {
      const initialNotifications = [
        {
          id: 'n1',
          type: 'borrow_request',
          title: 'New Borrow Request',
          message: 'Karim Hossain requested to borrow your Canon EOS R6 for 3 days.',
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
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
        }
      ];

      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.isRead).length);
      setLoading(false);
    }, 800);
  }, []);

  // Simulate device availability check & generate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        let updated = [...prev];

        subscribedDevices.forEach(deviceId => {
          const status = mockDeviceAvailability[deviceId];
          if (status === 'available') {
            // Check if we already sent this notification
            const alreadyNotified = updated.some(n => 
              n.type === 'device_available' && n.deviceId === deviceId
            );

            if (!alreadyNotified) {
              const device = mockDevices.find(d => d.id === deviceId);
              if (device) {
                updated = [{
                  id: `avail-${Date.now()}`,
                  type: 'device_available',
                  title: 'Device Now Available!',
                  message: `The device you subscribed to is now available: ${device.name}`,
                  deviceId,
                  createdAt: new Date().toISOString(),
                  isRead: false
                }, ...updated];
              }
            }
          }
        });

        return updated;
      });
    }, 15000); // Check every 15 seconds (for demo)

    return () => clearInterval(interval);
  }, [subscribedDevices]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    if (!window.confirm('Mark all as read?')) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'borrow_request': return <Package size={20} />;
      case 'approval': return <CheckCheck size={20} />;
      case 'fine': return <AlertCircle size={20} />;
      case 'system': return <Bell size={20} />;
      case 'device_available': return <CalendarCheck size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      borrow_request: '#00f0ff',
      approval: '#00ff9d',
      fine: '#ffaa00',
      system: '#c300ff',
      device_available: '#00ff9d'
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

            {notifications.length > 0 && (
              <>
                <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                  <CheckCheck size={18} /> Mark All Read
                </button>
                <button 
                  className="clear-all-btn" 
                  onClick={() => {
                    if (window.confirm('Clear all notifications? This cannot be undone.')) {
                      setNotifications([]);
                    }
                  }}
                >
                  <Trash2 size={18} /> Clear All
                </button>
              </>
            )}
          </div>
        </motion.header>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No notifications yet</h3>
            <p>
              You'll see updates here: borrow requests, approvals, fines, and availability alerts when subscribed devices become free.
            </p>
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
                >
                  {getTypeIcon(notif.type)}
                </div>

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
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}

                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(notif.id)}
                    title="Delete"
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
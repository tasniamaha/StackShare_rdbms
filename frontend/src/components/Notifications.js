import React, { useState } from 'react';
import './Notifications.css';

const Notifications = ({ notifications: initialNotifications = [] }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="notifications-container">
        <div className="notifications-empty">
          <div className="notifications-empty-icon">🔔</div>
          <h3 className="notifications-empty-title">No Notifications</h3>
          <p className="notifications-empty-text">
            You're all caught up! We'll notify you when something new happens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2 className="notifications-header">Notifications</h2>
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item notification-${notification.type} ${
              !notification.read ? 'notification-unread' : ''
            }`}
            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
          >
            <div className="notification-icon">
              {getTypeIcon(notification.type)}
            </div>
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              <span className="notification-date">{formatDate(notification.date)}</span>
            </div>
            {!notification.read && (
              <div className="notification-unread-badge" title="Mark as read"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;

import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      await apiClient.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notification");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p className="error">{error}</p>;
  if (notifications.length === 0) return <p>No notifications</p>;

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <button onClick={markAllAsRead}>Mark All as Read</button>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.notification_id} style={{ fontWeight: notif.read ? "normal" : "bold" }}>
            {notif.message} 
            <span style={{ marginLeft: "10px", fontSize: "0.9em", color: "#666" }}>
              ({new Date(notif.created_at).toLocaleString()})
            </span>
            {!notif.read && <button onClick={() => markAsRead(notif.notification_id)}>Mark as Read</button>}
            <button onClick={() => deleteNotification(notif.notification_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;

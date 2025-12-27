import "./NotificationsPage.css";

function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      text: "New emergency post: Phone lost near library",
      time: "2 minutes ago",
    },
    {
      id: 2,
      text: "Your emergency post received a response",
      time: "1 hour ago",
    },
    {
      id: 3,
      text: "New announcement from StackShare",
      time: "Yesterday",
    },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-card">
        <h2>Notifications</h2>

        {notifications.map((item) => (
          <div className="notification-item" key={item.id}>
            <div className="icon">🔔</div>
            <div className="content">
              <p className="text">{item.text}</p>
              <span className="time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;


import "./NotificationsPage.css";

export default function NotificationsPage() {
  const notifications = [
    {
      title: "New emergency post: Phone lost near library",
      time: "2 minutes ago",
    },
    {
      title: "Your emergency post received a response",
      time: "1 hour ago",
    },
    {
      title: "New announcement from StackShare",
      time: "Yesterday",
    },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-card">
        <h2>Notifications</h2>

        <div className="notification-list">
          {notifications.map((item, index) => (
            <div key={index} className="notification-item">
              <span className="bell">🔔</span>
              <div>
                <p className="title">{item.title}</p>
                <p className="time">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


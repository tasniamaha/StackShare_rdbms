// src/components/dashboards/BorrowerDashboard.js
import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import BorrowRequest from "../borrow/BorrowRequest";

const BorrowerDashboard = () => {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingReturns, setUpcomingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [activeRes, historyRes, recRes, returnsRes] = await Promise.all([
        apiClient.get("/borrower/active-borrows"),
        apiClient.get("/borrower/history"),
        apiClient.get("/borrower/recommendations"),
        apiClient.get("/borrower/upcoming-returns"),
      ]);

      setActiveBorrows(activeRes.data);
      setHistory(historyRes.data);
      setRecommendations(recRes.data);
      setUpcomingReturns(returnsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="borrower-dashboard">
      <h2>Borrower Dashboard</h2>

      {/* Active Borrows */}
      <section>
        <h3>Active Borrows</h3>
        {activeBorrows.length === 0 ? (
          <p>No active borrows</p>
        ) : (
          <ul>
            {activeBorrows.map((borrow) => (
              <li key={borrow.borrow_id}>
                {borrow.device_name} — Due: {borrow.due_date}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Borrow History */}
      <section>
        <h3>Borrow History</h3>
        {history.length === 0 ? (
          <p>No borrow history</p>
        ) : (
          <ul>
            {history.map((borrow) => (
              <li key={borrow.borrow_id}>
                {borrow.device_name} — Borrowed: {borrow.start_date} — Returned:{" "}
                {borrow.end_date || "Pending"}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming Returns */}
      <section>
        <h3>Upcoming Returns</h3>
        {upcomingReturns.length === 0 ? (
          <p>No upcoming returns</p>
        ) : (
          <ul>
            {upcomingReturns.map((borrow) => (
              <li key={borrow.borrow_id}>
                {borrow.device_name} — Return by: {borrow.due_date}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <h3>Recommended Devices</h3>
        {recommendations.length === 0 ? (
          <p>No recommendations</p>
        ) : (
          <ul>
            {recommendations.map((device) => (
              <li key={device.device_id}>{device.device_name}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Borrow Request */}
      <section>
        <h3>Request a Device</h3>
        {/* Replace deviceId dynamically with selected device */}
        <BorrowRequest deviceId={1} />
      </section>
    </div>
  );
};

export default BorrowerDashboard;

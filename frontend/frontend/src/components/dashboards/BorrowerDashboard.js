// src/components/dashboards/BorrowerDashboard.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import BorrowRequest from '../borrow/BorrowRequest';

import './BorrowerDashboard.css';

const BorrowerDashboard = () => {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingReturns, setUpcomingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [activeRes, historyRes, recRes, returnsRes] = await Promise.all([
        apiClient.get('/borrower/active-borrows'),
        apiClient.get('/borrower/history'),
        apiClient.get('/borrower/recommendations'),
        apiClient.get('/borrower/upcoming-returns'),
      ]);

      setActiveBorrows(activeRes.data || []);
      setHistory(historyRes.data || []);
      setRecommendations(recRes.data || []);
      setUpcomingReturns(returnsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-alert">{error}</div>;
  }

  return (
    <div className="borrower-dashboard">
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Borrower Dashboard</h1>
        <p>Manage your borrows, history and discover new devices</p>
      </motion.header>

      <div className="dashboard-grid">
        {/* Active Borrows */}
        <motion.section
          className="dashboard-card active-borrows"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Active Borrows</h3>
          {activeBorrows.length === 0 ? (
            <p className="empty-state">You don't have any active borrows right now</p>
          ) : (
            <ul className="item-list">
              {activeBorrows.map((borrow) => (
                <li key={borrow.borrow_id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{borrow.device_name}</span>
                    <span className="item-due">
                      Due: {new Date(borrow.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="status-badge active">Active</span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Upcoming Returns */}
        <motion.section
          className="dashboard-card upcoming-returns"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Upcoming Returns</h3>
          {upcomingReturns.length === 0 ? (
            <p className="empty-state">No upcoming returns</p>
          ) : (
            <ul className="item-list">
              {upcomingReturns.map((borrow) => (
                <li key={borrow.borrow_id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{borrow.device_name}</span>
                    <span className="item-due">
                      Return by: {new Date(borrow.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Borrow History */}
        <motion.section
          className="dashboard-card history"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Borrow History</h3>
          {history.length === 0 ? (
            <p className="empty-state">No previous borrows yet</p>
          ) : (
            <ul className="item-list">
              {history.map((borrow) => (
                <li key={borrow.borrow_id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{borrow.device_name}</span>
                    <span className="item-dates">
                      {new Date(borrow.start_date).toLocaleDateString()} —{' '}
                      {borrow.end_date
                        ? new Date(borrow.end_date).toLocaleDateString()
                        : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Recommendations */}
        <motion.section
          className="dashboard-card recommendations"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Recommended For You</h3>
          {recommendations.length === 0 ? (
            <p className="empty-state">No recommendations available yet</p>
          ) : (
            <ul className="item-list">
              {recommendations.map((device) => (
                <li key={device.device_id} className="item-row">
                  <span className="item-name">{device.device_name}</span>
                  {device.category && (
                    <span className="category-tag">{device.category}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>

      {/* Quick Borrow Request */}
      <motion.section
        className="quick-request-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Request a New Device</h3>
        {/* In real app you would have device selection first */}
        <BorrowRequest deviceId={null} /> {/* or pass selected device */}
      </motion.section>
    </div>
  );
};

export default BorrowerDashboard;

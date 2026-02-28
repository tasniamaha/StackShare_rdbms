// src/components/dashboards/BorrowerDashboard.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dashboardBg from '../../assets/image/borrower_dashboard.jpg';
import {
  LogOut,
  Calendar,
  Clock,
  History,
  Sparkles,
  PlusCircle,
  Search,
  Eye,
} from 'lucide-react';

import './BorrowerDashboard.css';

export default function BorrowerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBorrows: 0,
    upcomingReturns: 0,
    totalHistory: 0,
    reputation: 74,
  });

  const [activeBorrows, setActiveBorrows] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    // Simulate API loading (replace with real API calls later)
    setTimeout(() => {
      setStats({
        activeBorrows: 3,
        upcomingReturns: 2,
        totalHistory: 14,
        reputation: 74,
      });

      setActiveBorrows([
        {
          id: 101,
          name: 'MacBook Pro 16″ M2 Max',
          due: '2025-03-15',
          image: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?w=400&auto=format&fit=crop',
        },
        {
          id: 102,
          name: 'DJI Mini 4 Pro + extra battery',
          due: '2025-03-08',
          image: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=400&auto=format&fit=crop',
        },
        {
          id: 103,
          name: 'Canon EOS R6 + 24-70mm',
          due: '2025-03-22',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
        },
      ]);

      setUpcoming([
        {
          id: 104,
          name: 'iPad Pro 12.9″ M2',
          due: '2025-02-28',
          image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&auto=format&fit=crop',
        },
        {
          id: 105,
          name: 'Rode VideoMic Pro+',
          due: '2025-03-03',
          image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
        },
      ]);

      setLoading(false);
    }, 900);
  }, []);

  // Logout → clear auth → redirect to Landing Page (/)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('stackshare_token');
    localStorage.removeItem('stackshare_user');

    navigate('/', { replace: true });
  };

  // Navigate to Device Details
  const viewDeviceDetails = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  // When user clicks "Post Request" → redirect to Notifications page
  const handlePostRequest = () => {
    // You can later add real logic here (e.g. send request to backend first)
    // For now: immediately redirect to notifications (as requested)
    navigate('/notifications');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-ring"></div>
        <p>Initializing dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className="borrower-dashboard"
      style={{
        backgroundImage: `url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background layers */}
      <div className="bg-image-layer"></div>
      <div className="bg-overlay-gradient"></div>
      <div className="bg-grid-lines"></div>

      <div className="dashboard-content-wrapper">

        {/* Top bar / header */}
        <motion.div
          className="top-control-bar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div className="header-title-area">
            <h1>Borrower Dashboard</h1>
            <p className="header-subtitle">Manage • Track • Request</p>
          </div>

          <button className="logout-pill" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </motion.div>

        {/* Reputation & quick stats row */}
        <div className="top-stats-row">
          <motion.div
            className="reputation-pill"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rep-label">Reputation</div>
            <div className="rep-value">{stats.reputation}</div>
            <div className="rep-bar">
              <div
                className="rep-progress"
                style={{ width: `${stats.reputation}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            className="mini-stat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Calendar size={22} />
            <span>{stats.activeBorrows} active</span>
          </motion.div>

          <motion.div
            className="mini-stat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Clock size={22} />
            <span>{stats.upcomingReturns} due soon</span>
          </motion.div>
        </div>

        {/* Request new device – prominent area */}
        <motion.section
          className="request-borrow-section"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="request-header">
            <PlusCircle size={28} />
            <h2>Request a New Device</h2>
          </div>

          <p className="request-hint">
            Tell the community what you're looking for — someone might have it!
          </p>

          <div className="request-form-layout">
            <div className="input-with-icon">
              <Search size={20} />
              <input
                type="text"
                placeholder="What do you need right now?"
                className="main-request-input"
              />
            </div>

            {/* Post Request button → redirects to Notifications */}
            <button 
              className="post-request-btn"
              onClick={handlePostRequest}
            >
              Post Request
            </button>
          </div>

          <div className="or-divider">
            <span>or</span>
          </div>

          <button
            className="browse-catalog-btn"
            onClick={() => navigate('/browse')}
          >
            Browse Available Items →
          </button>
        </motion.section>

        {/* Currently Borrowed */}
        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="panel-heading">
            <h3>Currently Borrowed</h3>
            <span className="count-badge">{stats.activeBorrows}</span>
          </div>

          <div className="items-compact-list">
            {activeBorrows.map((item) => (
              <div key={item.id} className="compact-borrow-item">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.name} className="item-image" />
                </div>
                <div className="item-info">
                  <div className="item-name-line">{item.name}</div>
                  <div className="due-info">Due {item.due}</div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/devices/${item.id}`)}
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            ))}
          </div>

          <button
            className="see-all-link"
            onClick={() => navigate('/my-borrows')}
          >
            View all active borrows →
          </button>
        </motion.section>

        {/* Due Soon (Upcoming Returns) */}
        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="panel-heading">
            <h3>Due Soon</h3>
            <span className="count-badge">{stats.upcomingReturns}</span>
          </div>

          <div className="items-compact-list">
            {upcoming.map((item) => (
              <div key={item.id} className="compact-borrow-item">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.name} className="item-image" />
                </div>
                <div className="item-info">
                  <div className="item-name-line">{item.name}</div>
                  <div className="due-info warning">Due {item.due}</div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/devices/${item.id}`)}
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quick navigation pills */}
        <div className="quick-pill-row">
          <motion.button
            className="pill-button"
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate('/history')}
          >
            <History size={18} />
            Borrow History
          </motion.button>

          <motion.button
            className="pill-button"
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate('/recommendations')}
          >
            <Sparkles size={18} />
            Recommendations
          </motion.button>
        </div>
      </div>
    </div>
  );
}
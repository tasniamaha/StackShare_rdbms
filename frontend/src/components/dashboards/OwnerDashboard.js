// src/components/dashboards/OwnerDashboard.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Package,
  Clock,
  AlertCircle,
  PlusCircle,
  Users,
  History,
  Upload,
} from 'lucide-react';

import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ownedDevices: 0,
    activeLends: 0,
    pendingRequests: 0,
    reputation: 82,
  });

  const [ownedDevices, setOwnedDevices] = useState([]);
  const [activeLends, setActiveLends] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    // Simulate API loading (replace with real API calls later)
    setTimeout(() => {
      setStats({
        ownedDevices: 5,
        activeLends: 2,
        pendingRequests: 3,
        reputation: 82,
      });

      setOwnedDevices([
        {
          id: 1,
          name: 'MacBook Pro 16" M2 Max',
          status: 'Available',
          category: 'Laptop',
          image: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?w=400&auto=format&fit=crop',
        },
        {
          id: 2,
          name: 'DJI Mini 4 Pro Drone',
          status: 'Borrowed',
          category: 'Drone',
          image: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=400&auto=format&fit=crop',
        },
        {
          id: 3,
          name: 'Canon EOS R6 + Lens',
          status: 'Available',
          category: 'Camera',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
        },
        {
          id: 4,
          name: 'Godox AD600Pro Flash',
          status: 'Available',
          category: 'Lighting',
          image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
        },
        {
          id: 5,
          name: 'Rode VideoMic Pro+',
          status: 'Borrowed',
          category: 'Audio',
          image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
        },
      ]);

      setActiveLends([
        { id: 101, borrower: 'Rahim Ahmed', item: 'DJI Mini 4 Pro', due: '2025-03-08' },
        { id: 102, borrower: 'Nusrat Jahan', item: 'Rode VideoMic Pro+', due: '2025-03-05' },
      ]);

      setPendingApprovals([
        { id: 201, requester: 'Karim Hossain', item: 'MacBook Pro 16"', requested: '2025-02-20' },
        { id: 202, requester: 'Sadia Khan', item: 'Canon EOS R6', requested: '2025-02-21' },
        { id: 203, requester: 'Prithvi Das', item: 'Godox AD600Pro', requested: '2025-02-19' },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // Logout → clears auth data → redirects to Landing Page (/)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('stackshare_token');
    localStorage.removeItem('stackshare_user');

    navigate('/', { replace: true });
  };

  // Demo handlers for approve/reject (replace with real API calls later)
  const handleApprove = (id) => {
    alert(`Approved request #${id} — device lent!`);
    setPendingApprovals((prev) => prev.filter((req) => req.id !== id));
    setStats((prev) => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
  };

  const handleReject = (id) => {
    alert(`Rejected request #${id}`);
    setPendingApprovals((prev) => prev.filter((req) => req.id !== id));
    setStats((prev) => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-ring"></div>
        <p>Initializing owner dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">

      {/* Background layers */}
      <div className="bg-image-layer"></div>
      <div className="bg-overlay-gradient"></div>
      <div className="bg-grid-lines"></div>

      <div className="dashboard-content-wrapper">

        {/* Header */}
        <motion.div
          className="top-control-bar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div className="header-title-area">
            <h1>Owner Dashboard</h1>
            <p className="header-subtitle">Manage your gear • Approve lends • Track reputation</p>
          </div>

          <button className="logout-pill" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </motion.div>

        {/* Reputation & quick stats */}
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
              <div className="rep-progress" style={{ width: `${stats.reputation}%` }} />
            </div>
          </motion.div>

          <motion.div
            className="mini-stat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Package size={22} />
            <span>{stats.ownedDevices} devices</span>
          </motion.div>

          <motion.div
            className="mini-stat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Users size={22} />
            <span>{stats.activeLends} active lends</span>
          </motion.div>

          <motion.div
            className="mini-stat warning"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AlertCircle size={22} />
            <span>{stats.pendingRequests} pending</span>
          </motion.div>
        </div>

        {/* Quick actions – now with prominent Add Device button */}
        <div className="quick-actions-bar">
          <motion.button
            className="action-pill primary add-device-btn"
            whileHover={{ scale: 1.06, boxShadow: '0 0 25px rgba(0,240,255,0.4)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/owner/add-device')}
          >
            <Upload size={20} />
            Add New Device
          </motion.button>

          <motion.button
            className="action-pill"
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate('/my-devices')}
          >
            <Package size={20} />
            View My Devices
          </motion.button>

          <motion.button
            className="action-pill"
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate('/lend-history')}
          >
            <History size={20} />
            Lend History
          </motion.button>
        </div>

        {/* Owned Devices */}
        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="panel-heading">
            <h3>My Devices</h3>
            <span className="count-badge">{stats.ownedDevices}</span>
          </div>

          <div className="device-grid">
            {ownedDevices.map((device) => (
              <motion.div
                key={device.id}
                className="device-card"
                whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,240,255,0.2)' }}
                onClick={() => navigate(`/devices/${device.id}`)}
              >
                <div className="device-image-wrapper">
                  <img src={device.image} alt={device.name} className="device-image" />
                </div>
                <div className={`status-indicator ${device.status.toLowerCase()}`}>
                  {device.status}
                </div>
                <div className="device-name">{device.name}</div>
                <div className="device-category">{device.category}</div>
              </motion.div>
            ))}
          </div>

          <button className="see-all-link" onClick={() => navigate('/my-devices')}>
            Manage all devices →
          </button>
        </motion.section>

        {/* Active Lends */}
        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="panel-heading">
            <h3>Active Lends</h3>
            <span className="count-badge">{stats.activeLends}</span>
          </div>

          <div className="items-compact-list">
            {activeLends.map((lend) => (
              <div key={lend.id} className="compact-lend-item">
                <div className="lend-info">
                  <div className="borrower-name">{lend.borrower}</div>
                  <div className="item-name">{lend.item}</div>
                </div>
                <div className="due-date">Due {lend.due}</div>
              </div>
            ))}
          </div>

          <button className="see-all-link" onClick={() => navigate('/active-lends')}>
            View all active lends →
          </button>
        </motion.section>

        {/* Pending Approval Requests */}
        <motion.section
          className="dashboard-panel urgent"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="panel-heading">
            <h3>Pending Approval Requests</h3>
            <span className="count-badge urgent">{stats.pendingRequests}</span>
          </div>

          <div className="items-compact-list">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="compact-request-item">
                <div className="request-info">
                  <div className="requester-name">{req.requester}</div>
                  <div className="item-requested">
                    wants to borrow: <strong>{req.item}</strong>
                  </div>
                </div>
                <div className="request-date">Requested: {req.requested}</div>
                <div className="action-buttons-small">
                  <button className="approve-btn" onClick={() => handleApprove(req.id)}>
                    Approve
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(req.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

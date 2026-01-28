// src/components/dashboards/OwnerDashboard.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [activeLends, setActiveLends] = useState([]);
  const [lendHistory, setLendHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newDeviceName, setNewDeviceName] = useState('');

  const fetchOwnerData = async () => {
    setLoading(true);
    setError('');

    try {
      const [devicesRes, activeLendsRes, historyRes] = await Promise.all([
        apiClient.get('/owner/devices'),
        apiClient.get('/owner/active-lends'),
        apiClient.get('/owner/lend-history'),
      ]);

      setDevices(devicesRes.data || []);
      setActiveLends(activeLendsRes.data || []);
      setLendHistory(historyRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      await apiClient.post('/owner/devices', { device_name: newDeviceName.trim() });
      setNewDeviceName('');
      setError('');
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add device');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;

    try {
      await apiClient.delete(`/owner/devices/${deviceId}`);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleLogout = () => {
    // If you have a clearAuth function in authStorage, call it here:
    // clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div>
            <h1>Owner Dashboard</h1>
            <p>Manage your devices and track all active & past lends</p>
          </div>
          <motion.button
            className="btn-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Logout
          </motion.button>
        </div>

        {error && (
          <div className="error-alert" style={{ marginTop: '1.5rem' }}>
            {error}
          </div>
        )}
      </motion.header>

      <div className="dashboard-grid">
        {/* Device Management */}
        <motion.section
          className="dashboard-card devices-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>My Devices</h3>

          <div className="add-device-form">
            <input
              type="text"
              placeholder="New device name (e.g. MacBook Pro M2)"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDevice()}
            />
            <button
              className="btn-add"
              onClick={handleAddDevice}
              disabled={!newDeviceName.trim()}
            >
              Add Device
            </button>
          </div>

          {devices.length === 0 ? (
            <p className="empty-state">You haven't added any devices yet</p>
          ) : (
            <ul className="device-list">
              {devices.map((device) => (
                <li key={device.device_id} className="device-item">
                  <div className="device-info">
                    <span className="device-name">{device.device_name}</span>
                    <span
                      className={`status-badge ${device.device_status?.toLowerCase() || 'available'}`}
                    >
                      {device.device_status || 'Available'}
                    </span>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteDevice(device.device_id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Active Lends */}
        <motion.section
          className="dashboard-card active-lends"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Active Lends</h3>
          {activeLends.length === 0 ? (
            <p className="empty-state">No devices are currently borrowed</p>
          ) : (
            <ul className="lend-list">
              {activeLends.map((lend) => (
                <li key={lend.borrow_id} className="lend-item">
                  <div className="lend-info">
                    <span className="device-name">{lend.device_name}</span>
                    <span className="borrower-name">by {lend.student_name}</span>
                    <span className="due-date">
                      Due: {new Date(lend.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="status-badge borrowed">Borrowed</span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Lend History */}
        <motion.section
          className="dashboard-card lend-history"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Lend History</h3>
          {lendHistory.length === 0 ? (
            <p className="empty-state">No previous lends yet</p>
          ) : (
            <ul className="lend-list">
              {lendHistory.map((lend) => (
                <li key={lend.borrow_id} className="lend-item">
                  <div className="lend-info">
                    <span className="device-name">{lend.device_name}</span>
                    <span className="borrower-name">by {lend.student_name}</span>
                    <span className="return-date">
                      Returned:{' '}
                      {lend.return_date
                        ? new Date(lend.return_date).toLocaleDateString()
                        : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default OwnerDashboard;

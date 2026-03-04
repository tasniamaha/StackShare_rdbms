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
  ShieldAlert,
  AlertTriangle,
  X,
  DollarSign,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, reputation, hasLowReputation, isRestricted, hasViolations } = useAuth();

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

  // Mock fines & violations (owner/lender view)
const [finesAndViolations, setFinesAndViolations] = useState([
    {
      id: 'fv2',
      borrower: 'Nusrat Jahan',
      device: 'DJI Mini 4 Pro Drone',
      deviceImage: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=400&auto=format&fit=crop',
      fineAmount: 950,
      reason: 'Severe damage – drone propeller broken',
      date: '2025-03-02',
      status: 'Disputed',
      details: 'Borrower filed complaint. Awaiting admin review of before/after photos.',
      isExpanded: false
    },
    {
      id: 'fv3',
      borrower: 'Sadia Khan',
      device: 'Canon EOS R6 + Lens',
      deviceImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
      fineAmount: 170,
      reason: '2-day late return',
      date: '2025-03-10',
      status: 'Paid',
      details: '10% fine applied. Reputation -7 to borrower. Fine paid via deposit deduction.',
      isExpanded: false
    },
    {
      id: 'fv4',
      borrower: 'Prithvi Das',
      device: 'Rode VideoMic Pro+',
      deviceImage: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
      fineAmount: 0,
      reason: 'Minor cosmetic wear – no charge',
      date: '2025-03-05',
      status: 'Resolved',
      details: 'Borrower cleaned item. No fine applied. Reputation -5 (minor deduction).',
      isExpanded: false
    },
    {
      id: 'fv5',
      borrower: 'Ayesha Siddiqua',
      device: 'Godox AD600Pro Flash',
      deviceImage: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
      fineAmount: 600,
      reason: '4-day late return + repeated violation',
      date: '2025-03-12',
      status: 'Pending',
      details: '20% fine + extra penalty for second late return in 60 days. Reputation -15.',
      isExpanded: false
    }
  ]);

  const [showFinesModal, setShowFinesModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintPhotos, setComplaintPhotos] = useState([]); // Array of File objects
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      complaintPhotos.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [complaintPhotos]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        ownedDevices: 5,
        activeLends: 2,
        pendingRequests: 3,
        reputation: user?.reputation || 82,
      });

      setOwnedDevices([
        { id: 3, name: 'Canon EOS R6 + Lens', status: 'Available', category: 'Camera', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop' },
        { id: 4, name: 'Godox AD600Pro Flash', status: 'Available', category: 'Lighting', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs1-SqVw8UPmI8FCm5euh4_Yt9fw9KJCsN_w&s' },
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
  }, [user?.reputation]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('stackshare_token');
    localStorage.removeItem('stackshare_user');
    navigate('/', { replace: true });
  };

  const handleApprove = (id) => {
    alert(`Approved request #${id} — device lent!`);
    setPendingApprovals(prev => prev.filter(req => req.id !== id));
    setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
  };

  const handleReject = (id) => {
    alert(`Rejected request #${id}`);
    setPendingApprovals(prev => prev.filter(req => req.id !== id));
    setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
  };

  const toggleFineExpand = (id) => {
    setFinesAndViolations(prev =>
      prev.map(fine =>
        fine.id === id ? { ...fine, isExpanded: !fine.isExpanded } : fine
      )
    );
  };

  const openFinesModal = () => setShowFinesModal(true);
  const closeFinesModal = () => setShowFinesModal(false);

  const openComplaintModal = () => setShowComplaintModal(true);
  const closeComplaintModal = () => {
    setShowComplaintModal(false);
    setComplaintReason('');
    setComplaintDetails('');
    // Cleanup previews
    complaintPhotos.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setComplaintPhotos([]);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + complaintPhotos.length > 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }
const newPhotos = files.map(file => ({
  file,
  preview: URL.createObjectURL(file)
}));

    setComplaintPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setComplaintPhotos(prev => {
      const photo = prev[index];
      if (photo.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitComplaint = async (e) => {
    e.preventDefault();

    if (!complaintReason.trim()) {
      alert("Please select a reason for your complaint.");
      return;
    }

    setIsSubmittingComplaint(true);

    try {
      // Prepare data (in real app: use FormData to send files to backend)
      const complaintData = {
        reason: complaintReason,
        details: complaintDetails,
        ownerId: user?.id || 'unknown',
        photos: complaintPhotos.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        timestamp: new Date().toISOString()
      };

      console.log("Complaint submitted:", complaintData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      alert("Your complaint has been sent to the admin team. We'll review it soon.");
      closeComplaintModal();
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const totalPendingFines = finesAndViolations
    .filter(f => f.status === 'Pending')
    .reduce((sum, f) => sum + f.fineAmount, 0);

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

        {/* Reputation & stats */}
        <div className="top-stats-row">
          <motion.div
            className={`reputation-pill ${hasLowReputation ? 'low-rep' : ''} ${isRestricted ? 'restricted' : ''}`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rep-label">Reputation</div>
            <div className="rep-value">{reputation || stats.reputation}</div>
            <div className="rep-bar">
              <div className="rep-progress" style={{ width: `${reputation || stats.reputation}%` }} />
            </div>
            {hasLowReputation && <div className="rep-warning">Low reputation</div>}
            {isRestricted && <div className="rep-restricted">Account restricted</div>}
          </motion.div>

          <motion.div className="mini-stat" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Package size={22} />
            <span>{stats.ownedDevices} devices</span>
          </motion.div>

          <motion.div className="mini-stat" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Users size={22} />
            <span>{stats.activeLends} active lends</span>
          </motion.div>

          <motion.div className="mini-stat warning" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <AlertCircle size={22} />
            <span>{stats.pendingRequests} pending</span>
          </motion.div>

          {hasViolations && (
            <motion.div className="mini-stat violation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <ShieldAlert size={22} />
              <span>Violations active</span>
            </motion.div>
          )}
        </div>

        {/* Quick actions */}
        <div className="quick-actions-bar">
          <motion.button
            className="action-pill primary add-device-btn"
            whileHover={{ scale: 1.06 }}
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

          <motion.button
            className="action-pill warning"
            whileHover={{ scale: 1.04 }}
            onClick={openFinesModal}
          >
            <AlertTriangle size={20} />
            Fines & Violations
          </motion.button>

          <motion.button
            className="action-pill complain-btn"
            whileHover={{ scale: 1.04 }}
            onClick={openComplaintModal}
          >
            <MessageSquare size={20} />
            Complain to Admin
          </motion.button>
        </div>

        {/* Owned Devices */}
        <motion.section className="dashboard-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="panel-heading">
            <h3>My Devices</h3>
            <span className="count-badge">{stats.ownedDevices}</span>
          </div>

          <div className="device-grid">
            {ownedDevices.map(device => (
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
        <motion.section className="dashboard-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="panel-heading">
            <h3>Active Lends</h3>
            <span className="count-badge">{stats.activeLends}</span>
          </div>

          <div className="items-compact-list">
            {activeLends.map(lend => (
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
        <motion.section className="dashboard-panel urgent" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <div className="panel-heading">
            <h3>Pending Approval Requests</h3>
            <span className="count-badge urgent">{stats.pendingRequests}</span>
          </div>

          <div className="items-compact-list">
            {pendingApprovals.map(req => (
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

      {/* Fines & Violations Modal */}
      {showFinesModal && (
        <div className="modal-overlay" onClick={closeFinesModal}>
          <motion.div
            className="fines-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Fines & Violations Overview</h2>
              <button className="close-modal-btn" onClick={closeFinesModal}>
                <X size={28} />
              </button>
            </div>

            <div className="modal-body">
              <div className="fines-summary">
                <div className="summary-card">
                  <DollarSign size={32} />
                  <div>
                    <h4>Total Pending Fines</h4>
                    <p className="total-fine-amount">
                      ৳{totalPendingFines.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="summary-card">
                  <AlertTriangle size={32} />
                  <div>
                    <h4>Active Violations</h4>
                    <p>{finesAndViolations.filter(f => f.status !== 'Paid' && f.status !== 'Resolved').length}</p>
                  </div>
                </div>
              </div>

              <div className="fines-list">
                {finesAndViolations.map(fine => (
                  <div key={fine.id} className={`fine-card ${fine.status.toLowerCase()}`}>
                    <div className="fine-image-wrapper">
                      <img src={fine.deviceImage} alt={fine.device} className="fine-image" />
                    </div>

                    <div className="fine-content">
                      <div className="fine-header">
                        <h4>{fine.device}</h4>
                        <span className={`status-badge ${fine.status.toLowerCase()}`}>
                          {fine.status}
                        </span>
                      </div>

                      <div className="fine-amount">
                        <DollarSign size={20} />
                        {fine.fineAmount.toLocaleString()} BDT
                      </div>

                      <div className="fine-borrower">
                        Borrower: <strong>{fine.borrower}</strong>
                      </div>

                      <div className="fine-reason">
                        <strong>Reason:</strong> {fine.reason}
                      </div>

                      <div className="fine-date">
                        Date: {fine.date}
                      </div>

                      <div className="fine-toggle" onClick={() => toggleFineExpand(fine.id)}>
                        {fine.isExpanded ? (
                          <>
                            <ChevronUp size={18} /> Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown size={18} /> View Details
                          </>
                        )}
                      </div>

                      {fine.isExpanded && (
                        <div className="fine-details-expanded">
                          {fine.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Complain to Admin Modal – with photo upload */}
      {showComplaintModal && (
        <div className="modal-overlay" onClick={closeComplaintModal}>
          <motion.div
            className="complaint-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>File a Complaint</h2>
              <button className="close-modal-btn" onClick={closeComplaintModal}>
                <X size={28} />
              </button>
            </div>

            <form onSubmit={submitComplaint} className="complaint-form">
              <div className="form-group">
                <label>Reason for Complaint *</label>
                <select
                  value={complaintReason}
                  onChange={e => setComplaintReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="damage-dispute">Damage dispute (borrower damaged item)</option>
                  <option value="late-return">Repeated late returns</option>
                  <option value="non-return">Non-return or lost item</option>
                  <option value="misuse">Misuse or abuse of device</option>
                  <option value="harassment">Harassment or inappropriate behavior</option>
                  <option value="other">Other (please specify below)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Details (optional)</label>
                <textarea
                  rows="4"
                  value={complaintDetails}
                  onChange={e => setComplaintDetails(e.target.value)}
                  placeholder="Describe the issue in detail (dates, device names, borrower names, what happened...)"
                />
              </div>

              {/* Photo Upload – Optional */}
              <div className="form-group">
                <label>
                  <ImageIcon size={18} /> Upload Photos (optional – max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="photo-input"
                />
                <p className="photo-hint">You can upload up to 5 images (jpg, png, max 5MB each)</p>

                {/* Photo Previews */}
                {complaintPhotos.length > 0 && (
                  <div className="photo-preview-container">
                    {complaintPhotos.map((file, index) => (
                      <div key={index} className="photo-preview-item">
                        <img
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                className="submit-complaint-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmittingComplaint}
              >
                {isSubmittingComplaint ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send size={18} /> Submit Complaint
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

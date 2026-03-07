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
  AlertTriangle,
  ShieldAlert,
  X,
  DollarSign,
  MessageSquare,
  Upload,
  MapPin,
  Send,
  Trash2
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import './BorrowerDashboard.css';

export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const { user, reputation, hasLowReputation, isRestricted, hasViolations } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBorrows: 0,
    upcomingReturns: 0,
    totalHistory: 0,
    reputation: 74,
  });

  const [activeBorrows, setActiveBorrows] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [showFinesModal, setShowFinesModal] = useState(false);

  // State for early return modal
  const [showEarlyReturnModal, setShowEarlyReturnModal] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]);

  // Mock fines & violations data (borrower perspective)
  const [finesAndViolations] = useState([
    {
      id: 'f1',
      device: 'MacBook Pro 16″ M2 Max',
      deviceImage: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?w=400&auto=format&fit=crop',
      fineAmount: 1200,
      reason: 'Non-return (14+ days overdue)',
      date: '2025-02-10',
      status: 'Pending',
      details: 'Full item value charged. Reputation -80. Account suspended until payment.'
    },
    {
      id: 'f2',
      device: 'DJI Mini 4 Pro + extra battery',
      deviceImage: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=400&auto=format&fit=crop',
      fineAmount: 380,
      reason: 'Moderate damage reported (cracked screen)',
      date: '2025-02-28',
      status: 'Disputed',
      details: '40% compensation applied. Reputation -20. Complaint filed against lender claim.'
    },
    {
      id: 'f3',
      device: 'Canon EOS R6 + 24-70mm',
      deviceImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
      fineAmount: 85,
      reason: '1-day late return',
      date: '2025-03-16',
      status: 'Paid',
      details: '5% fine applied. Reputation -3. Paid from deposit.'
    },
    {
      id: 'f4',
      device: 'Rode VideoMic Pro+',
      deviceImage: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400&auto=format&fit=crop',
      fineAmount: 0,
      reason: 'Minor cosmetic wear – no charge',
      date: '2025-03-04',
      status: 'Resolved',
      details: 'Borrower cleaned item. No fine applied. Reputation -5 (minor deduction).'
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        activeBorrows: 3,
        upcomingReturns: 2,
        totalHistory: 14,
        reputation: user?.reputation || 74,
      });

      setActiveBorrows([
        {
          id: 101,
          name: 'MacBook Pro 16″ M2 Max',
          due: '2025-03-15',
          image: 'https://diamu.com.bd/wp-content/uploads/2023/07/Apple-MacBook-Pro-M2-Pro-2023-14-inch-10-Core-CPU-16-Core-GPU.jpg',
          ownerWhatsApp: '+8801712345678', // ← added
          ownerName: 'Rahim Ahmed'
        },
        {
          id: 102,
          name: 'DJI Mini 4 Pro + extra battery',
          due: '2025-03-08',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqI3RLIjnpXsEpgkq7NHQ2UnDmTdt1HnraJQ&s',
          ownerWhatsApp: '+8801723456789',
          ownerName: 'Karim Hossain'
        },
        {
          id: 103,
          name: 'Canon EOS R6 + 24-70mm',
          due: '2025-03-22',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
          ownerWhatsApp: '+8801734567890',
          ownerName: 'Sadia Khan'
        },
      ]);

      setUpcoming([
        {
          id: 104,
          name: 'iPad Pro 12.9″ M2',
          due: '2025-02-28',
          image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&auto=format&fit=crop',
          ownerWhatsApp: '+8801745678901',
          ownerName: 'Nusrat Jahan'
        },
        {
          id: 105,
          name: 'Rode VideoMic Pro+',
          due: '2025-03-03',
          image: 'https://cdn.radio.co/production/rode-videomic-plus-header.png?w=1200&h=630&q=82&auto=format&fit=crop&dm=1696233485&s=aeee2875932270a9b1f07ffeaf70ab64',
          ownerWhatsApp: '+8801756789012',
          ownerName: 'Tahmid Hasan'
        },
      ]);

      setLoading(false);
    }, 900);
  }, [user?.reputation]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('stackshare_token');
    localStorage.removeItem('stackshare_user');
    navigate('/', { replace: true });
  };

  const viewDeviceDetails = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  const handlePostRequest = () => {
    navigate('/notifications');
  };

  const openFinesModal = () => setShowFinesModal(true);
  const closeFinesModal = () => setShowFinesModal(false);

  // Message owner via WhatsApp
  const messageOwner = (whatsapp, name, item) => {
    const message = `Hello ${name}, regarding the borrowed item: ${item}. I wanted to discuss...`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsapp}?text=${encoded}`, '_blank');
  };

  // Open early return modal
  const openEarlyReturnModal = (item) => {
    setSelectedItemForReturn(item);
    setReturnDate('');
    setReturnLocation('');
    setReturnPhotos([]);
    setShowEarlyReturnModal(true);
  };

  const closeEarlyReturnModal = () => {
    setShowEarlyReturnModal(false);
    setSelectedItemForReturn(null);
    setReturnPhotos([]);
  };

  const handleReturnPhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + returnPhotos.length > 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }
    setReturnPhotos(prev => [...prev, ...files]);
  };

  const removeReturnPhoto = (index) => {
    setReturnPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const submitEarlyReturn = (e) => {
    e.preventDefault();
    if (!returnDate || !returnLocation.trim()) {
      alert("Please provide return date and location.");
      return;
    }

    // Simulate sending to owner
    console.log("Early return request:", {
      itemId: selectedItemForReturn.id,
      itemName: selectedItemForReturn.name,
      proposedDate: returnDate,
      location: returnLocation,
      photos: returnPhotos.map(f => f.name)
    });

    alert("Your early return request has been sent to the owner. They will confirm soon.");
    closeEarlyReturnModal();
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
    >
     <div
  className="bg-image-layer"
  style={{
    backgroundImage: `url(${dashboardBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
></div>
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
            <h1>
              Borrower Dashboard {user?.student_name ? `- ${user.student_name}` : ''}
            </h1>
            <p className="header-subtitle">Manage • Track • Request</p>
          </div>

          <button className="logout-pill" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </motion.div>

        {/* Stats */}
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
            {hasLowReputation && <div className="rep-warning">Low reputation – limited borrowing</div>}
            {isRestricted && <div className="rep-restricted">Account restricted – resolve issues</div>}
          </motion.div>

          <motion.div className="mini-stat" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Calendar size={22} />
            <span>{stats.activeBorrows} active</span>
          </motion.div>

          <motion.div className="mini-stat" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Clock size={22} />
            <span>{stats.upcomingReturns} due soon</span>
          </motion.div>

          {hasViolations && (
            <motion.div className="mini-stat violation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <AlertTriangle size={22} />
              <span>Violations detected</span>
            </motion.div>
          )}
        </div>

        {/* Request new device */}
        <motion.section className="request-borrow-section" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <div className="request-header">
            <PlusCircle size={28} />
            <h2>Request a New Device</h2>
          </div>
          <p className="request-hint">
            Tell the community what you're looking for — someone might have it!
            <br />
            <small>(Late returns or damage may result in fines & reputation impact)</small>
          </p>
          <div className="request-form-layout">
            <div className="input-with-icon">
              <Search size={20} />
              <input type="text" placeholder="What do you need right now?" className="main-request-input" />
            </div>
            <button className="post-request-btn" onClick={handlePostRequest}>
              Post Request
            </button>
          </div>
          <div className="or-divider"><span>or</span></div>
          <button className="browse-catalog-btn" onClick={() => navigate('/browse')}>
            Browse Available Items →
          </button>
        </motion.section>

        {/* Currently Borrowed */}
        <motion.section className="dashboard-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="panel-heading">
            <h3>Currently Borrowed</h3>
            <span className="count-badge">{stats.activeBorrows}</span>
          </div>

          <div className="items-compact-list">
            {activeBorrows.map(item => (
              <div key={item.id} className="compact-borrow-item">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.name} className="item-image" />
                </div>
                <div className="item-info">
                  <div className="item-name-line">{item.name}</div>
                  <div className="due-info">Due {item.due}</div>
                </div>
                <div className="borrower-actions">
                  <button
                    className="message-owner-btn"
                    onClick={() => messageOwner(item.ownerWhatsApp, item.ownerName, item.name)}
                  >
                    <MessageSquare size={16} /> Message Owner
                  </button>
                  <button
                    className="view-details-btn"
                    onClick={() => viewDeviceDetails(item.id)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="see-all-link" onClick={() => navigate('/my-borrows')}>
            View all active borrows →
          </button>
        </motion.section>

        {/* Due Soon */}
        <motion.section className="dashboard-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <div className="panel-heading">
            <h3>Due Soon</h3>
            <span className="count-badge">{stats.upcomingReturns}</span>
          </div>

          <div className="items-compact-list">
            {upcoming.map(item => (
              <div key={item.id} className="compact-borrow-item">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.name} className="item-image" />
                </div>
                <div className="item-info">
                  <div className="item-name-line">{item.name}</div>
                  <div className="due-info warning">Due {item.due}</div>
                </div>
                <div className="borrower-actions">
                  <button
                    className="early-return-btn"
                    onClick={() => openEarlyReturnModal(item)}
                  >
                    Return Now
                  </button>
                  <button
                    className="view-details-btn"
                    onClick={() => viewDeviceDetails(item.id)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quick navigation pills */}
        <div className="quick-pill-row">
          <motion.button className="pill-button" whileHover={{ scale: 1.04 }} onClick={() => navigate('/history')}>
            <History size={18} /> Borrow History
          </motion.button>

          <motion.button className="pill-button" whileHover={{ scale: 1.04 }} onClick={() => navigate('/recommendations')}>
            <Sparkles size={18} /> Recommendations
          </motion.button>

          <motion.button className="pill-button warning" whileHover={{ scale: 1.04 }} onClick={openFinesModal}>
            <AlertTriangle size={18} /> My Fines & Violations
          </motion.button>
        </div>
      </div>

      {/* Fines Modal */}
      {showFinesModal && (
        <div className="modal-overlay" onClick={closeFinesModal}>
          <motion.div className="fines-modal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h2>My Fines & Violations</h2>
              <button className="close-modal-btn" onClick={closeFinesModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {finesAndViolations.length === 0 ? (
                <div className="empty-state">No fines or violations recorded</div>
              ) : (
                <div className="fines-list">
                  {finesAndViolations.map(fine => (
                    <div key={fine.id} className="fine-card">
                      <div className="fine-image-wrapper">
                        <img src={fine.deviceImage} alt={fine.device} />
                      </div>
                      <div className="fine-details">
                        <h4>{fine.device}</h4>
                        <div className="fine-amount">
                          <DollarSign size={18} /> {fine.fineAmount.toLocaleString()} BDT
                        </div>
                        <div className="fine-reason">{fine.reason}</div>
                        <div className="fine-date">Date: {fine.date}</div>
                        <div className={`fine-status ${fine.status.toLowerCase()}`}>
                          {fine.status}
                        </div>
                        <div className="fine-details-text">{fine.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Early Return Modal */}
      {showEarlyReturnModal && selectedItemForReturn && (
        <div className="modal-overlay" onClick={closeEarlyReturnModal}>
          <motion.div
            className="early-return-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Request Early Return</h2>
              <button className="close-modal-btn" onClick={closeEarlyReturnModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="item-name-preview">
                <strong>Item:</strong> {selectedItemForReturn.name}
              </p>

              <form onSubmit={submitEarlyReturn} className="early-return-form">
                <div className="form-group">
                  <label>Proposed Return Date *</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Return Location / Place *</label>
                  <input
                    type="text"
                    placeholder="e.g. IUT Library, Boys Hostel Lobby, Gazipur"
                    value={returnLocation}
                    onChange={e => setReturnLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Photos (optional – condition proof)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReturnPhotoChange}
                  />
                  {returnPhotos.length > 0 && (
                    <div className="photo-preview-container">
                      {returnPhotos.map((file, idx) => (
                        <div key={idx} className="photo-preview-item">
                          <img src={URL.createObjectURL(file)} alt="preview" />
                          <button type="button" onClick={() => setReturnPhotos(prev => prev.filter((_, i) => i !== idx))}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  className="submit-return-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Send size={18} /> Send Return Request
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
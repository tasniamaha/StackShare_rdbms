// src/components/dashboards/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  LogOut,
  X,
  Image as ImageIcon,
  Loader2,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingUsers: 8,
    activeComplaints: 5,
    pendingFines: 2,
    totalUsers: 3,
    suspendedUsers: 4
  });

  const [pendingUsers, setPendingUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setPendingUsers([
        { id: 'u101', name: 'Fahim Rahman', email: 'fahim@iut.edu.bd', role: 'student', subRole: 'borrower', joined: '2 hours ago', status: 'pending' },
        { id: 'u102', name: 'Sumaiya Akter', email: 'sumaiya@iut.edu.bd', role: 'student', subRole: 'lender', joined: '5 hours ago', status: 'pending' },
        { id: 'u103', name: 'Rakib Hossain', email: 'rakib@iut.edu.bd', role: 'student', subRole: 'lender', joined: '1 day ago', status: 'pending' },
      ]);

      setComplaints([
        { 
          id: 'c001', 
          type: 'damage_dispute', 
          item: 'MacBook Pro M2', 
          complainant: 'Nusrat J', 
          against: 'Rahim Ahmed', 
          status: 'pending', 
          date: '2025-03-01',
          description: 'Borrower claims no damage, but lender says keyboard keys are sticky.',
          beforeImage:'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600',
          afterImage:  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQftz74Z49H8lsTNBH-aF0zUsi3ijGoMIbU9g&s',
          timeline: 'Borrowed: Feb 20 • Returned: Feb 28'
        },
        { 
          id: 'c002', 
          type: 'late_penalty', 
          item: 'DJI Mini 4 Pro', 
          complainant: 'Karim H', 
          against: 'System', 
          status: 'under review', 
          date: '2025-02-28',
          description: 'Disputing 2-day late fine — says return was within grace period.',
          beforeImage: null,
          afterImage: null,
          timeline: 'Due: Feb 25 • Returned: Feb 27 (claimed)'
        },
        { 
          id: 'c003', 
          type: 'item_misrepresentation', 
          item: 'Canon EOS R6', 
          complainant: 'Prithvi D', 
          against: 'Sadia Khan', 
          status: 'pending', 
          date: '2025-02-25',
          description: 'Lens has fungus spots not mentioned in listing.',
          beforeImage: 'https://cdn.shopz.com.bd/2023/03/Apexel-100mm-Professional-4K-Macro-Lens-for-SmartPhone-300x300.jpg',
          afterImage: 'https://www.diyvideostudio.com/wp-content/uploads/2021/12/How-To-Get-Rid-of-Camera-Lens-Fungus.webp',
          timeline: 'Borrowed: Feb 15 • Returned: Feb 22'

          
        },
        { 
          id: 'c004', 
          type: 'deposit_withheld', 
          item: 'Rode VideoMic Pro+', 
          complainant: 'Ayesha Siddiqua', 
          against: 'Tahmid Hasan', 
          status: 'pending', 
          date: '2025-03-03',
          description: 'Lender refusing to release deposit despite good condition return.',
          beforeImage: 'https://photofocus.com.bd/storage/product/whdhn3t1hc6hxyaj3dqlraourossae4jjenptcgx.jpg',
          afterImage: 'https://cdn.radio.co/production/rode-videomic-plus-header.png?w=1200&h=630&q=82&auto=format&fit=crop&dm=1696233485&s=aeee2875932270a9b1f07ffeaf70ab64',
          timeline: 'Returned: Mar 01'
        }
      ]);

      setLoading(false);
    }, 900);
  }, []);

  const handleApproveUser = (userId) => {
    if (window.confirm('Approve this user?')) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, pendingUsers: prev.pendingUsers - 1 }));
      alert('User approved successfully');
    }
  };

  const handleRejectUser = (userId) => {
    if (window.confirm('Reject and delete this user?')) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, pendingUsers: prev.pendingUsers - 1 }));
      alert('User rejected');
    }
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  const handleAdminDecision = (decision) => {
    if (!selectedComplaint) return;
    alert(`Admin decision: ${decision} for complaint ${selectedComplaint.id}`);
    // Later: update backend status + notify users
    closeModal();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 className="spin" size={48} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="bg-layer"></div>
      <div className="overlay-gradient"></div>

      <div className="container admin-content">
        {/* Header */}
        <motion.header 
          className="admin-header"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="header-title">
            <ShieldAlert size={36} />
            <h1>Admin Dashboard</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </motion.header>

        {/* Stats */}
        <div className="stats-grid">
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Users size={32} />
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </motion.div>
          <motion.div className="stat-card warning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AlertTriangle size={32} />
            <div className="stat-value">{stats.pendingUsers}</div>
            <div className="stat-label">Pending Approvals</div>
          </motion.div>
          <motion.div className="stat-card danger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AlertCircle size={32} />
            <div className="stat-value">{stats.activeComplaints}</div>
            <div className="stat-label">Active Complaints</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <DollarSign size={32} />
            <div className="stat-value">{stats.pendingFines}</div>
            <div className="stat-label">Pending Fines</div>
          </motion.div>
        </div>

        {/* Pending Approvals */}
        <motion.section className="admin-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2>Pending Member Approvals ({stats.pendingUsers})</h2>
          {pendingUsers.length === 0 ? (
            <div className="empty-state">No pending approvals</div>
          ) : (
            <div className="table-container">
              <table className="pending-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.subRole ? `${user.role} (${user.subRole})` : user.role}</td>
                      <td>{user.joined}</td>
                      <td>
                        <button className="approve-btn" onClick={() => handleApproveUser(user.id)}>
                          <CheckCircle size={18} /> Approve
                        </button>
                        <button className="reject-btn" onClick={() => handleRejectUser(user.id)}>
                          <XCircle size={18} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Active Complaints – Scrollable */}
        <motion.section className="admin-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2>Active Complaints ({stats.activeComplaints})</h2>
          {complaints.length === 0 ? (
            <div className="empty-state">No active complaints</div>
          ) : (
            <div className="complaints-scroll-container">
              <div className="complaints-list">
                {complaints.map(c => (
                  <motion.div 
                    key={c.id} 
                    className="complaint-card"
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(255,51,102,0.15)' }}
                  >
                    <div className="complaint-type">{c.type.replace('_', ' ').toUpperCase()}</div>
                    <div className="complaint-item">Item: {c.item}</div>
                    <div className="complaint-parties">
                      Complainant: {c.complainant} • Against: {c.against}
                    </div>
                    <div className="complaint-date">Reported: {c.date}</div>
                    <div className={`complaint-status ${c.status.replace(' ', '-')}`}>
                      {c.status}
                    </div>
                    <button 
                      className="view-complaint-btn"
                      onClick={() => openComplaintModal(c)}
                    >
                      Review Complaint →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <motion.div 
            className="complaint-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Complaint Review: {selectedComplaint.type.replace('_', ' ').toUpperCase()}</h2>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="complaint-detail-grid">
                <div><strong>Item:</strong> {selectedComplaint.item}</div>
                <div><strong>Complainant:</strong> {selectedComplaint.complainant}</div>
                <div><strong>Against:</strong> {selectedComplaint.against}</div>
                <div><strong>Reported:</strong> {selectedComplaint.date}</div>
              </div>

              <div className="evidence-section">
                <h3>Evidence</h3>
                <p><strong>Description:</strong> {selectedComplaint.description}</p>
                <p><strong>Timeline:</strong> {selectedComplaint.timeline}</p>

                <div className="image-comparison">
                  {selectedComplaint.beforeImage && (
                    <div className="image-card">
                      <h4>Before</h4>
                      <img src={selectedComplaint.beforeImage} alt="Before" />
                    </div>
                  )}
                  {selectedComplaint.afterImage && (
                    <div className="image-card">
                      <h4>After</h4>
                      <img src={selectedComplaint.afterImage} alt="After" />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-actions">
                <h3>Admin Decision</h3>
                <div className="decision-buttons">
                  <motion.button 
                    className="decision-btn responsible"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAdminDecision('Borrower Responsible')}
                  >
                    <AlertTriangle size={18} /> Borrower Responsible
                  </motion.button>

                  <motion.button 
                    className="decision-btn dismiss"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAdminDecision('Dismiss Claim')}
                  >
                    <XCircle size={18} /> Dismiss Claim
                  </motion.button>

                  <motion.button 
                    className="decision-btn split"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAdminDecision('Split 50/50')}
                  >
                    <DollarSign size={18} /> Split Cost (50/50)
                  </motion.button>

                  <motion.button 
                    className="decision-btn more-info"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAdminDecision('Request More Info')}
                  >
                    <Info size={18} /> Request More Info
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
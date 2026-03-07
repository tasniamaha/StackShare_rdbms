// src/components/dashboards/BorrowHistory.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { History, Eye, ArrowLeftCircle } from 'lucide-react';

import './BorrowHistory.css';

export default function BorrowHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch (replace with real endpoint later)
    setTimeout(() => {
      setHistory([
        {
          id: 201,
          deviceId: "101",
          name: 'MacBook Pro 16″ M2 Max',
          deviceImage: 'https://www.custommacbd.com/cdn/shop/products/mbp14-space-gray-gallery1-2023-Custom-Mac-BD_529b2768-1bc4-49d4-b0cd-d54de14e4d49.jpg?v=1674281040',
          borrowed: '2025-01-10',
          returned: '2025-01-25',
          status: 'Returned',
          fine: 0,
          fineStatus: 'None'
        },
        {
          id: 202,
          deviceId: "102",
          name: 'DJI Mini 4 Pro + extra battery',
          deviceImage: 'https://m.media-amazon.com/images/I/61lxcDZbXoL.jpg',
          borrowed: '2024-12-05',
          returned: '2024-12-22',
          status: 'Returned Late',
          fine: 380,
          fineStatus: 'Paid'
        },
        {
          id: 203,
          deviceId: "103",
          name: 'Canon EOS R6 + 24-70mm',
          deviceImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&auto=format&fit=crop',
          borrowed: '2024-11-15',
          returned: null,
          status: 'Active',
          fine: 0,
          fineStatus: 'None'
        },
        {
          id: 204,
          deviceId: "104",
          name: 'iPad Pro 12.9″ M2',
          deviceImage: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=200&auto=format&fit=crop',
          borrowed: '2025-02-01',
          returned: '2025-02-28',
          status: 'Returned',
          fine: 0,
          fineStatus: 'None'
        },
        {
          id: 205,
          deviceId: "105",
          name: 'Rode VideoMic Pro+',
          deviceImage: 'https://www.digitalshopbd.com/media/products/thumbnail/VideoMic_Pro_1.webp',
          borrowed: '2025-03-01',
          returned: '2025-03-04',
          status: 'Returned with Damage',
          fine: 250,
          fineStatus: 'Pending'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading borrow history...</p>
      </div>
    );
  }

  return (
    <div className="borrow-history-page">
      {/* Background layers (matching your dashboard style) */}
      <div className="bg-layer"></div>
      <div className="overlay-gradient"></div>
      <div className="bg-grid-lines"></div>

      <div className="history-content">
        <motion.div
          className="history-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <History size={36} />
          <h1>Borrow History</h1>
        </motion.div>

        {history.length === 0 ? (
          <div className="empty-history">
            <h3>No borrowing history yet</h3>
            <p>Start borrowing gear from the community!</p>
            <button className="browse-btn" onClick={() => navigate('/browse')}>
              Browse Available Devices
            </button>
          </div>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <motion.div
                key={item.id}
                className="history-item"
                whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(0,240,255,0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="history-image-wrapper">
                  <img src={item.deviceImage} alt={item.name} className="history-image" />
                </div>

                <div className="history-info">
                  <h3 className="history-item-name">{item.name}</h3>

                  <div className="borrow-dates">
                    <div>Borrowed: <strong>{item.borrowed}</strong></div>
                    <div>Returned: <strong>{item.returned || 'Still borrowed'}</strong></div>
                  </div>

                  <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>

                  {item.fine > 0 && (
                    <div className="fine-info">
                      Fine: <strong className="fine-amount">৳{item.fine.toLocaleString()}</strong>
                      <span className={`fine-status ${item.fineStatus.toLowerCase()}`}>
                        {item.fineStatus}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="view-device-btn"
                  onClick={() => navigate(`/devices/${item.deviceId}`)}
                >
                  <Eye size={18} /> View Device
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          className="back-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeftCircle size={20} /> Back to Dashboard
        </motion.button>
      </div>
    </div>
  );
}
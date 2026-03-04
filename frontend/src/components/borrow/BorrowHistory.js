// src/components/dashboards/BorrowHistory.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { History, Eye } from 'lucide-react';
import './BorrowHistory.css'; 

export default function BorrowHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API
    setTimeout(() => {
      setHistory([
        { id: 201, name: 'Sony A7 IV + 35mm f/1.4', borrowed: '2025-01-10', returned: '2025-01-25', status: 'Returned' },
        { id: 202, name: 'iPhone 15 Pro Max', borrowed: '2024-12-05', returned: '2024-12-20', status: 'Returned' },
        { id: 203, name: 'MacBook Pro 16" M2 Max', borrowed: '2024-11-15', returned: '2024-12-01', status: 'Returned' },
        // add more...
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="history-page">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Borrow History
      </motion.h1>

      <div className="history-list">
        {history.map(item => (
          <motion.div
            key={item.id}
            className="history-item"
            whileHover={{ scale: 1.02 }}
          >
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>Borrowed: {item.borrowed} — Returned: {item.returned}</p>
              <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
            </div>
            <button onClick={() => navigate(`/devices/${item.id}`)}>
              <Eye size={18} /> View Device
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

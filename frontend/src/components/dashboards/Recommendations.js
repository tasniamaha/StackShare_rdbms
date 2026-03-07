// src/components/dashboards/Recommendations.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye, ArrowLeftCircle } from 'lucide-react';

import './Recommendations.css';

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch (replace with real recommendation endpoint later)
    setTimeout(() => {
      setRecommendations([
        {
          id: "1",  // matches DeviceDetails mock data
          name: 'MacBook Pro 16" M2 Pro',
          category: 'Laptop',
          image: 'https://cameraworldbd.com/public/uploads/all/TcxNWwRD346JPDCjOnxCOcG1SttjIBNdFfmBZNoU.png',
          pricePerDay: 1200,
          description: 'High-performance laptop with Apple M2 Pro chip, 32GB unified memory, 1TB SSD. Perfect for video editing, programming, 3D rendering.'
        },
        {
          id: "2",  // matches DeviceDetails mock data
          name: 'Canon EOS R6 + 24-70mm Lens',
          category: 'Camera',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&auto=format&fit=crop',
          pricePerDay: 850,
          description: 'Full-frame mirrorless camera with excellent autofocus and 4K video capabilities. Comes with RF 24-70mm f/2.8L lens.'
        },
        {
          id: "3",  // matches DeviceDetails mock data
          name: 'DJI Mini 4 Pro Drone + Extra Battery',
          category: 'Drone',
          image: 'https://images.ctfassets.net/et769tc4wc1v/2XiC2KW8zW1UA46aHJoRHh/7c47d1695ffcb7ba69a11b3eb9316a03/DJI_Mini_4_Pro__1_.png?w=1024&h=768&q=50&fm=png&bg=transparent',
          pricePerDay: 950,
          description: 'Ultra-light drone (under 249g) with 4K/100fps HDR video, omnidirectional obstacle sensing, and 34-minute flight time.'
        },
        {
          id: "304",
          name: 'Sony ZV-1 II Vlogging Camera',
          category: 'Compact Camera',
          image: 'https://camerasourcebd.com/wp-content/uploads/2022/10/Sony-ZV-1-4.jpg',
          pricePerDay: 800,
          description: '18mm wide lens, 1" sensor, 4K video, built-in 3-capsule mic. Ideal for content creators.'
        }
      ]);
      setLoading(false);
    }, 900);
  }, []);

  const goToDeviceDetails = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  if (loading) {
    return (
      <div className="rec-loading">
        <div className="rec-spinner"></div>
        <p>Finding recommendations for you...</p>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      {/* Background layers – unique class names to avoid overlap */}
      <div className="rec-bg-layer"></div>
      <div className="rec-overlay-gradient"></div>
      <div className="rec-grid-lines"></div>

      <div className="rec-content">
        <motion.div
          className="rec-header"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles size={36} />
          <h1>Recommended for You</h1>
          <p className="rec-subtitle">
            Based on your interests and borrowing history
          </p>
        </motion.div>

        {recommendations.length === 0 ? (
          <div className="rec-empty-state">
            <h3>No recommendations yet</h3>
            <p>Borrow more items to get personalized suggestions!</p>
            <button className="rec-browse-btn" onClick={() => navigate('/browse')}>
              Browse All Devices
            </button>
          </div>
        ) : (
          <div className="rec-grid">
            {recommendations.map((item) => (
              <motion.div
                key={item.id}
                className="rec-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.04, boxShadow: '0 15px 35px rgba(0,240,255,0.18)' }}
                onClick={() => goToDeviceDetails(item.id)}
              >
                <div className="rec-image-wrapper">
                  <img src={item.image} alt={item.name} className="rec-image" />
                  <div className="rec-overlay"></div>
                </div>

                <div className="rec-info">
                  <h3 className="rec-name">{item.name}</h3>
                  <p className="rec-category">{item.category}</p>
                  <p className="rec-price">
                    ৳{item.pricePerDay?.toLocaleString() || 'N/A'}/day
                  </p>
                  <p className="rec-description">
                    {item.description?.substring(0, 80)}...
                  </p>
                </div>

                <button 
                  className="rec-view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double navigation
                    goToDeviceDetails(item.id);
                  }}
                >
                  <Eye size={18} /> View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          className="rec-back-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeftCircle size={20} /> Back to Dashboard
        </motion.button>
      </div>
    </div>
  );
}
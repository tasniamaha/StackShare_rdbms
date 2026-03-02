// src/components/dashboards/Recommendations.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye } from 'lucide-react';
import './Recommendations.css'; // minimal css

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRecommendations([
        { id: 301, name: 'GoPro HERO12 Black', category: 'Action Camera', image: 'https://images.unsplash.com/photo-1563281578-5c4d6d2d2c6e?w=400' },
        { id: 302, name: 'Dell XPS 15 OLED', category: 'Laptop', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400' },
        { id: 303, name: 'Rode VideoMic Pro+', category: 'Microphone', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=400' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="recommendations-page">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Recommended for You
      </motion.h1>

      <div className="rec-grid">
        {recommendations.map(item => (
          <motion.div
            key={item.id}
            className="rec-card"
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/devices/${item.id}`)}
          >
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>{item.category}</p>
            <button>
              <Eye size={16} /> View Details
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
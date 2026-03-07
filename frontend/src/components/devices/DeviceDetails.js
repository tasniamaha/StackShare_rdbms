// src/components/devices/DeviceDetails.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, DollarSign, User, MessageSquare, Heart, Share2, 
  ArrowLeftCircle, AlertCircle, Phone, Bell, BellOff, Loader2 
} from 'lucide-react';

import BorrowRequestForm from './BorrowRequestForm';  // ← Import the shared form

import './DeviceDetails.css';

// Mock data (unchanged)
const mockDevices = [
  {
    id: "1",
    name: 'MacBook Pro 16" M2 Pro',
    category: 'Laptop',
    pricePerDay: 1200,
    status: 'available',
    images: [
      'https://diamu.com.bd/wp-content/uploads/2023/07/Apple-MacBook-Pro-M2-Pro-2023-14-inch-10-Core-CPU-16-Core-GPU.jpg',
      'https://www.apple.com/newsroom/images/product/mac/standard/Apple-MacBook-Pro-M2-Pro-and-M2-Max-hero-230117_Full-Bleed-Image.jpg.large.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ979n5zTg-6jq0dhnAaFGfQ1jpZTgmzZ4HQ&s',
    ],
    description: 'High-performance laptop with Apple M2 Pro chip, 32GB unified memory, 1TB SSD. Perfect for video editing, programming, 3D rendering, and multitasking. In pristine condition.',
    condition: 'Excellent (like new)',
    location: 'IUT Campus, Gazipur',
    availableFrom: 'Immediate',
    ownerName: 'Rahim Ahmed',
    owner_id: 'rahim123',
    ownerReputation: 92,
    ownerWhatsApp: '+8801712345678',
    specifications: {
      Processor: 'Apple M2 Pro (12-core CPU, 19-core GPU)',
      RAM: '32 GB unified memory',
      Storage: '1 TB SSD',
      Display: '16.2-inch Liquid Retina XDR (3456×2234)',
      Battery: 'Up to 22 hours video playback',
      Ports: '3× Thunderbolt 4, HDMI, SDXC card slot, MagSafe 3'
    },
    maintenanceTips: 'Keep away from liquids. Clean keyboard with compressed air. Use a protective case. Charge to 80% for optimal battery health. Avoid extreme temperatures.',
    reviews: [
      { user: 'Nusrat J', rating: 5, comment: 'Super fast and reliable. Battery life is insane!', date: '2025-01-15' },
      { user: 'Karim H', rating: 4, comment: 'Great for coding, but a bit heavy for daily commute.', date: '2025-02-02' },
      { user: 'Sumaiya A', rating: 5, comment: 'Screen is gorgeous for photo editing.', date: '2025-02-10' }
    ],
    similarProducts: [
      { id: '7', name: 'Dell XPS 15 OLED', category: 'Laptop', pricePerDay: 1000, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&auto=format&fit=crop' },
      { id: '8', name: 'Microsoft Surface Laptop 5', category: 'Laptop', pricePerDay: 900, image: 'https://images.unsplash.com/photo-1622770340772-98e4fb7a920a?w=400&auto=format&fit=crop' }
    ]
  },
  // ... (keep the rest of your mockDevices array as is)
];

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Notification subscription
  const [notifySubscriptions, setNotifySubscriptions] = useState(() => {
    const saved = localStorage.getItem('notifySubscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  // Borrow modal visibility
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('notifySubscriptions', JSON.stringify(notifySubscriptions));
  }, [notifySubscriptions]);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true);
        setError(null);
        const found = mockDevices.find(d => d.id === id);
        if (found) {
          setDevice(found);
        } else {
          throw new Error('Device not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load device');
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id]);

  const isSubscribed = device && notifySubscriptions.includes(device.id);

  const toggleNotify = () => {
    if (!device) return;

    setNotifySubscriptions(prev => {
      if (prev.includes(device.id)) {
        return prev.filter(dId => dId !== device.id);
      }
      return [...prev, device.id];
    });

    alert(
      isSubscribed
        ? "Unsubscribed from notifications for this device."
        : "You will be notified when this device becomes available!"
    );
  };

  // Handle successful form submission
  const handleBorrowSubmit = (requestData) => {
    console.log("Borrow request submitted:", requestData);
    alert("Request has been sent — you will be notified of any update!");
    setShowBorrowModal(false);
  };

  const handleMessageOwner = () => {
    if (!device?.ownerWhatsApp) {
      alert('Owner contact not available.');
      return;
    }
    window.open(`https://wa.me/${device.ownerWhatsApp.replace('+', '')}`, '_blank');
  };

  const handleAddToWishlist = () => {
    alert('Added to your wishlist! (Feature coming soon)');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: device.name,
        text: `Check out ${device.name} on StackShare!`,
        url: window.location.href,
      }).catch(err => console.log('Share failed:', err));
    } else {
      alert('Share not supported. Copy link manually.');
    }
  };

  const goBack = () => navigate(-1);

  const changeImage = (direction) => {
    if (!device?.images?.length) return;
    setCurrentImageIndex(prev => {
      if (direction === 'next') return (prev + 1) % device.images.length;
      return (prev - 1 + device.images.length) % device.images.length;
    });
  };

  if (loading) {
    return (
      <div className="device-details-loading">
        <Loader2 className="spin" size={48} />
        <p>Loading device details...</p>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="device-details-error">
        <AlertCircle size={64} />
        <h2>Oops... Device Not Found</h2>
        <p>{error || 'This device is not in our catalog or may have been removed.'}</p>
        <div className="error-actions">
          <button className="btn primary" onClick={() => navigate('/browse')}>
            Browse Devices
          </button>
          <button className="btn secondary" onClick={goBack}>
            <ArrowLeftCircle size={20} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-details-page">
      {/* Hero Section */}
      <motion.section className="device-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="hero-image-wrapper">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={device.images[currentImageIndex]}
              alt={device.name}
              className="hero-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
          <div className="hero-overlay" />

          {device.images.length > 1 && (
            <div className="image-controls">
              <button className="image-nav prev" onClick={() => changeImage('prev')}>←</button>
              <div className="image-dots">
                {device.images.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
              <button className="image-nav next" onClick={() => changeImage('next')}>→</button>
            </div>
          )}
        </div>

        <div className="hero-content">
          <div className="container">
            <motion.h1 className="device-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {device.name}
            </motion.h1>

            <div className="device-meta">
              <span className="category-tag">{device.category}</span>
              <span className="price">
                <DollarSign size={20} />
                {device.pricePerDay ? `${device.pricePerDay.toLocaleString()}/day` : 'Free'}
              </span>
              <span className={`status-badge ${device.status?.toLowerCase() || 'unknown'}`}>
                {device.status === 'available' ? 'Available' : 'Currently Borrowed'}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container device-main-content">
        <div className="device-info-column">
          {/* Owner Card */}
          <motion.div className="owner-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="owner-header">
              <User size={20} />
              <h3>Owner</h3>
            </div>
            <div className="owner-name">{device.ownerName || 'Anonymous'}</div>
            <div className="owner-reputation">
              Reputation: <strong>{device.ownerReputation || 'N/A'}</strong>
            </div>
            <div className="owner-contact">
              <Phone size={18} />
              <a href={`https://wa.me/${device.ownerWhatsApp?.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                WhatsApp: {device.ownerWhatsApp || 'Not available'}
              </a>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div className="description-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3>Description</h3>
            <p>{device.description || 'No description available.'}</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="action-buttons" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {device.status?.toLowerCase() === 'available' ? (
              <button className="btn primary large" onClick={() => setShowBorrowModal(true)}>
                Request to Borrow
              </button>
            ) : (
              <motion.button
                className={`notify-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={toggleNotify}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isSubscribed ? (
                  <>
                    <BellOff size={18} /> Subscribed (Notify when available)
                  </>
                ) : (
                  <>
                    <Bell size={18} /> Notify Me When Available
                  </>
                )}
              </motion.button>
            )}

            <button className="btn secondary" onClick={handleMessageOwner}>
              <MessageSquare size={18} /> Message Owner
            </button>

            <div className="secondary-actions">
              <button className="btn icon-btn" onClick={handleAddToWishlist}>
                <Heart size={18} /> Wishlist
              </button>
              <button className="btn icon-btn" onClick={handleShare}>
                <Share2 size={18} /> Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="device-details-column">
          {/* Device Details */}
          <motion.div className="details-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h3>Device Details</h3>
            <ul className="details-list">
              <li><strong>Category:</strong> {device.category}</li>
              <li><strong>Condition:</strong> {device.condition || 'Good'}</li>
              <li><strong>Location:</strong> {device.location || 'Campus'}</li>
              <li><strong>Availability:</strong> {device.availableFrom || 'Immediate'}</li>
              <li><strong>Daily Rate:</strong> {device.pricePerDay ? `৳${device.pricePerDay.toLocaleString()}/day` : 'Free'}</li>
            </ul>
          </motion.div>

          {/* Reviews & Similar – keep your original code here */}
        </div>
      </div>

      {/* Borrow Request Modal using shared component */}
      <AnimatePresence>
        {showBorrowModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBorrowModal(false)}
          >
            <BorrowRequestForm
              device={device}
              onSubmit={handleBorrowSubmit}
              onClose={() => setShowBorrowModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceDetails;
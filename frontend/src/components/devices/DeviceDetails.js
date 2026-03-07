// src/components/devices/DeviceDetails.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare, 
  Heart, 
  Share2, 
  ArrowLeftCircle,
  AlertCircle,
  Phone
} from 'lucide-react';

import './DeviceDetails.css';

// Expanded mock data – now includes items from BorrowerDashboard (IDs 101–105)
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
  // ... (keeping original items 2, 3, 4 unchanged for brevity)
  {
    id: "101",
    name: 'MacBook Pro 16″ M2 Max',
    category: 'Laptop',
    pricePerDay: 1500,
    status: 'borrowed',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ979n5zTg-6jq0dhnAaFGfQ1jpZTgmzZ4HQ&s',
    ],
    description: 'Top-tier MacBook Pro with M2 Max chip – borrowed until March 15.',
    condition: 'Excellent',
    location: 'IUT Campus',
    availableFrom: 'March 16, 2025',
    ownerName: 'Noshin Syara',
    owner_id: 'noshin123',
    ownerReputation: 88,
    ownerWhatsApp: '+88017xxxxxxxx',
    specifications: { /* ... same as id 1 */ },
    reviews: [],
    similarProducts: []
  },
  {
    id: "102",
    name: 'DJI Mini 4 Pro + extra battery',
    category: 'Drone',
    pricePerDay: 950,
    status: 'borrowed',
    images: [
      'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=1200&auto=format&fit=crop'
    ],
    description: 'Lightweight drone with 4K video – currently in use until March 8.',
    condition: 'Like New',
    location: 'IUT Boys Hostel',
    availableFrom: 'March 9, 2025',
    ownerName: 'Noshin Syara',
    owner_id: 'noshin123',
    ownerReputation: 88,
    ownerWhatsApp: '+88017xxxxxxxx',
    specifications: { /* ... same as id 3 */ },
    reviews: [],
    similarProducts: []
  },
  {
    id: "103",
    name: 'Canon EOS R6 + 24-70mm',
    category: 'Camera',
    pricePerDay: 850,
    status: 'borrowed',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop'
    ],
    description: 'Full-frame mirrorless camera – borrowed until March 22.',
    condition: 'Excellent',
    location: 'IUT Campus',
    availableFrom: 'March 23, 2025',
    ownerName: 'Noshin Syara',
    owner_id: 'noshin123',
    ownerReputation: 88,
    ownerWhatsApp: '+88017xxxxxxxx',
    specifications: { /* ... same as id 2 */ },
    reviews: [],
    similarProducts: []
  },
  {
    id: "104",
    name: 'iPad Pro 12.9″ M2',
    category: 'Tablet',
    pricePerDay: 700,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=1200&auto=format&fit=crop'
    ],
    description: 'High-end tablet – due back Feb 28 (upcoming return).',
    condition: 'Very Good',
    location: 'IUT Campus',
    availableFrom: 'March 1, 2025',
    ownerName: 'Noshin Syara',
    owner_id: 'noshin123',
    ownerReputation: 88,
    ownerWhatsApp: '+88017xxxxxxxx',
    specifications: { /* ... same as id 4 */ },
    reviews: [],
    similarProducts: []
  },
  {
    id: "105",
    name: 'Rode VideoMic Pro+',
    category: 'Audio',
    pricePerDay: 300,
    status: 'borrowed',
    images: [
      'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=1200&auto=format&fit=crop'
    ],
    description: 'Professional shotgun microphone – due March 3.',
    condition: 'Excellent',
    location: 'IUT Campus',
    availableFrom: 'March 4, 2025',
    ownerName: 'Noshin Syara',
    owner_id: 'noshin123',
    ownerReputation: 88,
    ownerWhatsApp: '+88017xxxxxxxx',
    specifications: {},
    reviews: [],
    similarProducts: []
  }
  // ... you can keep or add more original items here
];

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true);
        setError(null);

        const foundDevice = mockDevices.find(d => d.id === id);
        if (foundDevice) {
          setDevice(foundDevice);
        } else {
          throw new Error('Device not found in our catalog');
        }
      } catch (err) {
        setError(err.message || 'Failed to load device details');
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  const handleRequestBorrow = () => {
    if (device?.status?.toLowerCase() !== 'available') {
      alert('This device is currently not available.');
      return;
    }
    navigate(`/borrow/request?deviceId=${id}`);
  };

  const handleMessageOwner = () => {
    if (!device?.owner_id) {
      alert('Owner contact not available.');
      return;
    }
    navigate(`/messages?to=${device.owner_id}`);
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

  const goBack = () => {
    navigate(-1);
  };

  const changeImage = (direction) => {
    setCurrentImageIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % device.images.length;
      } else {
        return (prev - 1 + device.images.length) % device.images.length;
      }
    });
  };

  if (loading) {
    return (
      <div className="device-details-loading">
        <div className="spinner"></div>
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
        <p className="error-hint">
          Try browsing other items or go back to your dashboard.
        </p>
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
      {/* Hero / Main Image Section */}
      <motion.section 
        className="device-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-image-wrapper">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              src={device.images[currentImageIndex]}
              alt={`${device.name} - view ${currentImageIndex + 1}`}
              className="hero-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          <div className="hero-overlay"></div>

          {device.images.length > 1 && (
            <div className="image-controls">
              <button className="image-nav prev" onClick={() => changeImage('prev')}>
                ←
              </button>
              <div className="image-dots">
                {device.images.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  ></span>
                ))}
              </div>
              <button className="image-nav next" onClick={() => changeImage('next')}>
                →
              </button>
            </div>
          )}
        </div>

        <div className="hero-content">
          <div className="container">
            <motion.h1 
              className="device-title"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {device.name}
            </motion.h1>

            <div className="device-meta">
              <span className="category-tag">{device.category}</span>
              <span className="price">
                <DollarSign size={20} /> 
                {device.pricePerDay ? `${device.pricePerDay.toLocaleString()}/day` : 'Free'}
              </span>
              <span className={`status-badge ${device.status?.toLowerCase() || 'unknown'}`}>
                {device.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container device-main-content">
        {/* Left Column */}
        <div className="device-info-column">
          {/* Owner Info */}
          <motion.div 
            className="owner-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="owner-header">
              <User size={20} />
              <h3>Owner</h3>
            </div>
            <div className="owner-name">
              {device.ownerName || 'Anonymous Owner'}
            </div>
            <div className="owner-reputation">
              Reputation: <strong>{device.ownerReputation || 'N/A'}</strong>
            </div>
            <div className="owner-contact">
              <Phone size={18} />
              <a href={`https://wa.me/${device.ownerWhatsApp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp: {device.ownerWhatsApp || 'N/A'}
              </a>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            className="description-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Description</h3>
            <p>{device.description || 'No description provided.'}</p>
          </motion.div>

          {/* Maintenance Tips */}
          <motion.div 
            className="maintenance-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h3>How to Maintain This Item</h3>
            <p>{device.maintenanceTips || 'No maintenance tips provided. Handle with care.'}</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="action-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button 
              className="btn primary large"
              onClick={handleRequestBorrow}
              disabled={device.status?.toLowerCase() !== 'available'}
            >
              {device.status?.toLowerCase() === 'available' 
                ? 'Request to Borrow' 
                : 'Currently Unavailable'}
            </button>

            <button 
              className="btn secondary"
              onClick={handleMessageOwner}
            >
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
          {/* Specs */}
          <motion.div 
            className="details-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Device Details</h3>
            <ul className="details-list">
              <li><strong>Category:</strong> {device.category}</li>
              <li><strong>Condition:</strong> {device.condition || 'Good'}</li>
              <li><strong>Location:</strong> {device.location || 'University Campus'}</li>
              <li><strong>Availability:</strong> {device.availableFrom || 'Immediate'}</li>
              <li><strong>Daily Rate:</strong> {device.pricePerDay ? `৳${device.pricePerDay.toLocaleString()}/day` : 'Free'}</li>
              {device.specifications && Object.entries(device.specifications).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </motion.div>

          {/* Reviews */}
          <motion.div 
            className="reviews-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Reviews ({device.reviews?.length || 0})</h3>
            {device.reviews?.length > 0 ? (
              <div className="reviews-list">
                {device.reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <strong>{review.user}</strong>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">No reviews yet for this device.</p>
            )}
          </motion.div>

          {/* Similar Products */}
          <motion.div 
            className="similar-products"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Similar Products</h3>
            <div className="similar-grid">
              {device.similarProducts?.length > 0 ? (
                device.similarProducts.map((similar) => (
                  <motion.div
                    key={similar.id}
                    className="similar-card"
                    whileHover={{ scale: 1.03 }}
                    onClick={() => navigate(`/devices/${similar.id}`)}
                  >
                    <img src={similar.image} alt={similar.name} className="similar-image" />
                    <h4>{similar.name}</h4>
                    <p>{similar.category}</p>
                    <p className="similar-price">
                      {similar.pricePerDay ? `৳${similar.pricePerDay}/day` : 'Free'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p>No similar products available right now.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;

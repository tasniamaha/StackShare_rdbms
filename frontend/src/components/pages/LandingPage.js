// src/components/pages/LandingPage.js
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';
import landingBg from '../../assets/image/landing_background.webp';

const sampleDevices = [
  {
    id: 1,
    name: 'MacBook Pro 16" M2 Pro',
    category: 'Laptop',
    pricePerDay: 1200,
    available: true,
    ownerName: 'Rahim Ahmed',
    image: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Canon EOS R6 + 24-70mm Lens',
    category: 'Camera',
    pricePerDay: 850,
    available: false,
    ownerName: 'Sadia Khan',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'DJI Mini 4 Pro Drone + Extra Battery',
    category: 'Drone',
    pricePerDay: 950,
    available: true,
    ownerName: 'Karim Hossain',
    image: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" M2 (2022)',
    category: 'Tablet',
    pricePerDay: 700,
    available: true,
    ownerName: 'Nusrat Jahan',
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.92 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: custom * 0.11 + 0.25,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${landingBg})` }}
    >
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid-overlay"></div>
        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            <h1 className="neon-title">
              <span className="neon-pink">Stack</span>
              <span className="neon-purple">Share</span>
            </h1>

            <p className="tagline glitch" data-text="Borrow high-quality gear from your campus community">
              Borrow high-quality gear from your campus community
            </p>

            <div className="hero-buttons">
              <motion.button
                className="btn neon-btn pink"
                whileHover={{ scale: 1.07, boxShadow: '0 0 35px #ff00aa99' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/login')}
              >
                Start Borrowing
              </motion.button>

              <motion.button
                className="btn neon-btn purple"
                whileHover={{ scale: 1.07, boxShadow: '0 0 35px #c300ff99' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/login?intent=lender')}
              >
                Become a Lender
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Devices */}
      <section className="devices-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Available <span className="highlight">Devices</span> Now
          </motion.h2>

          <div className="devices-grid">
            {sampleDevices.map((device, index) => (
              <motion.div
                key={device.id}
                className={`device-card ${device.available ? 'available' : 'unavailable'}`}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                whileHover={{ y: -10, boxShadow: '0 20px 45px rgba(170,0,255,0.28)' }}
                onClick={() => navigate(`/devices/${device.id}`)}
              >
                <div
                  className="device-image"
                  style={{ backgroundImage: `url(${device.image})` }}
                >
                  <div className="image-scanline"></div>
                </div>

                <div className="device-info">
                 <h3 className="device-title">{device.name}</h3>
                  <div className="device-meta">
                    <span className="category">{device.category}</span>
                    <span className="price">৳{device.pricePerDay.toLocaleString('en-US')}/day</span>
                  </div>

                  <div className="status-row">
                    <span className={`status-badge ${device.available ? 'avail neon-green' : 'unavail neon-red'}`}>
                      {device.available ? 'Available Now' : 'Unavailable'}
                    </span>
                  </div>

                  <p className="owner">
                    Owner: <strong>{device.ownerName}</strong>
                  </p>

                  <button
                    className="btn-view neon-btn small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/devices/${device.id}`);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="neon-title">Join <span className="highlight">StackShare</span> Today</h2>
            <p className="cta-text">
              Share gear, borrow gear — made only for IUT students and clubs
            </p>

            <div className="cta-buttons">
              <motion.button
                className="btn neon-btn pink large"
                whileHover={{ scale: 1.08, boxShadow: '0 0 45px #ff00aa' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
              >
                Start Borrowing Now
              </motion.button>

              <motion.button
                className="btn neon-btn purple large"
                whileHover={{ scale: 1.08, boxShadow: '0 0 45px #c300ff' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login?intent=lender')}
              >
                Start Lending Gear
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
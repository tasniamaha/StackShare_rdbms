// src/components/pages/LandingPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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
    image:'https://www.startech.com.bd/image/cache/catalog/laptop/apple/macbook-air-m2-chip/macbook-air-m2-chip-01-500x500.webp',
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
    image: 'https://www.startech.com.bd/image/cache/catalog/drones/dji/neo-2-standard/neo-2-standard-03-500x500.webp',
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
  const [showPolicyModal, setShowPolicyModal] = useState(false);

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

      {/* Top Bar: Login / Sign Up / Terms */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="auth-buttons">
            <motion.button
              className="btn top-btn login-btn"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/login')}
            >
              Login
            </motion.button>
            <motion.button
              className="btn top-btn signup-btn"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </motion.button>
            <motion.button
              className="btn top-btn policy-btn"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowPolicyModal(true)}
            >
              Terms & Regulations
            </motion.button>
          </div>
        </div>
      </div>

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
               <div className="device-image">
  <img src={device.image} alt={device.name} />
  <div className="image-scanline"></div>
</div>

                <div className="device-info">
                  <h3 className="device-title">{device.name}</h3>
                  <div className="device-meta">
                    <span className="category">{device.category}</span>
                    <span className="price">
                      {device.pricePerDay === 0 ? 'Free' : `৳${device.pricePerDay.toLocaleString('en-US')}/day`}
                    </span>
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
          
          <br></br>
          <br></br>
          <br></br>
          <br></br>
            <br></br>
          <br></br>
          <br></br>
          <br></br>
           <br></br>
          <br></br>
          <br></br>
          <br></br>
            <br></br>
          <br></br>
          <br></br>
          <br></br>
          
          

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

      {/* Terms & Regulations Modal */}
      {showPolicyModal && (
        <div className="policy-modal-overlay" onClick={() => setShowPolicyModal(false)}>
          <motion.div
            className="policy-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Terms & Regulations</h2>
              <button className="close-modal" onClick={() => setShowPolicyModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <h3>Borrowing & Damage Policy</h3>

              <h4>🔹 General Borrowing Rules</h4>
              <ul>
                <li>All borrowers must verify identity (student ID / institutional email).</li>
                <li>Item condition must be documented with timestamped photos before handover.</li>
                <li>Both lender and borrower must digitally confirm item condition.</li>
                <li>Return deadline must be clearly agreed inside the platform.</li>
                <li>A grace period (e.g., 4–6 hours) is allowed before late penalties apply.</li>
                <li>Security deposit may be required for high-value items.</li>
                <li>Deposit is held in escrow until item return confirmation.</li>
              </ul>

              <h4>🔹 Late Return Rules</h4>
              <ul>
                <li>1 day late → 5% item value fine + reputation deduction.</li>
                <li>2–3 days late → 10% fine + larger reputation deduction.</li>
                <li>4–7 days late → 20% fine + warning flag.</li>
                <li>More than 7 days → 30% fine + temporary borrowing restriction.</li>
                <li>More than 14 days → treated as non-return (100% item value fine, major reputation deduction, account suspension, blacklist).</li>
                <li>Repeated late returns (3 times in 60 days) → additional penalty.</li>
              </ul>

              <h4>🔹 Damage Classification Rules</h4>
              <ul>
                <li><strong>Minor Damage</strong>: Small scratches or cosmetic wear → Borrower pays repair cost (if applicable) + small reputation reduction.</li>
                <li><strong>Moderate Damage</strong>: Functional impact but repairable → Repair cost OR partial compensation (e.g., 40% value) + medium reputation deduction + violation warning.</li>
                <li><strong>Severe Damage</strong>: Item unusable or heavily damaged → 80–100% item value compensation + large reputation deduction + temporary account freeze.</li>
              </ul>

              <h4>🔹 Repeated Violation Rules</h4>
              <ul>
                <li>3 minor damages → auto-upgraded to moderate penalty.</li>
                <li>2 moderate damages → borrowing restricted.</li>
                <li>1 severe damage → probation period.</li>
                <li>Reputation below threshold → automatic borrowing restriction.</li>
              </ul>

              <h4>🔹 Reputation System Rules</h4>
              <ul>
                <li>On-time return → small reputation increase.</li>
                <li>5 consecutive successful returns → bonus increase.</li>
                <li>Monthly recovery cap to prevent abuse.</li>
                <li>False claims (from lender or borrower) → heavy penalty.</li>
              </ul>

              <h4>📌 Complaint System (Admin Escalation)</h4>
              <p>Users can complain to admin if:</p>
              <ul>
                <li>Damage claim is disputed.</li>
                <li>Borrower denies responsibility.</li>
                <li>Lender exaggerates damage.</li>
                <li>Deposit is unfairly withheld.</li>
                <li>Item was misrepresented initially.</li>
                <li>Late penalty is incorrectly applied.</li>
              </ul>
              <p>Complaints must include before/after photos, item agreement, timeline, chat screenshots, repair invoice (if applicable), and be filed within 48 hours (damage) or 72 hours (late penalty).</p>

              <h4>📌 What Happens If Borrower Denies Damage?</h4>
              <ol>
                <li><strong>Evidence Review</strong>: Admin compares pre-borrow photos, return photos, timestamps, chat logs, usage duration.</li>
                <li><strong>Burden of Proof</strong>:
                  <ul>
                    <li>Lender cannot prove difference → case dismissed.</li>
                    <li>Clear evidence → borrower responsible.</li>
                    <li>Unclear evidence → partial split (e.g. 50/50).</li>
                  </ul>
                </li>
                <li><strong>Investigation Hold</strong>: Deposit frozen, borrowing paused.</li>
                <li><strong>Final Outcomes</strong>:
                  <ul>
                    <li>Borrower responsible → fine from deposit + reputation hit + violation recorded.</li>
                    <li>Borrower not responsible → full deposit refund + lender warning (if exaggerated).</li>
                    <li>Refusal to pay → account frozen, borrowing disabled, policy violation badge.</li>
                  </ul>
                </li>
              </ol>

              <h4>📌 Anti-Abuse Rules</h4>
              <ul>
                <li>False damage accusation = heavy reputation penalty.</li>
                <li>Repeated false complaints = suspension.</li>
                <li>Collusion between users = permanent ban.</li>
              </ul>
              <p><strong>Fairness applies equally to both sides.</strong></p>

              <h4>📌 Optional Advanced Protection</h4>
              <ul>
                <li>Mandatory return confirmation by both sides.</li>
                <li>AI-based image comparison for damage detection.</li>
                <li>Community arbitration panel (3 neutral high-reputation users vote).</li>
                <li>Escrow system for all high-value items.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
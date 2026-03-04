// src/components/dashboards/AddDevice.js
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlusCircle, 
  Type, 
  Cpu, 
  CheckCircle2, 
  Image as ImageIcon,
  DollarSign,
  Gift,
  AlertCircle
} from 'lucide-react';

import './AddDevice.css';

export default function AddDevice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Laptop',
    description: '',
    imageUrl: '',
    condition: 'Excellent',
    isFree: true,          // default: free
    dailyPrice: 0,         // only used if not free
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isFree') {
      setFormData(prev => ({
        ...prev,
        isFree: checked,
        dailyPrice: checked ? 0 : prev.dailyPrice
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.isFree && (!formData.dailyPrice || formData.dailyPrice <= 0)) {
      alert("Please enter a valid daily rental price when the device is not free.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call (replace with real backend POST later)
    setTimeout(() => {
      console.log("Device submitted:", formData);
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate('/owner/dashboard');
  };

  return (
    <div className="add-device-page">
      {/* Background layers */}
      <div className="bg-image-layer"></div>
      <div className="bg-overlay-gradient"></div>
      <div className="bg-grid-lines"></div>

      <div className="add-device-container">
        <motion.button 
          className="back-btn"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </motion.button>

        <motion.div 
          className="form-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-header">
            <PlusCircle size={32} className="header-icon" />
            <h1>List a New Device</h1>
            <p>Share your gear with the campus community</p>
          </div>

          <form onSubmit={handleSubmit} className="device-form">
            {/* Device Name */}
            <div className="input-group">
              <label><Type size={16} /> Device Name *</label>
              <input 
                type="text" 
                name="name"
                placeholder="e.g. Sony A7IV Camera"
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Category & Condition */}
            <div className="form-row">
              <div className="input-group">
                <label><Cpu size={16} /> Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option>Laptop</option>
                  <option>Camera</option>
                  <option>Drone</option>
                  <option>Audio</option>
                  <option>Lighting</option>
                  <option>Tablet</option>
                  <option>VR Gear</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="input-group">
                <label><CheckCircle2 size={16} /> Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} required>
                  <option>Brand New</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Needs Repair</option>
                </select>
              </div>
            </div>

            {/* Rental Type: Free or Paid */}
            <div className="input-group rental-type-group">
              <label>Rental Type</label>
              <div className="rental-options">
                <label className="rental-option">
                  <input
                    type="radio"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    value={true}
                  />
                  <span className="option-label">
                    <Gift size={16} /> Free to Borrow
                  </span>
                </label>

                <label className="rental-option">
                  <input
                    type="radio"
                    name="isFree"
                    checked={!formData.isFree}
                    onChange={handleChange}
                    value={false}
                  />
                  <span className="option-label">
                    <DollarSign size={16} /> Rental Fee
                  </span>
                </label>
              </div>
            </div>

            {/* Daily Price (only shown if not free) */}
            {!formData.isFree && (
              <div className="input-group">
                <label><DollarSign size={16} /> Daily Rental Fee (৳) *</label>
                <input 
                  type="number"
                  name="dailyPrice"
                  placeholder="e.g. 850"
                  min="1"
                  step="1"
                  required
                  value={formData.dailyPrice}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Image URL */}
            <div className="input-group">
              <label><ImageIcon size={16} /> Device Image URL</label>
              <input 
                type="url" 
                name="imageUrl"
                placeholder="https://images.unsplash.com/..." 
                value={formData.imageUrl}
                onChange={handleChange}
              />
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="input-group">
              <label>Description</label>
              <textarea 
                name="description"
                rows="5" 
                placeholder="Describe your device, any accessories included, borrowing rules, care instructions..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Submit */}
            <motion.button 
              type="submit" 
              className="submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Listing Device...</>
              ) : (
                <>Confirm & List Device</>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal-overlay" onClick={handleCloseSuccess}>
          <motion.div 
            className="success-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <CheckCircle2 size={64} className="success-icon" />
            <h2>Device Listed Successfully!</h2>
            <p>Your device is now available for the community to borrow.</p>
            <button className="success-close-btn" onClick={handleCloseSuccess}>
              Return to Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

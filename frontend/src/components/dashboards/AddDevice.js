import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlusCircle, 
  Camera, 
  Laptop, 
  Cpu, 
  Type, 
  Image as ImageIcon,
  CheckCircle2
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
    condition: 'Excellent'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert("Device added successfully!");
      setIsSubmitting(false);
      navigate('/owner-dashboard'); // Navigate back to dashboard after success
    }, 1500);
  };

  return (
    <div className="add-device-page">
      {/* Background layers - matching your dashboard */}
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
            <p>Make your gear available to the community</p>
          </div>

          <form onSubmit={handleSubmit} className="device-form">
            <div className="input-group">
              <label><Type size={16} /> Device Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="e.g. Sony A7IV Camera"
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label><Cpu size={16} /> Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option>Laptop</option>
                  <option>Camera</option>
                  <option>Drone</option>
                  <option>Audio</option>
                  <option>Lighting</option>
                  <option>VR Gear</option>
                </select>
              </div>

              <div className="input-group">
                <label><CheckCircle2 size={16} /> Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  <option>Brand New</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Well Used</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label><ImageIcon size={16} /> Image URL</label>
              <input 
                type="url" 
                name="imageUrl"
                placeholder="https://images.unsplash.com/..." 
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea 
                name="description"
                rows="4" 
                placeholder="Describe your device, specific rules, or accessories included..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <motion.button 
              type="submit" 
              className="submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Listing Device..." : "Confirm & List Device"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
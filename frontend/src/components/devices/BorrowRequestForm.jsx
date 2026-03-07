// src/components/devices/BorrowRequestForm.jsx
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useState } from 'react';

export default function BorrowRequestForm({ device, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    startDate: '',
    returnDate: '',
    collectionPlace: '',
    purpose: ''
  });

  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.returnDate || !formData.collectionPlace.trim()) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (formData.returnDate < formData.startDate) {
      setFormError("Return date cannot be before start date.");
      return;
    }

    onSubmit({
      deviceId: device.id,
      deviceName: device.name,
      startDate: formData.startDate,
      returnDate: formData.returnDate,
      collectionPlace: formData.collectionPlace.trim(),
      purpose: formData.purpose.trim() || "Not specified"
    });

    onClose();
  };

  return (
    <motion.div
      className="borrow-modal-content"
      initial={{ scale: 0.85, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 30 }}
      transition={{ duration: 0.3 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>Request to Borrow: <span className="device-name-highlight">{device.name}</span></h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
      </div>

      {formError && (
        <motion.div 
          className="form-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {formError}
        </motion.div>
      )}

      {/* Scrollable container */}
      <div className="form-scroll-container">
        <form onSubmit={handleSubmit} className="borrow-form">
          <div className="form-group">
            <label>Starting Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Return Date *</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Place to Collect *</label>
            <input
              type="text"
              name="collectionPlace"
              placeholder="IUT Main Gate, Library, 5 pillars , tree park"
              value={formData.collectionPlace}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Why are you borrowing it? (optional)</label>
            <textarea
              name="purpose"
              rows={5}
              placeholder="e.g. For semester project presentation, photography assignment, personal video editing..."
              value={formData.purpose}
              onChange={handleChange}
            />
          </div>

          <motion.button
            type="submit"
            className="submit-request-btn"
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Send size={18} /> Send Request
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
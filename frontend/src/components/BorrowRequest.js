import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Modal from './ui/Modal';
import './BorrowRequest.css';

const BorrowRequest = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    duration: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    itemName: '',
    duration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      // Reset form
      setFormData({
        itemName: '',
        duration: '',
        message: ''
      });
    }, 2000);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="borrow-request-container">
      <div className="borrow-request-card">
        <h2 className="borrow-request-title">Request to Borrow</h2>
        <p className="borrow-request-subtitle">Fill out the form to request an item</p>

        <form className="borrow-request-form" onSubmit={handleSubmit}>
          <Input
            label="Item Name"
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            placeholder="Enter item name"
            error={errors.itemName}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Borrow Duration (days)"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Enter number of days"
            error={errors.duration}
            required
            disabled={isSubmitting}
          />

          <div className="borrow-request-textarea-group">
            <label className="borrow-request-label" htmlFor="message">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Add any additional notes..."
              className="borrow-request-textarea"
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div className="borrow-request-actions">
            {isSubmitting ? (
              <div className="borrow-request-loader-wrapper">
                <Loader size="medium" />
                <span className="borrow-request-loading-text">Submitting request...</span>
              </div>
            ) : (
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
            )}
          </div>
        </form>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        title="Request Submitted!"
        footer={
          <Button onClick={closeSuccessModal} variant="primary">
            Close
          </Button>
        }
      >
        <p className="borrow-request-success-message">
          Your borrow request has been submitted successfully. You will be notified once it's approved.
        </p>
      </Modal>
    </div>
  );
};

export default BorrowRequest;

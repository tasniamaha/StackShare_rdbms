// src/components/auth/Register.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setAuth } from '../utils/authStorage'; // your helper
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    student_id: '',
    student_name: '',
    student_email: '',
    student_dept: '',
    password: '',
    role: 'student',         // 'student' or 'admin'
    subRole: 'borrower',     // only used if role === 'student': 'lender' or 'borrower'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill role/subRole if coming from "Become a Lender" button
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const intent = urlParams.get('intent');
    if (intent === 'lender') {
      setForm(prev => ({ ...prev, role: 'student', subRole: 'lender' }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!form.student_email.trim() || !form.password.trim() || !form.student_id.trim()) {
        throw new Error('Please fill all required fields');
      }

      if (form.role === 'student' && !form.subRole) {
        throw new Error('Please select whether you want to be a Lender or Borrower');
      }

      // Simulate API registration (replace with real fetch/axios later)
      await new Promise(resolve => setTimeout(resolve, 1400));

      console.log('Fake registration with:', form);

      // Prepare final user object
      const finalRole = form.role === 'admin' ? 'admin' : form.subRole;

      const newUser = {
        student_id: form.student_id.trim(),
        student_name: form.student_name.trim(),
        student_email: form.student_email.trim(),
        student_dept: form.student_dept.trim(),
        role: form.role,           // "student" or "admin"
        subRole: form.role === 'student' ? form.subRole : null, // "lender" / "borrower" or null
        finalRole,                 // computed: "admin", "lender", or "borrower"
      };

      // Save auth data (auto-login after registration)
      setAuth('fake-jwt-token-demo', newUser);

      // Redirect based on final role
      if (finalRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (finalRole === 'lender') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <h1>Join StackShare</h1>
          <p>Create your account in seconds</p>
        </div>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Student ID <span className="required">*</span></label>
            <input
              type="text"
              name="student_id"
              placeholder="2021-1-60-001"
              value={form.student_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="student_name"
              placeholder="Your name"
              value={form.student_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="student_email"
              placeholder="your.name@university.edu"
              value={form.student_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="student_dept"
              placeholder="CSE / EEE / BTM /CEE / MPE /TVE"
              value={form.student_dept}
              onChange={handleChange}
            />
          </div>

          {/* Main Role Selection */}
          <div className="form-group">
            <label>I want to join as <span className="required">*</span></label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <p className="role-hint">
              {form.role === 'admin'
                ? 'You will manage the platform, complaints, approvals, etc.'
                : 'You can borrow or lend devices within the community.'}
            </p>
          </div>

          {/* Sub-role (only shown if role === 'student') */}
          {form.role === 'student' && (
            <div className="form-group sub-role-group">
              <label>As a student, I want to be a <span className="required">*</span></label>
              <select
                name="subRole"
                value={form.subRole}
                onChange={handleChange}
                required
              >
                <option value="borrower">Borrower</option>
                <option value="lender">Lender</option>
              </select>
              <p className="role-hint">
                {form.subRole === 'lender'
                  ? 'You can list your devices for others to borrow.'
                  : 'You can browse and request devices from the community.'}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="auth-link">Sign in</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

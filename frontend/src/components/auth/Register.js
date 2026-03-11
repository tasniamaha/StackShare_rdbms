// src/components/auth/Register.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setAuth } from '../utils/authStorage';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    student_id: '',
    student_name: '',
    student_email: '',
    student_dept: '',
    password: '',
    role: 'student',   // 'student' or 'admin'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStudentId = (id) => {
    return id.trim().length >= 4 && id.trim().startsWith('2100');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.student_email.trim() || !form.password.trim() || !form.student_id.trim()) {
        throw new Error('Please fill all required fields');
      }

      if (form.role === 'student' && !validateStudentId(form.student_id)) {
        throw new Error('Invalid Student ID. Student IDs must start with 2100 (e.g., 21001234)');
      }

      await new Promise(resolve => setTimeout(resolve, 1400));

      const newUser = {
        student_id: form.student_id.trim(),
        student_name: form.student_name.trim() || null,
        student_email: form.student_email.trim(),
        student_dept: form.student_dept.trim() || null,
        role: form.role,   // 'student' or 'admin'
      };

      setAuth('fake-jwt-token-demo', newUser);

      if (form.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
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
          {/* Student ID */}
          <div className="form-group">
            <label>
              {form.role === 'student' ? 'Student ID (2100xxxx)' : 'ID / Admin Code'}{' '}
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="student_id"
              placeholder={form.role === 'student' ? 'e.g. 21001234' : 'Any format for admin'}
              value={form.student_id}
              onChange={handleChange}
              required
            />
            {form.role === 'student' && form.student_id && !validateStudentId(form.student_id) && (
              <small className="input-hint error">
                Student ID must start with 2100 (e.g., 21001234)
              </small>
            )}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="student_name"
              placeholder="Your full name"
              value={form.student_name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="student_email"
              placeholder="yourname@iut-dhaka.edu"
              value={form.student_email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="student_dept"
              placeholder="CSE / EEE / BTM / CEE / MPE / TVE"
              value={form.student_dept}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection */}
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
                ? 'Admins manage the platform, complaints, approvals, etc.'
                : 'Students can both borrow and lend devices within the community.'}
            </p>
          </div>

          {/* Password */}
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

          {/* Submit */}
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
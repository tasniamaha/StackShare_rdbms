// src/components/auth/Register.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { saveAuth } from '../utils/authStorage';

import './Register.css';   // ← create this file next to Register.js

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    student_id: '',
    student_name: '',
    student_email: '',
    student_dept: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.student_id.trim()) return 'Student ID is required';
    if (!form.student_name.trim()) return 'Full name is required';
    if (!form.student_email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.student_email)) return 'Please enter a valid email';
    if (!form.student_dept.trim()) return 'Department is required';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 characters';
    return null;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // 1. Register
      await apiClient.post('/auth/register', form);

      // 2. Auto-login right after
      const loginRes = await apiClient.post('/auth/login', {
        student_email: form.student_email,
        password: form.password,
      });

      const { token, user } = loginRes.data;

      if (!token || !user) {
        throw new Error('Login failed after registration');
      }

      // 3. Save auth data
      saveAuth(token, user);

      // 4. Redirect (you can adjust paths later)
      // Currently your backend does not send role → using fallback
      navigate('/dashboard');

      // If you add role later in the login response:
      // if (user.role === 'owner' || user.role === 'admin') {
      //   navigate('/owner/dashboard');
      // } else {
      //   navigate('/borrower/dashboard');
      // }
    } catch (err) {
      const msg = err.response?.data?.message || '';

      if (msg.includes('already registered')) {
        setError('This email or student ID is already in use.');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our device borrowing system</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-field">
            <label htmlFor="student_id">Student ID</label>
            <input
              id="student_id"
              type="text"
              name="student_id"
              placeholder="e.g. 2021-1-60-001"
              value={form.student_id}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="student_name">Full Name</label>
            <input
              id="student_name"
              type="text"
              name="student_name"
              placeholder="Your full name"
              value={form.student_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="student_email">Student Email</label>
            <input
              id="student_email"
              type="email"
              name="student_email"
              placeholder="your.name@university.edu"
              value={form.student_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="student_dept">Department</label>
            <input
              id="student_dept"
              type="text"
              name="student_dept"
              placeholder="e.g. CSE, EEE, BBA"
              value={form.student_dept}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-register"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">Creating account...</span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="form-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" className="link-login">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

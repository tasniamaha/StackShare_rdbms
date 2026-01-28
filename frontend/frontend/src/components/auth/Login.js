// src/components/auth/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { saveAuth } from '../utils/authStorage';

import './Login.css'; // ← create this file next to Login.js

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    student_email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.student_email.trim() || !form.password.trim()) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', {
        student_email: form.student_email,
        password: form.password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      saveAuth(token, user);

      // Adjust redirect according to your app structure
      // Most likely all users go to the same dashboard in your current backend
      navigate('/dashboard');

      // If you later add role-based routing:
      // if (user.role === 'admin' || user.role === 'owner') {
      //   navigate('/admin/dashboard');
      // } else {
      //   navigate('/dashboard');
      // }
    } catch (err) {
      const msg = err.response?.data?.message || '';

      if (msg.includes('suspended')) {
        setError('Your account is suspended. Please contact support.');
      } else if (msg.includes('Invalid credentials')) {
        setError('Incorrect email or password');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Could not connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Sign In</h1>
          <p>Welcome back to the device borrowing system</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label htmlFor="student_email">Student Email</label>
            <input
              id="student_email"
              type="email"
              name="student_email"
              placeholder="your.name@university.edu"
              value={form.student_email}
              onChange={handleChange}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">Signing in...</span>
            ) : (
              'Login'
            )}
          </button>

          <div className="form-footer">
            <p>
              Don't have an account?{' '}
              <a href="/register" className="link-register">
                Create account
              </a>
            </p>
            {/* Uncomment when you implement forgot password */}
            {/* <a href="/forgot-password" className="link-forgot">Forgot password?</a> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

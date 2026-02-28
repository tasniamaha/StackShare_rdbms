// src/components/auth/Login.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clearAuth, getAuthUser, setAuth } from '../utils/authStorage';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ student_email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const user = getAuthUser();
    if (user && user.role) {
      redirectBasedOnRole(user.role);
    }
  }, []);

  // Centralized redirect logic
  const redirectBasedOnRole = useCallback(
    (role) => {
      const urlParams = new URLSearchParams(location.search);
      const intent = urlParams.get('intent');

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'owner' || intent === 'lender') {
        navigate('/owner/dashboard', { replace: true }); // ← now correctly triggered
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
    [navigate, location.search]
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    clearAuth();

    setTimeout(() => {
      if (!form.student_email.trim() || !form.password.trim()) {
        setError('Please fill in both fields');
        setLoading(false);
        return;
      }

      console.log('Login attempt with:', form.student_email.trim());

      // Detect lender intent from URL
      const urlParams = new URLSearchParams(location.search);
      const intent = urlParams.get('intent');

      // Simulate login with role based on intent (for testing)
      const fakeUser = {
        student_email: form.student_email.trim(),
        student_name: 'Demo User',
        role: intent === 'lender' ? 'owner' : 'student', // ← key fix
      };

      setAuth('fake-jwt-token-demo', fakeUser);

      setLoading(false);

      // Redirect based on role + intent
      redirectBasedOnRole(fakeUser.role);
    }, 1200);
  };

  return (
    <div className="auth-page login-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to StackShare</p>
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

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="student_email"
              placeholder="your.name@university.edu"
              value={form.student_email}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="auth-link">Create one</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
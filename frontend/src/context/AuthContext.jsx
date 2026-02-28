// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Optional: import your API functions if you have real login/logout endpoints
// import * as authApi from '../components/auth/auth.api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('stackshare_token');
        const storedUserJson = localStorage.getItem('stackshare_user');

        if (!storedToken || !storedUserJson) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUserJson);

        // Basic validation
        if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.student_email) {
          console.warn('Invalid stored user data — clearing');
          clearAuth();
          setLoading(false);
          return;
        }

        setUser(parsedUser);
setLoading(false);

      } catch (err) {
        console.error('Failed to load auth from localStorage:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, [navigate]);

  // Redirect logic based on role + login intent (?intent=lender)
 const location = useLocation();

const redirectBasedOnRole = useCallback(
  (role) => {
    const urlParams = new URLSearchParams(location.search);
    const intent = urlParams.get('intent');

    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'owner' || intent === 'lender') {
      navigate('/owner/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  },
  [navigate, location.search]
);

  // Login function (called from Login component)
  const login = useCallback(
    (userData, token) => {
      try {
        localStorage.setItem('stackshare_token', token);
        localStorage.setItem('stackshare_user', JSON.stringify(userData));
        setUser(userData);

        // Optional: real API logout call if needed
        // await authApi.login({ email, password }); // if you have backend auth

       navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Failed to save auth data:', err);
      }
    },
    [redirectBasedOnRole]
  );

  // Logout function
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('stackshare_token');
      localStorage.removeItem('stackshare_user');
      setUser(null);

      // Optional: call backend logout endpoint
      // await authApi.logout();

      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [navigate]);

  // Clear auth (used on error or invalid data)
  const clearAuth = useCallback(() => {
    localStorage.removeItem('stackshare_token');
    localStorage.removeItem('stackshare_user');
    setUser(null);
  }, []);

  // Value provided to all consumers
  const value = {
    user,
    loading,
    login,
    logout,
    clearAuth,
    isAuthenticated: !!user,
  };

  // Show nothing or a loading screen while checking auth
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
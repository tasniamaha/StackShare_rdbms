// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages & Components
import LandingPage from './components/pages/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BorrowerDashboard from './components/dashboards/BorrowerDashboard';
import OwnerDashboard from './components/dashboards/OwnerDashboard';

// Utils
import { getAuthUser } from './components/utils/authStorage';

// Global styles
import './components/styles/main.css';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getAuthUser();

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have them → redirect to correct dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'owner' ? '/owner/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes – no authentication needed */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Borrower Dashboard – accessible to all logged-in users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <BorrowerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Owner Dashboard – only for users with role 'owner' */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route – redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

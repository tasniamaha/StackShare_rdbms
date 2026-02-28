// src/AppRoutes.js
import { Routes, Route } from 'react-router-dom';

// ────────────────────────────────────────────────
// Pages & Components
// ────────────────────────────────────────────────
import LandingPage from './components/pages/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Recommendations from './components/dashboards/Recommendations';

// Dashboards
import BorrowerDashboard from './components/dashboards/BorrowerDashboard';
import OwnerDashboard from './components/dashboards/OwnerDashboard';

// Devices
import DeviceList from './components/devices/DeviceList';
import DeviceDetails from './components/devices/DeviceDetails';

// Notifications
import Notifications from './components/notifications/Notifications';

// Borrow History
import BorrowHistory from './components/borrow/BorrowHistory';

// ────────────────────────────────────────────────
// Protected Route Wrapper (placeholder for future)
// ────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  return children;
};

// ────────────────────────────────────────────────
// Main Routes
// ────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards */}
      <Route path="/dashboard" element={<BorrowerDashboard />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />

      {/* Devices */}
      <Route path="/browse" element={<DeviceList />} />
      <Route path="/devices/:id" element={<DeviceDetails />} />

      {/* Borrow History */}
      <Route path="/history" element={<BorrowHistory />} />
      <Route path="/my-borrows" element={<BorrowHistory />} />

      {/* Notifications */}
      <Route path="/notifications" element={<Notifications />} />

      {/* Recommendations ⭐ (Active Route) */}
      <Route path="/recommendations" element={<Recommendations />} />

      {/* Future Protected Routes (Optional) */}
      {/*
      <Route path="/recommendations" element={
        <ProtectedRoute>
          <Recommendations />
        </ProtectedRoute>
      } />
      */}

      {/* 404 Page */}
      <Route path="*" element={<div>Page Not Found</div>} />

    </Routes>
  );
};

export default AppRoutes;
// src/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";   // ✅ FIXED PATH

// ────────────────────────────────────────────────
// Pages & Components
// ────────────────────────────────────────────────
import LandingPage from "./components/pages/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Dashboards
import BorrowerDashboard from "./components/dashboards/BorrowerDashboard";
import OwnerDashboard from "./components/dashboards/OwnerDashboard";
import AddDevice from "./components/dashboards/AddDevice";

// Devices
import DeviceList from "./components/devices/DeviceList";
import DeviceDetails from "./components/devices/DeviceDetails";

// Notifications
import Notifications from "./components/notifications/Notifications";

// Borrow History
import BorrowHistory from "./components/borrow/BorrowHistory";

// Recommendations
import Recommendations from "./components/dashboards/Recommendations";

// ────────────────────────────────────────────────
// Protected Route Component
// ────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const redirectPath =
      user?.role === "owner" || user?.role === "admin"
        ? "/owner/dashboard"
        : "/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <BorrowerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Owner Actions */}
      <Route
        path="/owner/add-device"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AddDevice />
          </ProtectedRoute>
        }
      />

      {/* Devices */}
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <DeviceList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/devices/:id"
        element={
          <ProtectedRoute>
            <DeviceDetails />
          </ProtectedRoute>
        }
      />

      {/* History */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <BorrowHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-borrows"
        element={
          <ProtectedRoute>
            <BorrowHistory />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Recommendations */}
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;
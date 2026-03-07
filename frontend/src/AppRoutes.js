import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./components/pages/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Dashboards
import BorrowerDashboard from "./components/dashboards/BorrowerDashboard";
import OwnerDashboard from "./components/dashboards/OwnerDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import AddDevice from "./components/dashboards/AddDevice";

// Devices
import DeviceList from "./components/devices/DeviceList";
import DeviceDetails from "./components/devices/DeviceDetails";

// Others
import Notifications from "./components/notifications/Notifications";
import BorrowHistory from "./components/borrow/BorrowHistory";
import Recommendations from "./components/dashboards/Recommendations";

/* =========================================================
   Protected Route
   ========================================================= */

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (
    allowedRoles.length > 0 &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* =========================================================
   Role-Based Dashboard Router
   ========================================================= */

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "owner":
      return <OwnerDashboard />;
    case "borrower":
    default:
      return <BorrowerDashboard />;
  }
};

/* =========================================================
   Routes
   ========================================================= */

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= SMART DASHBOARD ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= EXPLICIT DASHBOARDS ================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
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

      {/* ================= OWNER ACTIONS ================= */}

      <Route
        path="/owner/add-device"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AddDevice />
          </ProtectedRoute>
        }
      />

      {/* ================= DEVICES ================= */}

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

      {/* ================= HISTORY ================= */}

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

      {/* ================= SYSTEM ================= */}

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      {/* ================= 404 ================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
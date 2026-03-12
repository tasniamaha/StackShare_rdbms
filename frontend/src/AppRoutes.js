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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
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

      {/* ================= STUDENT DASHBOARDS ================= */}

      {/* Default dashboard — shows borrow view */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <BorrowerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Owner/lend view — also accessible to all students */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN DASHBOARD ================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= OWNER ACTIONS ================= */}

      <Route
        path="/owner/add-device"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <AddDevice />
          </ProtectedRoute>
        }
      />

      {/* Owner aliases — map to existing pages until dedicated pages are built */}
      <Route path="/my-devices" element={<ProtectedRoute><DeviceList /></ProtectedRoute>} />
      <Route path="/lend-history" element={<ProtectedRoute><BorrowHistory /></ProtectedRoute>} />
      <Route path="/active-lends" element={<ProtectedRoute><BorrowHistory /></ProtectedRoute>} />

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
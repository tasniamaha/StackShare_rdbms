// src/context/AuthContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     Helper: Redirect Based On Role
  ====================================================== */

  // intent: "lender" → owner dashboard, anything else → default by role
  const redirectByRole = (userData, intent) => {
    if (!userData?.role) return;

    if (userData.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // Students: go to owner dashboard if they came from "Lend a Device"
    if (intent === "lender") {
      navigate("/owner/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  /* =====================================================
     Load Stored Authentication On App Start
  ====================================================== */

  useEffect(() => {
    try {
      const token = localStorage.getItem("stackshare_token");
      const storedUser = localStorage.getItem("stackshare_user");

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.role) {
        clearAuth();
        return;
      }

      setUser(parsedUser);

      // Only redirect if user landed on / or /login (not if already on a dashboard)
      const currentPath = window.location.pathname;
      const publicPaths = ["/", "/login", "/register"];
      if (publicPaths.includes(currentPath)) {
        redirectByRole(parsedUser);
      }

    } catch (err) {
      console.error("Auth load error:", err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     Login Function
  ====================================================== */

  const login = useCallback((userData, token, intent) => {
    try {
      localStorage.setItem("stackshare_token", token);
      localStorage.setItem("stackshare_user", JSON.stringify(userData));

      setUser(userData);

      redirectByRole(userData, intent);

    } catch (err) {
      console.error("Login storage error:", err);
    }
  }, []);

  /* =====================================================
     Logout Function
  ====================================================== */

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("stackshare_token");
      localStorage.removeItem("stackshare_user");

      setUser(null);

      navigate("/", { replace: true });

    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  /* =====================================================
     Clear Auth Helper
  ====================================================== */

  const clearAuth = useCallback(() => {
    localStorage.removeItem("stackshare_token");
    localStorage.removeItem("stackshare_user");
    setUser(null);
    navigate("/", { replace: true });
  }, []);

  /* =====================================================
     Role Helpers
  ====================================================== */

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  // Derived reputation helpers (populated from real API data when wired up)
  const reputation = user?.reputation_score ?? null;
  const hasLowReputation = reputation !== null && reputation < 50;
  const isRestricted = user?.is_restricted ?? false;
  const hasViolations = user?.has_violations ?? false;

  /* =====================================================
     Context Value
  ====================================================== */

  const value = {
    user,
    loading,
    login,
    logout,
    clearAuth,

    isAuthenticated,
    isAdmin,
    isStudent,

    // Keep these for dashboard compatibility
    isOwner: isStudent,
    isBorrower: isStudent,

    setDashboardContext: useCallback(() => {}, []),
    dashboardContext: "both",

    reputation,
    hasLowReputation,
    isRestricted,
    hasViolations,
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
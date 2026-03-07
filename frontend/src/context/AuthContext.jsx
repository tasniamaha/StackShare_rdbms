// src/context/AuthContext.jsx
import { Loader2 } from "lucide-react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

/* =========================================================
   Helper: Normalize Role
   Student + subRole → real role mapping
========================================================= */

const normalizeRole = (user) => {
  if (!user) return user;

  return {
    ...user,
    role:
      user.role === "student" && user.subRole === "lender"
        ? "owner"
        : user.role === "student" && user.subRole === "borrower"
        ? "borrower"
        : user.role,
  };
};

/* =========================================================
   Auth Provider
========================================================= */

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     Load stored auth on app start
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

      if (!parsedUser || typeof parsedUser !== "object") {
        clearAuth();
        return;
      }

      const enrichedUser = normalizeRole({
        ...parsedUser,
        reputation: parsedUser.reputation ?? 80,
        violationCount: parsedUser.violationCount ?? 0,
      });

      setUser(enrichedUser);
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

  const login = useCallback((userData, token) => {
    try {
      const enrichedUser = normalizeRole({
        ...userData,
        reputation: userData.reputation ?? 80,
        violationCount: userData.violationCount ?? 0,
      });

      localStorage.setItem("stackshare_token", token);
      localStorage.setItem("stackshare_user", JSON.stringify(enrichedUser));

      setUser(enrichedUser);

      return enrichedUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  }, []);

  /* =====================================================
     Logout
  ====================================================== */

  const logout = useCallback(() => {
    localStorage.removeItem("stackshare_token");
    localStorage.removeItem("stackshare_user");
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  /* =====================================================
     Clear Auth
  ====================================================== */

  const clearAuth = useCallback(() => {
    localStorage.removeItem("stackshare_token");
    localStorage.removeItem("stackshare_user");
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  /* =====================================================
     Helpers
  ====================================================== */

  const value = {
    user,
    loading,
    login,
    logout,
    clearAuth,

    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isOwner: user?.role === "owner",
    isBorrower: user?.role === "borrower",

    hasLowReputation: user?.reputation < 30,
    isRestricted: user?.reputation < 20,
    hasViolations: user?.violationCount > 0,

    reputation: user?.reputation ?? 80,
    violationCount: user?.violationCount ?? 0,
  };

  /* =====================================================
     Loading UI
  ====================================================== */

  if (loading) {
    return (
      <div className="auth-loading">
        <Loader2 className="spin" size={48} />
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
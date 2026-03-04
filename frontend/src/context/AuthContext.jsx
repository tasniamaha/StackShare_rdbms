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

  const redirectByRole = (userData) => {
    if (!userData?.role) return;

    switch (userData.role) {
      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      case "owner":
        navigate("/owner/dashboard", { replace: true });
        break;
      case "borrower":
      default:
        navigate("/dashboard", { replace: true });
        break;
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
      redirectByRole(parsedUser);

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
      localStorage.setItem("stackshare_token", token);
      localStorage.setItem("stackshare_user", JSON.stringify(userData));

      setUser(userData);

      redirectByRole(userData);

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
  const isOwner = user?.role === "owner";
  const isBorrower = user?.role === "borrower";

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
    isOwner,
    isBorrower
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

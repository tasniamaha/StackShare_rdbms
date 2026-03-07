// src/components/auth/Login.js
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    student_email: "",
    password: "",
    role: "",
    subRole: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill from URL intent (?intent=lender or ?intent=borrower)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const intent = urlParams.get("intent");

    if (intent === "lender") {
      setForm({
        student_email: "",
        password: "",
        role: "student",
        subRole: "lender"
      });
    } else if (intent === "borrower") {
      setForm({
        student_email: "",
        password: "",
        role: "student",
        subRole: "borrower"
      });
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!form.student_email.trim() || !form.password.trim()) {
        throw new Error("Email and password are required");
      }

      if (!form.role) {
        throw new Error("Please select your role");
      }

      if (form.role === "student" && !form.subRole) {
        throw new Error("Please select Borrower or Lender");
      }

      // Fake login delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // ── Determine dashboard path ──
      let dashboardPath = "/dashboard";

      if (form.role === "admin") {
        dashboardPath = "/admin/dashboard";
      } else if (form.role === "student") {
        if (form.subRole === "lender") {
          dashboardPath = "/owner/dashboard";
        } else if (form.subRole === "borrower") {
          dashboardPath = "/dashboard";
        }
      }

      // Debug logs — very important for diagnosing!
      console.log("LOGIN DEBUG:");
      console.log("  role:", form.role);
      console.log("  subRole:", form.subRole || "(none)");
      console.log("  calculated path:", dashboardPath);

      // Fake user & token
      const fakeUser = {
        student_email: form.student_email.trim(),
        student_name: "Demo User",
        role: form.role,
        subRole: form.subRole || null,
      };

      const fakeToken = "fake-jwt-" + Date.now();

      // Update auth context
      login(fakeUser, fakeToken);

      // Small delay to allow context update (helps in React 18 strict mode)
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Redirect
      navigate(dashboardPath, { replace: true });

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
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
          <p>Sign in to continue</p>
        </div>

        {error && (
          <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleLogin}
          className="auth-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Role */}
          <div className="form-group">
            <label>Role *</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Sub-role — only shown if role = student */}
          {form.role === "student" && (
            <motion.div
              className="form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <label>Student Type *</label>
              <select name="subRole" value={form.subRole} onChange={handleChange} required>
                <option value="">Select type</option>
                <option value="borrower">Borrower</option>
                <option value="lender">Lender</option>
              </select>
            </motion.div>
          )}

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="student_email"
              placeholder="yourname@iut-dhaka.edu"
              value={form.student_email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </motion.form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="auth-link">
              Register here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
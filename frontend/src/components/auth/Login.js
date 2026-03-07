// src/components/auth/Login.js
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    student_email: "",
    password: "",
    role: "",      // 'student' or 'admin'
    subRole: ""    // 'borrower' or 'lender'
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const intent = urlParams.get("intent");

    if (intent === "lender") {
      setForm(prev => ({
        ...prev,
        role: "student",
        subRole: "lender"
      }));
      setStep(3);
    }
  }, [location.search]);

  const handleRoleSelect = (role) => {
    setForm(prev => ({ ...prev, role }));
    setError("");

    if (role === "admin") {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleSubRoleSelect = (subRole) => {
    setForm(prev => ({ ...prev, subRole }));
    setStep(3);
    setError("");
  };

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.student_email.trim() || !form.password.trim()) {
        throw new Error("Please fill in both fields");
      }

      if (!form.role) {
        throw new Error("Please select your role");
      }

      if (form.role === "student" && !form.subRole) {
        throw new Error("Please select Borrower or Lender");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🔥 IMPORTANT FIX: Normalize final role
      let finalRole;

      if (form.role === "admin") {
        finalRole = "admin";
      } else if (form.subRole === "borrower") {
        finalRole = "borrower";
      } else if (form.subRole === "lender") {
        finalRole = "owner"; // or "lender" depending on your routing
      }

      const fakeUser = {
        student_email: form.student_email.trim(),
        student_name: "Demo User",
        role: finalRole
      };

      const fakeToken = "fake-jwt-token-" + Date.now();

      login(fakeUser, fakeToken);

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 3) {
      if (form.role === "student") setStep(2);
      else setStep(1);
    } else if (step === 2) {
      setStep(1);
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
          <motion.div
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {step === 1 && (
          <div className="role-selection">
            <h3>I am a...</h3>
            <div className="role-buttons">
              <motion.button
                className="role-btn"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleRoleSelect("student")}
              >
                Student
              </motion.button>

              <motion.button
                className="role-btn admin-role"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleRoleSelect("admin")}
              >
                Admin
              </motion.button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="sub-role-selection">
            <h3>As a student, I want to be a...</h3>
            <div className="role-buttons">
              <motion.button
                className="role-btn"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleSubRoleSelect("borrower")}
              >
                Borrower
              </motion.button>

              <motion.button
                className="role-btn"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleSubRoleSelect("lender")}
              >
                Lender
              </motion.button>
            </div>

            <button className="back-link" onClick={goBack}>
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <motion.form
            onSubmit={handleLogin}
            className="auth-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="student_email"
                value={form.student_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>

            <button type="button" className="back-link" onClick={goBack}>
              ← Back
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;

// src/components/auth/Login.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    student_email: "",
    password: "",
    role: "",   // 'student' or 'admin'
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setForm(prev => ({ ...prev, role }));
    setError("");
    setStep(2);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

      await new Promise(resolve => setTimeout(resolve, 1000));

      const fakeUser = {
        student_email: form.student_email.trim(),
        student_name: "Demo User",
        role: form.role,   // 'student' or 'admin'
      };

      const fakeToken = "fake-jwt-token-" + Date.now();
      login(fakeUser, fakeToken);

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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

            <button type="button" className="back-link" onClick={() => setStep(1)}>
              ← Back
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
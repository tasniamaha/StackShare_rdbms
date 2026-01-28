// src/components/auth/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { saveAuth } from "../utils/authStorage";

const Login = () => {
  const navigate = useNavigate();
  const [studentEmail, setStudentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", {
        student_email: studentEmail,
        password: password,
      });

      // Store token + user using authStorage
      saveAuth(res.data.token, res.data.user);

      // Redirect to dashboard based on role (borrower or owner)
      if (res.data.user.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/borrower/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Student Email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

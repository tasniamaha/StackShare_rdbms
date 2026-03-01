import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        <p className="auth-subtitle">
          <strong>StackShare</strong><br />
          IUT Social Hub
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="auth-input"
        />

        <input
          type="text"
          placeholder="Student ID"
          className="auth-input"
        />

        <input
          type="email"
          placeholder="IUT Email"
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
        />

        <button className="auth-btn">
          Create Account
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

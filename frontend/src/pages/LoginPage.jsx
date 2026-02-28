import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // TEMPORARY: frontend-only login
    // later you will connect backend here
    console.log("Login button clicked");

    // Example redirect after login
    // navigate("/"); 
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">
          <strong>StackShare</strong><br />
          IUT Social Hub
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            required
          />

          <div className="forgot">
            <span>Forgot password?</span>
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

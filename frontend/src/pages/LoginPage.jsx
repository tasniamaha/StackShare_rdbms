import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login clicked");
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <div className="auth-header">
        <div className="logo-circle">SS</div>
        <h1>StackShare</h1>
        <p>IUT Social Hub</p>
      </div>

      {/* Background balls */}
      <div className="ball purple"></div>
      <div className="ball blue"></div>
      <div className="ball pink"></div>

      {/* Login Card */}
      <div className="login-card">
        <h2>Sign In</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="icon">👤</span>
            <input type="email" placeholder="Email" required />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="forgot">Forgot password?</div>

          <button className="login-btn">Login</button>
        </form>

        <p className="switch-text">
          Don’t have an account?
          <span onClick={() => navigate("/register")}> Register</span>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted");
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo">SS</div>
        <h1>StackShare</h1>
        <p>IUT Social Hub</p>
      </div>

      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="IUT Email" required />
            <input type="password" placeholder="Password" required />

            <div className="forgot">Forgot Password?</div>

            <button type="submit" className="primary-btn">
              Sign In
            </button>

            <div className="divider">OR</div>

            <button type="button" className="outline-btn">
              Login with IUT Email
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" required />
            <input type="text" placeholder="Student ID (2023-XXX)" required />
            <input type="email" placeholder="IUT Email" required />
            <input type="password" placeholder="Password" required />

            <button type="submit" className="primary-btn">
              Create Account
            </button>

            <div className="divider">OR</div>

            <button type="button" className="outline-btn">
              Register with IUT Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;



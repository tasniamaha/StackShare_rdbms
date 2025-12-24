import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">SS</div>
          <h1>StackShare</h1>
          <p>IUT Social Hub</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="auth-form">
          {isLogin ? (
            <>
              <input type="email" placeholder="IUT Email" />
              <input type="password" placeholder="Password" />
              <p className="forgot">Forgot Password?</p>
              <button className="primary-btn">Sign In</button>
              <div className="or">OR</div>
              <button className="outline-btn">
                Login with IUT Email
              </button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Full Name" />
              <input type="text" placeholder="Student ID (2023-XXX)" />
              <input type="email" placeholder="IUT Email" />
              <input type="password" placeholder="Password" />
              <button className="primary-btn">Create Account</button>
              <div className="or">OR</div>
              <button className="outline-btn">
                Register with IUT Email
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

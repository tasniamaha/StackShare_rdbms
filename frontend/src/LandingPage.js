// src/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  // When user clicks "Get Started"
  const handleCTA = () => {
    navigate("/login"); // go to login page
  };

  return (
    <div className="landing-page">
      <header className="hero">
        <div className="hero-content">
          <h1>Welcome to StackShare</h1>
          <p>Borrow and manage devices easily with our platform.</p>

          <div className="cta-buttons">
            <button onClick={handleCTA} className="cta-button">
              Get Started
            </button>
            <span
              className="login-link"
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", marginLeft: "15px", color: "blue" }}
            >
              Already have an account? Login
            </span>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <h2>Borrow Devices</h2>
          <p>Request devices quickly and track your borrow history.</p>
        </div>
        <div className="feature-card">
          <h2>Admin Control</h2>
          <p>Approve requests, manage devices, and monitor activity.</p>
        </div>
        <div className="feature-card">
          <h2>Recommendations</h2>
          <p>Get suggested devices based on your usage and preferences.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

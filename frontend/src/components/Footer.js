// src/components/Footer.js
import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {currentYear} StackShare. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
          <a href="/contact" target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

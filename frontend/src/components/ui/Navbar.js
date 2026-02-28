import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logo, links = [], onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          {typeof logo === 'string' ? <span>{logo}</span> : logo}
        </div>

        <button
          className="navbar-hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'navbar-menu-open' : ''}`}>
          <ul className="navbar-links">
            {links.map((link, index) => (
              <li key={index} className="navbar-link-item">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
                  }
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {(user || onLogout) && (
            <div className="navbar-user-section">
              {user && <span className="navbar-user-name">{user.name}</span>}
              {onLogout && (
                <button className="navbar-logout-btn" onClick={onLogout}>
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

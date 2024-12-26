import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPageHeader.css';

const LandingPageHeader = () => {
  return (
    <header className="landing-page-header">
      <div className="logo">
        <Link to="/">HAPPY SHOPPY</Link>
      </div>
      <nav className="nav-links">
        <Link to="/"> Home </Link>
        <Link to="/login"> Shop </Link>
        <Link to="/about"> About Us </Link>
        <Link to="/contact"> Contact Us </Link>
      </nav>
      <div className="header-icons">
        <div className="account-btn">
          <Link to="/login" className="account-icon-btn">
            {/* Inline SVG for account icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="36" 
              height="36" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm7-7a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingPageHeader;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated'); // Clear authentication
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/home">E-SHOP</Link>
      </div>
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/search">Search</Link>
        <div className="account-menu" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="account-button">
            Account
          </button>
          {dropdownVisible && (
            <div className="dropdown">
              <Link to="/profile" onClick={() => setDropdownVisible(false)}>My Profile</Link>
              <Link to="/cart" onClick={() => setDropdownVisible(false)}>My Cart</Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import cartImage from './LoginImage.jpg';

const LoginSignupCard = ({ setAuth, setUserId }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsFlipped(!isFlipped);
  };

  const handleLogin = async () => {
    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);

        // Store the token and userId
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        setAuth(true);
        setUserId(data.userId); // Set userId state
        navigate('/home');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSignup = async () => {
    const username = document.querySelector('#signup-username').value;
    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;
    const confirmPassword = document.querySelector('#signup-confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);

        // Store the userId
        localStorage.setItem('userId', data.userId);
        setAuth(true);
        setUserId(data.userId); // Set userId state
        navigate('/home');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div className="login-container">
      <div className={`card-container ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Front Side */}
        <div className="card front">
          <img src={cartImage} alt="Shopping Cart" className="cart-image" />
          <div className="form">
            <h2>Log In</h2>
            <input id="login-username" type="text" placeholder="Enter your username" className="input" />
            <input id="login-password" type="password" placeholder="Password" className="input" />
            <button className="button" onClick={handleLogin}>Log In</button>
            <p className="toggle-link" onClick={handleToggle}>
              Don't have an account? Sign Up
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div className="card back">
          <img src={cartImage} alt="Shopping Cart" className="cart-image" />
          <div className="form">
            <h2>Sign Up</h2>
            <input id="signup-username" type="text" placeholder="Enter your username" className="input" />
            <input id="signup-email" type="email" placeholder="Enter your email address" className="input" />
            <input id="signup-password" type="password" placeholder="Password" className="input" />
            <input id="signup-confirm-password" type="password" placeholder="Confirm Password" className="input" />
            <button className="button" onClick={handleSignup}>Sign Up</button>
            <p className="toggle-link" onClick={handleToggle}>
              Already have an account? Log In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupCard;

// src/pages/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">

      <section className="hero1">
        <img
          src="https://media.istockphoto.com/id/1313422698/photo/handsome-black-female-is-using-desktop-computer-that-shows-welcome-page-of-a-popular-social.jpg?s=2048x2048&w=is&k=20&c=V8E4fPofWsjIwTPCt6eMSOqj8752K5PTEmrOC2jCn_Y="
          alt="Hero Banner"
          className="hero-image"
        />
        <div className="hero-text">
          <h1>Welcome to HAPPY SHOPPY!!</h1>
          <p>Your one-stop destination for shopping!</p>
          <Link to="/home" className="explore-btn">Explore Now</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

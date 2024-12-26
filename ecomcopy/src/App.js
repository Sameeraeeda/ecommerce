import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LandingPageHeader from './components/LandingPageHeader';
import Home from './pages/Home';
import CategoryPage from './components/Categories';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LoginSignupCard from './pages/LoginSignup';
import LandingPage from './pages/LandingPage';
import MyProfile from './pages/MyProfile'; // Import

function Layout({ children, showHeader }) {
  return (
    <>
      {showHeader && <Header />}
      <main>{children}</main>
    </>
  );
}

function LandingLayout({ children }) {
  return (
    <>
      <LandingPageHeader />
      <main>{children}</main>
    </>
  );
}

function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); // Add state for userId
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication on load (to persist login state)
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedAuth === 'true' && storedToken && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId); // Set the userId state
    }
  }, []);

  const fetchRecommendations = async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: searchTerm }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = (authStatus) => {
    setIsAuthenticated(authStatus);
    localStorage.setItem('isAuthenticated', authStatus);
  };

  const handleUserIdChange = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
  };

  return (
    <Router>
      <Routes>
        {/* Default Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingLayout>
              <LandingPage />
            </LandingLayout>
          } 
        />
        
        {/* Login Page */}
        <Route
          path="/login"
          element={<LoginSignupCard setAuth={handleAuthChange} setUserId={handleUserIdChange} />} // Pass handleUserIdChange
        />
        
        {/* Home Page */}
        <Route
          path="/home"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout showHeader={true}>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        
        {/* Category Page */}
        <Route
          path="/category"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout showHeader={true}>
                <CategoryPage />
              </Layout>
            </PrivateRoute>
          }
        />
        
        {/* Search Page */}
        <Route
          path="/search"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout showHeader={true}>
                <SearchResultsPage
                  fetchRecommendations={fetchRecommendations}
                  recommendations={recommendations}
                  loading={loading}
                  error={error}
                />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Product Page */}
        <Route
          path="/product/:id"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout showHeader={true}>
                <ProductPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout showHeader={true}>
                <MyProfile userId={userId} /> {/* Pass the actual user ID */}
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
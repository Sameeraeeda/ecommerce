import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { fetchRecommendations } from './api';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedRecommendations, setGroupedRecommendations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchAndGroupRecommendations = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a valid product name.');
      setGroupedRecommendations({});
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const loggedInUserId = localStorage.getItem('userId');
      const saveSearchHistoryResponse = await fetch('http://localhost:5000/saveSearchHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId, searchQuery }),
      });

      if (!saveSearchHistoryResponse.ok) {
        console.error('Failed to save search history');
      }

      const data = await fetchRecommendations(searchQuery);

      if (data.error) {
        setError(data.error);
        setGroupedRecommendations({});
      } else if (!data.recommendations || data.recommendations.length === 0) {
        setError('No recommendations found for the entered product.');
        setGroupedRecommendations({});
      } else {
        const grouped = data.recommendations.reduce((acc, product) => {
          if (!acc['Products']) acc['Products'] = [];
          acc['Products'].push(product);
          return acc;
        }, {});

        setGroupedRecommendations(grouped);
      }
    } catch (error) {
      setError('Failed to fetch recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    fetchAndGroupRecommendations();
  };

  // Handle product card click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Redirect to the product page
  };

  return (
    <div className="search-results-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button onClick={handleSearchSubmit}>Search</button>
      </div>

      {loading && <p className="loading-indicator">Loading recommendations...</p>}
      {error && <p className="error-message">{error}</p>}

      {Object.keys(groupedRecommendations).length > 0 ? (
        <div className="grouped-recommendations">
          {Object.keys(groupedRecommendations).map((category) => (
            <div key={category} className="rating-group">
              <div className="product-grid">
              {groupedRecommendations[category].map((product) => (
                  <div
                    key={product.product_id}
                    className="product-card"
                    onClick={() => handleProductClick(product.product_id)} // Add click handler
                  >
                    <img
                      src={product.image_url || 'https://via.placeholder.com/150'}
                      alt={product.product_name}
                      className="product-image"
                    />
                    <div className="product-title">{product.product_name}</div>
                  </div>
                ))} 
              </div>
            </div>
          ))}
        </div>
      ) : (
        searchQuery &&
        !loading && (
          <p className="no-results">No recommendations found. Try another search.</p>
        )
      )}
    </div>
  );
};

export default SearchResultsPage;

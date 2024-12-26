import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchSearchHistoryRecommendations } from "./api"; // Import the new function
import "./Home.css";
import "./image.png";

function Home() {
  const [topProducts, setTopProducts] = useState([]);
  const [historyRecommendations, setHistoryRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const baseUrl = "http://127.0.0.1:3000"; // Backend URL

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Fetch userId dynamically from localStorage

    if (!userId) {
      setError("User not logged in. Please log in to see personalized recommendations.");
      return;
    }

    // Fetch top-rated products
    axios
      .get(`${baseUrl}/api/top-rated`)
      .then((response) => {
        setTopProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching top-rated products:", error);
      });

    // Fetch search history recommendations
    fetchSearchHistoryRecommendations(userId)
      .then((recommendations) => {
        setHistoryRecommendations(recommendations);
      })
      .catch((error) => {
        console.error("Error fetching search history recommendations:", error);
      });
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Redirect to ProductPage with product ID
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home">
      <section className="hero">
      <img
          src="./image.png"
          alt="Hero Banner"
        />
        <h1>HAPPY SHOPPY</h1>
        <p>Makes easy shopping...</p>
      </section>

      <section className="top-rated-section">
        <h2>Top Rated Products</h2>
        <div className="top-rated-products">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div
                key={index}
                className="product-card"
                onClick={() => handleProductClick(product.product_id)}
              >
                <img
                src={product.image_url ? product.image_url : "https://via.placeholder.com/150"}
                  alt={product.product_name}
                  className="product-image"
                />
                <h3 className="product-title">{product.product_name}</h3>
                <p className="product-price">Rs. {product.price}</p>
                <p className="product-rating">Rating: ⭐{product.rating}</p>
              </div>
            ))
          ) : (
            <p>No top-rated products available.</p>
          )}
        </div>
      </section>

      <section className="recommendation-section">
        <h2>Recommended for You</h2>
        <div className="recommended-products">
          {historyRecommendations && historyRecommendations.length > 0 ? (
            historyRecommendations.map((product, index) => (
              <div
                key={index}
                className="product-card"
                onClick={() => handleProductClick(product.product_id)}
              >
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="product-image"
                />
                <h3 className="product-title">{product.product_name}</h3>
                <p className="product-price">Rs. {product.price}</p>
                <p className="product-rating">Rating: ⭐{product.rating}</p>
              </div>
            ))
          ) : (
            <p>No recommendations available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

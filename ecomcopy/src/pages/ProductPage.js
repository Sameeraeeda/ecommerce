import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css"; // Make sure the CSS file is imported

const ProductPage = () => {
    const { id } = useParams(); // Extract product ID from URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Product ID from URL:", id);
        axios
            .get(`http://127.0.0.1:3000/api/product/${id}`)
            .then((response) => {
                console.log("Product Details:", response.data);
                setProduct(response.data);
            })
            .catch((error) => {
                console.error("Error fetching product details:", error);
                setError("Failed to load product details.");
            });
    }, [id]);

    if (error) return <div>{error}</div>;

    if (!product) return <div>Loading...</div>;

    return (
        <div className="product-page">
            <div className="product-image-container">
                <img 
                    src={product.image_url} 
                    alt={product.product_name} 
                    className="product-image" 
                />
            </div>
            <div className="product-details">
                <h1 className="product-name">{product.product_name}</h1>
                <p className="product-description">{product.description}</p>
                <p className="product-price">Price: Rs. {product.price}</p>
                <p className="product-rating">Rating: ⭐ {product.rating}</p>
                <div className="product-actions">
                    <button className="add-to-cart-button">Add to Cart</button>
                    <button className="buy-now-button">Buy Now</button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;

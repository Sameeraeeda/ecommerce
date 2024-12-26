// pages/AccountPage.js
import React from 'react';
import './AccountPage.css';

function AccountPage() {
  // Example user data
  const user = {
    username: 'john_doe',
    password: '********', // Masked password
  };

  // Example cart items
  const cartItems = [
    {
      id: 1,
      name: 'Silky Frock',
      price: 2000,
      imageUrl: 'path/to/silky-frock.jpg',
    },
    {
      id: 2,
      name: 'Dotted Top',
      price: 1500,
      imageUrl: 'path/to/dotted-top.jpg',
    },
    {
      id: 3,
      name: 'Fancy Dress',
      price: 3000,
      imageUrl: 'path/to/fancy-dress.jpg',
    },
  ];

  return (
    <div className="account-page">
      <div className="account-info">
        <h2>Account Information</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Password:</strong> {user.password}</p>
      </div>

      <div className="cart-items">
        <h2>Your Cart</h2>
        {cartItems.length > 0 ? (
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">Rs. {item.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
}

export default AccountPage;

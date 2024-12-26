// components/Categories.js
import React from 'react';
import './Categories.css';

function Categories() {
  return (
    <section className="categories">
      <h2>Categories</h2>
      <div className="category-list">
        {/* Sample categories, repeat as needed */}
        <div className="category-item">Category 1</div>
        <div className="category-item">Category 2</div>
        <div className="category-item">Category 3</div>
      </div>
    </section>
  );
}

export default Categories;

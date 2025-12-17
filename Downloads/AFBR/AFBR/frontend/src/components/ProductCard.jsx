// frontend/src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="card product-card">
      <div className="product-image">
        <div className="placeholder-img">
          {product.name?.charAt(0) || 'P'}
        </div>
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-category">{product.category}</div>
        <div className="product-price">₹ {product.final_price || product.price}</div>
        <button
          className="btn-primary"
          onClick={() => onAddToCart?.(product)}
        >
          Add to demo cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

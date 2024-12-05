import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './ProductDetails.css';
import ReviewComponent from '../ReviewComponent/ReviewComponent'; // Đường dẫn tới ReviewComponent
import LoginPopup from '../LoginPopup/LoginPopup'; // Import LoginPopup

const ProductDetails = () => {
  const { id } = useParams(); 
  const { food_list, url, cartItems, addTocart, removeFromCart, isLoggedIn } = useContext(StoreContext); // Sử dụng StoreContext
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State điều khiển hiển thị LoginPopup

  // Tìm sản phẩm dựa trên ID
  const product = food_list.find((item) => item._id === id);

  // Hàm xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (productId) => {
    if (!isLoggedIn) {
      setShowLoginPopup(true); // Hiển thị popup đăng nhập nếu chưa đăng nhập
    } else {
      addTocart(productId); // Thêm vào giỏ hàng nếu đã đăng nhập
    }
  };

  // Nếu không tìm thấy sản phẩm theo ID
  if (!product) {
    return (
      <div className="product-not-found">
        <p>Product not found!</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="product-details">
      <div className="product-details-image">
        <img src={`${url}/images/${product.image}`} alt={product.name} />
      </div>
      <div className="product-details-info">
        <h1>{product.name}</h1>
        <p className="product-description">{product.description}</p>
        <p className="product-price">Price: ${product.price}</p>
  
        {/* Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa */}
        <div className="product-counter">
          {!cartItems[product._id] ? (
            <button className="add-to-cart-btn" onClick={() => handleAddToCart(product._id)}>
              Add to Cart
            </button>
          ) : (
            <div className="counter-controls">
              <button className="counter-btn" onClick={() => removeFromCart(product._id)}>
                -
              </button>
              <span>{cartItems[product._id]}</span>
              <button className="counter-btn" onClick={() => addTocart(product._id)}>
                +
              </button>
            </div>
          )}
        </div>
  
        <button className="back-btn" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
  
      {/* Thành phần ReviewComponent */}
      <div className="product-reviews-section">
        <h2>Customer Reviews</h2>
        <ReviewComponent productId={product._id} />
      </div>
  
      {/* Hiển thị LoginPopup nếu cần */}
      {showLoginPopup && <LoginPopup setShowLogin={setShowLoginPopup} />}
    </div>
  );
  
};

export default ProductDetails;
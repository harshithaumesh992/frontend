import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    setCartData(cartItems);
  }, [cartItems]);

  // Calculate final price
  const calculateFinalPrice = (item) => {
    const basePrice = parseFloat(item.price) || 0;
    const discountAmount = (basePrice * (parseFloat(item.discount) || 0)) / 100;
    const afterDiscount = basePrice - discountAmount;
    const profitAmount = (afterDiscount * (parseFloat(item.profit) || 0)) / 100;
    const withProfit = afterDiscount + profitAmount;
    const gstAmount = (withProfit * (parseFloat(item.gst) || 0)) / 100;
    return withProfit + gstAmount;
  };

  // Calculate total
  const calculateTotal = () => {
    return cartData.reduce((total, item) => {
      return total + (calculateFinalPrice(item) * (item.quantity || 1));
    }, 0);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, delta) => {
    const item = cartData.find(i => (i.id || i._id) === itemId);
    if (item) {
      const newQty = Math.max(1, (item.quantity || 1) + delta);
      updateQuantity(itemId, newQty);
    }
  };

  // Handle remove item
  const handleRemove = (itemId) => {
    removeFromCart(itemId);
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/payment');
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>🛒 Shopping Cart</h1>
        
        {cartData.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartData.map((item) => {
                const finalPrice = calculateFinalPrice(item);
                const itemId = item.id || item._id;
                return (
                  <div key={itemId} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.image && item.image.trim() !== '' ? item.image : 'https://placehold.co/100x100?text=No+Image'} 
                        alt={item.name} 
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-brand">{item.brand}</p>
                      <p className="item-price">₹{finalPrice.toFixed(2)}</p>
                    </div>
                    <div className="item-quantity">
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(itemId, -1)}
                      >
                        −
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(itemId, 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      <p>₹{(finalPrice * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemove(itemId)}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <button 
                className="btn-primary checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              <button 
                className="btn-secondary clear-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

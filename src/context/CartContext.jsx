import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to get product ID (handles both id and _id)
const getProductId = (item) => item.id || item._id;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Load cart from backend or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      if (user?.id || user?._id) {
        // User is logged in, try to load from backend
        try {
          const userId = user.id || user._id;
          const response = await fetch(`/api/cart/${userId}`);
          if (response.ok) {
            const cart = await response.json();
            if (cart.items && cart.items.length > 0) {
              setCartItems(cart.items);
              setCartCount(cart.items.length);
              localStorage.setItem('cartItems', JSON.stringify(cart.items));
              localStorage.setItem('cartCount', cart.items.length.toString());
              return;
            }
          }
        } catch (error) {
          console.log('Could not load cart from backend:', error);
        }
      }
      
      // Fallback to localStorage
      const savedCart = localStorage.getItem('cartItems');
      const savedCount = localStorage.getItem('cartCount');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
        }
      }
      if (savedCount) {
        setCartCount(parseInt(savedCount) || 0);
      }
    };
    
    loadCart();
  }, [user]);

  // Save cart to backend and localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartCount', cartCount.toString());
    
    // Save to backend if user is logged in
    if (user?.id || user?._id) {
      const saveCartToBackend = async () => {
        try {
          const userId = user.id || user._id;
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items: cartItems })
          });
        } catch (error) {
          console.error('Error saving cart to backend:', error);
        }
      };
      saveCartToBackend();
    }
  }, [cartItems, cartCount, user]);

  const addToCart = (product) => {
    const productId = getProductId(product);
    const existingItem = cartItems.find(item => getProductId(item) === productId);
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedItems = cartItems.map(item => 
        getProductId(item) === productId 
          ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
          : item
      );
      setCartItems(updatedItems);
    } else {
      // Add new item with quantity
      setCartItems([...cartItems, { ...product, quantity: product.quantity || 1 }]);
      setCartCount(cartCount + 1);
    }
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => getProductId(item) !== productId);
    setCartItems(updatedItems);
    setCartCount(updatedItems.length);
  };

  const updateQuantity = (productId, newQuantity) => {
    const updatedItems = cartItems.map(item => 
      getProductId(item) === productId 
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );
    setCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCount');
    
    // Clear from backend if user is logged in
    if (user?.id || user?._id) {
      const clearBackendCart = async () => {
        try {
          const userId = user.id || user._id;
          await fetch(`/api/cart/${userId}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.error('Error clearing cart from backend:', error);
        }
      };
      clearBackendCart();
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

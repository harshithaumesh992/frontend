import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import backendAPI_URL from '../utils/api';

const API_URL = `${backendAPI_URL}/api/products`;

const Products = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin form state
  const [adminForm, setAdminForm] = useState({
    brand: '',
    name: '',
    description: '',
    price: '',
    discount: '',
    profit: '',
    gst: '18',
    image: ''
  });
  
  // Cart state
  const [cart, setCart] = useState({});
  const [quantities, setQuantities] = useState({});
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Check if user is admin
  const userRole = user?.role || 'user';
  const isAdmin = ['superadmin', 'admin', 'order_manager'].includes(userRole);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
    
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    const email = sessionStorage.getItem('userEmail');
    if (loggedIn === 'true' && email) {
      setIsLoggedIn(true);
    }
  }, []);

  const getFallbackProducts = () => {
    return [
      { id: 1, name: 'Wireless Bluetooth Headphones', brand: 'Sony', price: 2999, discount: 15, profit: 20, gst: 18, finalPrice: 3022.32, description: 'Premium wireless headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
      { id: 2, name: 'Smart Fitness Watch', brand: 'Apple', price: 4999, discount: 10, profit: 25, gst: 18, finalPrice: 5398.92, description: 'Advanced fitness tracker', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
      { id: 3, name: 'Ergonomic Laptop Stand', brand: 'Logitech', price: 1499, discount: 5, profit: 30, gst: 18, finalPrice: 1798.31, description: 'Aluminum laptop stand', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
      { id: 4, name: 'USB-C Multiport Hub', brand: 'Anker', price: 2499, discount: 20, profit: 25, gst: 18, finalPrice: 2724.70, description: '7-in-1 USB-C hub', image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=400&fit=crop' },
      { id: 5, name: 'Mechanical Gaming Keyboard', brand: 'Corsair', price: 3999, discount: 12, profit: 22, gst: 18, finalPrice: 4544.88, description: 'RGB mechanical keyboard', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop' },
      { id: 6, name: 'Wireless Gaming Mouse', brand: 'Razer', price: 2999, discount: 18, profit: 25, gst: 18, finalPrice: 3157.75, description: 'High-precision wireless mouse', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
      { id: 7, name: 'Portable Bluetooth Speaker', brand: 'JBL', price: 1999, discount: 10, profit: 28, gst: 18, finalPrice: 2497.58, description: 'Waterproof portable speaker', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
      { id: 8, name: '4K Webcam with Microphone', brand: 'Logitech', price: 5999, discount: 15, profit: 20, gst: 18, finalPrice: 6022.32, description: 'Ultra HD 4K webcam', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop' },
      { id: 9, name: 'Wireless Charging Pad', brand: 'Samsung', price: 999, discount: 20, profit: 35, gst: 18, finalPrice: 1306.69, description: 'Fast wireless charging pad', image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&h=400&fit=crop' },
      { id: 10, name: 'Noise Cancelling Earbuds', brand: 'Samsung', price: 3999, discount: 12, profit: 22, gst: 18, finalPrice: 4544.88, description: 'True wireless earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop' },
      { id: 11, name: 'External SSD 1TB', brand: 'Western Digital', price: 7999, discount: 10, profit: 18, gst: 18, finalPrice: 8557.16, description: 'Portable SSD 1TB', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop' },
      { id: 12, name: 'USB Microphone', brand: 'Blue Yeti', price: 4999, discount: 8, profit: 25, gst: 18, finalPrice: 6217.85, description: 'Professional USB microphone', image: 'https://images.unsplash.com/photo-1590602847861-e7f0738e1b7c?w=400&h=400&fit=crop' },
      { id: 13, name: 'Smart Speaker', brand: 'Amazon', price: 4499, discount: 20, profit: 15, gst: 18, finalPrice: 4414.12, description: 'Voice-controlled smart speaker', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66eb?w=400&h=400&fit=crop' },
      { id: 14, name: 'Gaming Monitor 27 inch', brand: 'ASUS', price: 15999, discount: 15, profit: 18, gst: 18, finalPrice: 16227.96, description: '27-inch 4K gaming monitor', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop' },
      { id: 15, name: 'Wireless Keyboard Mouse', brand: 'Logitech', price: 1999, discount: 10, profit: 25, gst: 18, finalPrice: 2296.85, description: 'Wireless keyboard and mouse', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop' },
      { id: 16, name: 'Power Bank 20000mAh', brand: 'Xiaomi', price: 1499, discount: 15, profit: 20, gst: 18, finalPrice: 1534.18, description: '20000mAh power bank', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop' },
      { id: 17, name: 'Smart TV Stick 4K', brand: 'Amazon', price: 3499, discount: 12, profit: 18, gst: 18, finalPrice: 3797.14, description: 'Streaming device 4K', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop' },
      { id: 18, name: 'Fitness Band', brand: 'Xiaomi', price: 1999, discount: 18, profit: 22, gst: 18, finalPrice: 2263.40, description: 'Fitness band with heart rate', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop' },
      { id: 19, name: 'Tablet 10 inch', brand: 'Samsung', price: 12999, discount: 10, profit: 15, gst: 18, finalPrice: 13849.35, description: '10.1-inch tablet', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop' },
      { id: 20, name: 'Wireless Earbuds Pro', brand: 'OnePlus', price: 2999, discount: 15, profit: 20, gst: 18, finalPrice: 3022.32, description: 'True wireless earbuds', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop' },
      { id: 21, name: 'Smart Home Hub', brand: 'Google', price: 7999, discount: 12, profit: 18, gst: 18, finalPrice: 8679.14, description: 'Smart home hub', image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop' },
      { id: 22, name: 'Portable Projector', brand: 'Epson', price: 9999, discount: 15, profit: 20, gst: 18, finalPrice: 10074.10, description: 'Mini portable projector', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop' },
      { id: 23, name: 'VR Headset', brand: 'Meta', price: 24999, discount: 8, profit: 15, gst: 18, finalPrice: 26748.93, description: 'Virtual reality headset', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=400&fit=crop' },
      { id: 24, name: 'Smart Door Lock', brand: 'Samsung', price: 8999, discount: 12, profit: 18, gst: 18, finalPrice: 9759.14, description: 'Fingerprint smart door lock', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop' },
      { id: 25, name: 'Air Purifier HEPA', brand: 'Xiaomi', price: 5999, discount: 18, profit: 20, gst: 18, finalPrice: 6778.87, description: 'Smart air purifier', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop' },
      { id: 26, name: 'Electric Kettle 1.8L', brand: 'Prestige', price: 1299, discount: 15, profit: 25, gst: 18, finalPrice: 1467.62, description: 'Stainless steel kettle', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
      { id: 27, name: 'Instant Camera', brand: 'Fujifilm', price: 6999, discount: 10, profit: 18, gst: 18, finalPrice: 7598.85, description: 'Instant camera', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop' },
      { id: 28, name: 'Desk Fan with Remote', brand: 'Bajaj', price: 2499, discount: 20, profit: 22, gst: 18, finalPrice: 2821.87, description: 'High-speed desk fan', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop' },
      { id: 29, name: 'Robot Vacuum Cleaner', brand: 'iRobot', price: 19999, discount: 12, profit: 15, gst: 18, finalPrice: 21298.93, description: 'Smart robot vacuum', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
      { id: 30, name: 'Smart LED Bulbs Pack', brand: 'Philips', price: 999, discount: 25, profit: 30, gst: 18, finalPrice: 1198.80, description: 'Smart LED bulbs', image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop' }
    ];
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // If backend returns less than 30 products, use fallback
      if (data.length < 30) {
        setProducts(getFallbackProducts());
        setLoading(false);
      } else {
        setProducts(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Fallback to default products if backend not available
      setProducts(getFallbackProducts());
      setLoading(false);
    }
  };

  // Calculate final price
  const calculateFinalPrice = (price, discount, profit, gst) => {
    const basePrice = parseFloat(price) || 0;
    const discountAmount = (basePrice * (parseFloat(discount) || 0)) / 100;
    const afterDiscount = basePrice - discountAmount;
    const profitAmount = (afterDiscount * (parseFloat(profit) || 0)) / 100;
    const withProfit = afterDiscount + profitAmount;
    const gstAmount = (withProfit * (parseFloat(gst) || 0)) / 100;
    return withProfit + gstAmount;
  };

  // Handle admin form changes
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle image URL input
  const handleImageUrl = (e) => {
    setAdminForm(prev => ({ ...prev, image: e.target.value }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit product to backend
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const finalPrice = calculateFinalPrice(adminForm.price, adminForm.discount, adminForm.profit, adminForm.gst);
    
    const newProduct = {
      ...adminForm,
      price: parseFloat(adminForm.price),
      discount: parseFloat(adminForm.discount),
      profit: parseFloat(adminForm.profit),
      gst: parseFloat(adminForm.gst),
      finalPrice: finalPrice
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      
      if (response.ok) {
        const savedProduct = await response.json();
        setProducts([savedProduct, ...products]);
        setAdminForm({
          brand: '',
          name: '',
          description: '',
          price: '',
          discount: '',
          profit: '',
          gst: '18',
          image: ''
        });
        addToast('Product added successfully!', 'success');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      addToast('Error adding product. Please try again.', 'error');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  // Add to cart
  const handleAddToCart = (product) => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    const qty = quantities[product.id] || 1;
    const itemToAdd = { ...product, quantity: qty };
    addToCart(itemToAdd);
    setCart(prev => ({
      ...prev,
      [product.id]: itemToAdd
    }));
    addToast(`${product.name} added to cart!`, 'success');
  };

  // Calculate cart total
  const calculateCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      const finalPrice = calculateFinalPrice(item.price, item.discount, item.profit, item.gst);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      addToast('Please login to proceed to checkout', 'warning');
      navigate('/login');
      return;
    }
    navigate('/payment');
  };

  const finalPrice = calculateFinalPrice(adminForm.price, adminForm.discount, adminForm.profit, adminForm.gst);

  const handleAdminTabClick = () => {
    if (!isAdmin) {
      alert('Access denied. Admin only.');
      return;
    }
    setActiveTab('admin');
  };

  return (
    <div className="products-page">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          🛒 User View
        </button>
        {isAdmin && (
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={handleAdminTabClick}
          >
            ⚙️ Admin Panel
          </button>
        )}
      </div>

      {/* Show admin panel only for admins */}
      {activeTab === 'admin' && isAdmin ? (
        /* Admin Tab */
        <div className="admin-panel">
          <div className="admin-header">
            <h1>Add New Product</h1>
            <p>Fill in the product details below</p>
          </div>

          <form onSubmit={handleSubmitProduct} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={adminForm.brand}
                  onChange={handleAdminChange}
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={adminForm.name}
                  onChange={handleAdminChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Product Description</label>
              <textarea
                id="description"
                name="description"
                value={adminForm.description}
                onChange={handleAdminChange}
                placeholder="Enter product description"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Base Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={adminForm.price}
                  onChange={handleAdminChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discount">Discount (%)</label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={adminForm.discount}
                  onChange={handleAdminChange}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profit">Profit (%)</label>
                <input
                  type="number"
                  id="profit"
                  name="profit"
                  value={adminForm.profit}
                  onChange={handleAdminChange}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label htmlFor="gst">GST (%)</label>
                <input
                  type="number"
                  id="gst"
                  name="gst"
                  value={adminForm.gst}
                  onChange={handleAdminChange}
                  placeholder="18"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="price-summary">
              <h3>Price Summary</h3>
              <div className="price-row">
                <span>Base Price:</span>
                <span>₹{parseFloat(adminForm.price || 0).toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Discount ({adminForm.discount || 0}%):</span>
                <span>-₹{((parseFloat(adminForm.price || 0) * (parseFloat(adminForm.discount) || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Profit ({adminForm.profit || 0}%):</span>
                <span>+₹{((parseFloat(adminForm.price || 0) * (parseFloat(adminForm.profit) || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>GST ({adminForm.gst || 0}%):</span>
                <span>+₹{((parseFloat(adminForm.price || 0) * (parseFloat(adminForm.gst) || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="price-row total">
                <span>Final Price:</span>
                <span>₹{finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-container">
                <input
                  type="text"
                  placeholder="Or enter image URL"
                  value={adminForm.image && adminForm.image.startsWith('data:') ? '' : adminForm.image}
                  onChange={handleImageUrl}
                  className="image-url-input"
                />
                <div className="file-upload-wrapper">
                  <label htmlFor="imageUpload" className="file-upload-btn">
                    📁 Upload Image
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                </div>
              </div>
              {adminForm.image && (
                <div className="image-preview">
                  <img src={adminForm.image} alt="Preview" />
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary submit-btn">
              ➕ Add Product
            </button>
          </form>
        </div>
      ) : activeTab === 'admin' && !isAdmin ? (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => setActiveTab('user')} className="btn-primary">
            Go to User View
          </button>
        </div>
      ) : (
        /* User Tab */
        <div className="user-panel">
          <div className="products-header">
            <h1>Our Products</h1>
            <p>Browse our collection of amazing products</p>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="product-grid">
              {products.map(product => {
                const finalPrice = calculateFinalPrice(product.price, product.discount, product.profit, product.gst);
                return (
                  <div key={product._id || product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'} alt={product.name} />
                      {product.discount > 0 && (
                        <span className="discount-badge">-{product.discount}%</span>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="product-brand">{product.brand}</span>
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="price-container">
                        <span className="final-price">₹{finalPrice.toFixed(2)}</span>
                        {product.discount > 0 && (
                          <span className="original-price">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="quantity-selector">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(product._id || product.id, -1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{quantities[product._id || product.id] || 1}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(product._id || product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="btn-secondary add-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
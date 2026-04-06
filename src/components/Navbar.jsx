import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHome, FaBox, FaInfoCircle, FaBlog, FaEnvelope, FaLock, FaCog } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the admin page
  const isAdminPage = location.pathname === '/admin';

  // Check user role and permissions
  const userRole = user?.role || 'user';
  const isSuperAdmin = userRole === 'superadmin';
  const isAdmin = ['superadmin', 'admin', 'order_manager'].includes(userRole);
  
  // Page access permissions
  const canAccessProducts = isSuperAdmin || user?.permissions?.viewProducts !== false;
  const canAccessCart = isSuperAdmin || user?.permissions?.viewCart !== false;
  const canAccessProfile = isSuperAdmin || user?.permissions?.viewProfile !== false;
  const canAccessOrders = isSuperAdmin || user?.permissions?.manageOrders;
  const canAccessPayment = isSuperAdmin || user?.permissions?.viewPayment !== false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">HarshiCart</span>
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              {isAdminPage ? (
                /* Admin page - show only admin icon, profile icon, and logout */
                <>
                  <Link to="/" className="nav-icon" title="Back to Home" onClick={closeMenu}>
                    <FaHome />
                    <span className="nav-icon-text">Home</span>
                  </Link>
                  
                  <div className="navbar-icons navbar-icons-loggedin">
                    {/* Profile - show based on permissions */}
                    {canAccessProfile && (
                      <Link to="/profile" className="nav-icon" title="Profile" onClick={closeMenu}>
                        <FaUser />
                        <span className="nav-icon-text">Profile</span>
                      </Link>
                    )}
                  </div>
                  
                  <button className="nav-link btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                /* Regular pages - show full navigation */
                <>
                  {/* Show navigation links to logged in users too */}
                  <Link to="/" className="nav-link" onClick={closeMenu}>
                    <FaHome /> Home
                  </Link>
                  <Link to="/products" className="nav-link" onClick={closeMenu}>
                    <FaBox /> Products
                  </Link>
                  <Link to="/about" className="nav-link" onClick={closeMenu}>
                    <FaInfoCircle /> About
                  </Link>
                  <Link to="/blog" className="nav-link" onClick={closeMenu}>
                    <FaBlog /> Blog
                  </Link>
                  <Link to="/contact" className="nav-link" onClick={closeMenu}>
                    <FaEnvelope /> Contact
                  </Link>

                  {/* Show Admin link only to admins */}
                  {isAdmin && (
                    <Link to="/admin" className="nav-icon" title="Admin Panel" onClick={closeMenu}>
                      <FaCog />
                      <span className="nav-icon-text">Admin</span>
                    </Link>
                  )}
                  
                  <div className="navbar-icons navbar-icons-loggedin">
                    {/* Profile - show based on permissions */}
                    {canAccessProfile && (
                      <Link to="/profile" className="nav-icon" title="Profile" onClick={closeMenu}>
                        <FaUser />
                        <span className="nav-icon-text">Profile</span>
                      </Link>
                    )}
                    
                    {/* Cart - show based on permissions */}
                    {canAccessCart && (
                      <Link to="/cart" className="nav-icon cart-icon" title="Cart" onClick={closeMenu}>
                        <FaShoppingCart />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        <span className="nav-icon-text">Cart</span>
                      </Link>
                    )}
                  </div>
                  
                  <button className="nav-link btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {/* Public navigation links */}
              <Link to="/" className="nav-link" onClick={closeMenu}>
                <FaHome /> Home
              </Link>
              <Link to="/products" className="nav-link" onClick={closeMenu}>
                <FaBox /> Products
              </Link>
              <Link to="/about" className="nav-link" onClick={closeMenu}>
                <FaInfoCircle /> About
              </Link>
              <Link to="/blog" className="nav-link" onClick={closeMenu}>
                <FaBlog /> Blog
              </Link>
              <Link to="/contact" className="nav-link" onClick={closeMenu}>
                <FaEnvelope /> Contact
              </Link>
              
              <div className="navbar-icons">
                <Link to="/cart" className="nav-icon cart-icon" title="Cart" onClick={closeMenu}>
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </div>
              
              <Link to="/login" className="nav-link btn-login" onClick={closeMenu}>
                <FaLock /> Login
              </Link>
              <Link to="/register" className="nav-link btn-register" onClick={closeMenu}>
                <FaLock /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

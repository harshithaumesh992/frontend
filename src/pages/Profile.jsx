import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaBox, FaShippingFast, FaCheck, FaClock, FaTimes, FaEye, FaTruck, FaCheckCircle, FaClipboardList, FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { getUserOrders, refreshOrdersFromBackend } = useOrders();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Fetch user orders on mount and when user changes
  useEffect(() => {
    if (user?.email) {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          // Refresh orders from backend to get latest updates
          await refreshOrdersFromBackend(user.email);
          // Get orders for this user
          const orders = getUserOrders(user.email);
          setUserOrders(orders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOrders();
      
      // Refresh orders every 10 seconds to get status updates
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.email]); // Removed getUserOrders and refreshOrdersFromBackend from dependencies

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = ['#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#22c55e'];
    return colors[status] || colors[0];
  };

  const getStatusLabel = (status) => {
    const labels = ['Order Placed', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    return labels[status] || 'Unknown';
  };

  const getStatusIcon = (status) => {
    const icons = ['📦', '✅', '📋', '🚚', '🏃', '🎉'];
    return icons[status] || '📦';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const closeModals = () => {
    setShowOrderModal(false);
    setShowTrackingModal(false);
    setSelectedOrder(null);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-not-logged-in">
            <h2>Please Login</h2>
            <p>You need to login to view your profile.</p>
            <Link to="/login" className="btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button 
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaBox /> My Orders ({userOrders.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUser />
              </div>
              <h2>{user.name || 'User'}</h2>
            </div>
            
            <div className="profile-details">
              <div className="profile-detail-item">
                <FaEnvelope className="profile-icon" />
                <div className="profile-detail-content">
                  <span className="profile-label">Email</span>
                  <span className="profile-value">{user.email || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="profile-detail-item">
                <FaPhone className="profile-icon" />
                <div className="profile-detail-content">
                  <span className="profile-label">Phone</span>
                  <span className="profile-value">{user.phone || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="profile-detail-item">
                <FaMapMarkerAlt className="profile-icon" />
                <div className="profile-detail-content">
                  <span className="profile-label">Address</span>
                  <span className="profile-value">{user.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn-primary btn-edit">
                <FaEdit /> Edit Profile
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2><FaBox /> My Orders</h2>
            
            {isLoading ? (
              <div className="loading-orders">
                <p>Loading your orders...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="no-orders">
                <FaBox className="no-orders-icon" />
                <p>You haven't placed any orders yet.</p>
                <Link to="/products" className="btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className="orders-list">
                {userOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <strong>Order ID:</strong> {order.id}
                      </div>
                      <div className="order-date">
                        <strong>Placed on:</strong> {formatDate(order.createdAt)}
                      </div>
                    </div>
                    
                    <div className="order-status-section">
                      <div className="current-status">
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        <span className="status-label" style={{ color: getStatusColor(order.status) }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      
                      {order.expectedDelivery && (
                        <div className="delivery-info">
                          <FaClock /> Expected Delivery: {formatDate(order.expectedDelivery)}
                        </div>
                      )}
                    </div>
                    
                    <div className="order-items">
                      <strong>Items:</strong>
                      <ul>
                        {order.items?.slice(0, 3).map((item, index) => (
                          <li key={index}>
                            {item.name} x {item.quantity || 1} - ₹{(item.finalPrice || item.price) * (item.quantity || 1)}
                          </li>
                        ))}
                        {order.items?.length > 3 && (
                          <li className="more-items">+{order.items.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="order-total">
                      <strong>Total:</strong> ₹{order.total?.toFixed(2)}
                    </div>
                    
                    <div className="order-actions">
                      <button 
                        className="btn-secondary btn-view-details"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <FaEye /> View Details
                      </button>
                      <button 
                        className="btn-primary btn-track-order"
                        onClick={() => handleTrackOrder(order)}
                      >
                        <FaTruck /> Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content order-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaClipboardList /> Order Details</h2>
              <button className="modal-close" onClick={closeModals}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Order Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{selectedOrder.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                {selectedOrder.expectedDelivery && (
                  <div className="detail-row">
                    <span className="detail-label">Expected Delivery:</span>
                    <span className="detail-value">{formatDate(selectedOrder.expectedDelivery)}</span>
                  </div>
                )}
              </div>

              <div className="order-detail-section">
                <h3>Delivery Address</h3>
                <p>{selectedOrder.deliveryAddress || 'Address not available'}</p>
              </div>

              <div className="order-detail-section">
                <h3>Payment Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{selectedOrder.paymentMethod || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value">{selectedOrder.paymentStatus || 'N/A'}</span>
                </div>
              </div>

              <div className="order-detail-section">
                <h3>Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.quantity || 1}</span>
                      </div>
                      <div className="item-price">
                        ₹{(item.finalPrice || item.price) * (item.quantity || 1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-section order-total-section">
                <div className="total-row">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-value">₹{selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content order-tracking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaTruck /> Order Tracking</h2>
              <button className="modal-close" onClick={closeModals}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="tracking-header">
                <div className="tracking-order-info">
                  <span className="tracking-order-id">Order ID: {selectedOrder.id}</span>
                  <span className="tracking-order-date">Placed on: {formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              <div className="tracking-timeline">
                {[
                  { status: 0, label: 'Order Placed', icon: <FaBoxOpen />, message: 'Your order has been placed successfully!' },
                  { status: 1, label: 'Order Confirmed', icon: <FaCheckCircle />, message: 'Your order has been confirmed by the seller!' },
                  { status: 2, label: 'Processing', icon: <FaClipboardList />, message: 'Your order is being processed and packed...' },
                  { status: 3, label: 'Shipped', icon: <FaShippingFast />, message: 'Your order has been shipped!' },
                  { status: 4, label: 'Out for Delivery', icon: <FaTruck />, message: 'Your order is out for delivery!' },
                  { status: 5, label: 'Delivered', icon: <FaCheck />, message: 'Your order has been delivered!' }
                ].map((step, index) => {
                  const isCompleted = selectedOrder.status >= step.status;
                  const isCurrent = selectedOrder.status === step.status;
                  const historyItem = selectedOrder.statusHistory?.find(h => h.status === step.status);
                  
                  return (
                    <div 
                      key={step.status} 
                      className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-icon" style={{ backgroundColor: isCompleted ? getStatusColor(step.status) : '#e5e7eb' }}>
                        {step.icon}
                      </div>
                      <div className="step-content">
                        <div className="step-label">{step.label}</div>
                        <div className="step-message">{historyItem?.message || step.message}</div>
                        {historyItem && (
                          <div className="step-date">{formatDate(historyItem.date)}</div>
                        )}
                      </div>
                      {index < 5 && <div className="step-connector" style={{ backgroundColor: isCompleted ? getStatusColor(step.status) : '#e5e7eb' }}></div>}
                    </div>
                  );
                })}
              </div>

              {selectedOrder.expectedDelivery && (
                <div className="tracking-delivery-info">
                  <FaClock />
                  <span>Expected Delivery: {formatDate(selectedOrder.expectedDelivery)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

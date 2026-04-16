import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaBox, FaShippingFast, FaCheck, FaTimes, FaEdit, FaTrash, FaEye, 
  FaClock, FaUser, FaMapMarkerAlt, FaSearch, FaComments, FaUsers, FaCog,
  FaPlus, FaHome, FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useUsers } from '../context/UsersContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../components/Toast';
import API_URL from '../utils/api';

const Admin = () => {
  const { user, isLoggedIn } = useAuth();
  const { getAllOrders, updateOrderStatus, deleteOrder, orders: contextOrders, refreshOrdersFromBackend } = useOrders();
  const { getAllUsers, addUser, updateUser, deleteUser } = useUsers();
  const { conversations, getMessages, sendMessage, markAsRead, setActiveConversation, activeConversation, getUnresolvedQueries, clearUnresolvedQuery } = useChat();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unresolvedQueries, setUnresolvedQueries] = useState([]);
  
  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    address: '',
    permissions: {
      // Page access permissions
      viewProducts: true,
      viewCart: true,
      viewProfile: true,
      viewPayment: true,
      // Admin permissions
      manageOrders: false,
      manageUsers: false,
      viewAnalytics: false,
      manageChat: false
    }
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validate user form
  const validateUserForm = () => {
    const errors = {};

    // Name validation
    if (!userForm.name || userForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(userForm.name)) {
      errors.name = 'Name should only contain letters';
    }

    // Phone validation
    if (!userForm.phone || !/^\d{10}$/.test(userForm.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    // Email validation
    if (!userForm.email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(userForm.email)) {
        errors.email = 'Please enter a valid email address';
      } else {
        const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
        const domain = userForm.email.split('@')[1]?.toLowerCase();
        if (!domain || !allowedDomains.includes(domain)) {
          errors.email = 'Please use a valid email provider (gmail.com, yahoo.com, etc.)';
        }
      }
    }

    // Password validation (only for new users)
    if (!selectedUser) {
      if (!userForm.password) {
        errors.password = 'Password is required';
      } else if (userForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(userForm.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(userForm.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(userForm.password)) {
        errors.password = 'Password must contain at least one number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(userForm.password)) {
        errors.password = 'Password must contain at least one special character';
      }
    }

    // Address validation
    if (!userForm.address || userForm.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get current user's role and permissions
  const userRole = user?.role || 'user';
  const isSuperAdmin = userRole === 'superadmin';
  
  // Permission checks
  const canManageOrders = isSuperAdmin || user?.permissions?.manageOrders;
  const canManageUsers = isSuperAdmin || user?.permissions?.manageUsers;
  const canViewAnalytics = isSuperAdmin || user?.permissions?.viewAnalytics;
  const canManageChat = isSuperAdmin || user?.permissions?.manageChat;

  // Check if user is admin (any admin role)
  const isAdmin = ['superadmin', 'admin', 'order_manager'].includes(userRole);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (!isAdmin) {
      alert('Access denied. Admin only.');
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    // Get orders from the OrdersContext - this ensures reactivity
    if (contextOrders && contextOrders.length > 0) {
      setOrders(contextOrders);
    }
    setUsers(getAllUsers());
  }, [contextOrders, getAllUsers]);

  // Load users from backend on mount
  useEffect(() => {
    const loadUsersFromBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`);
        if (response.ok) {
          const backendUsers = await response.json();
          // Merge with local users (backend users take precedence for admin)
          const localUsers = getAllUsers();
          const mergedUsers = [];
          const usedIndices = new Set();
          
          // First add local users, updating with backend data if available
          localUsers.forEach((localUser, index) => {
            const backendUser = backendUsers.find(u => u.email === localUser.email);
            if (backendUser) {
              // Merge: keep local ID but update with backend data
              mergedUsers.push({ 
                ...localUser, 
                ...backendUser, 
                id: localUser.id || backendUser._id || `user-${index}`,
                _id: backendUser._id
              });
            } else {
              mergedUsers.push(localUser);
            }
            usedIndices.add(index);
          });
          
          // Add backend users that don't exist locally
          backendUsers.forEach((backendUser, bIndex) => {
            const exists = localUsers.find(u => u.email === backendUser.email);
            if (!exists) {
              mergedUsers.push({ 
                ...backendUser, 
                id: backendUser._id || `backend-${bIndex}`,
                _id: backendUser._id
              });
            }
          });
          
          setUsers(mergedUsers);
        }
      } catch (error) {
        console.log('Using local users, backend not available');
      }
    };
    
    if (isSuperAdmin || canManageUsers) {
      loadUsersFromBackend();
    }
  }, [isSuperAdmin, canManageUsers, getAllUsers]);

  // Refresh orders when window gains focus or tab becomes visible
  useEffect(() => {
    const loadOrders = async () => {
      // Use context orders which stay in sync
      if (contextOrders && contextOrders.length > 0) {
        setOrders(contextOrders);
      }
      // Also check localStorage as backup
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // Merge with context orders if needed
        if (contextOrders && contextOrders.length > 0) {
          const contextIds = new Set(contextOrders.map(o => o.id));
          const merged = [...contextOrders];
          parsedOrders.forEach(order => {
            if (!contextIds.has(order.id)) {
              merged.push(order);
            }
          });
          setOrders(merged);
        } else {
          setOrders(parsedOrders);
        }
      }
      // Try to fetch from backend as well
      await refreshOrdersFromBackend();
      setUsers(getAllUsers());
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOrders();
      }
    };
    
    const handleFocus = () => {
      loadOrders();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Refresh every 10 seconds automatically
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [contextOrders, getAllUsers, refreshOrdersFromBackend]);

  // Load chat messages when conversation changes
  useEffect(() => {
    if (activeConversation && canManageChat) {
      const msgs = getMessages(activeConversation.id);
      setChatMessages(msgs);
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, getMessages, markAsRead, canManageChat]);

  // Load unresolved queries
  useEffect(() => {
    const loadUnresolvedQueries = () => {
      const queries = getUnresolvedQueries();
      setUnresolvedQueries(queries);
    };
    loadUnresolvedQueries();
    
    // Refresh every 5 seconds to check for new unresolved queries
    const interval = setInterval(loadUnresolvedQueries, 5000);
    return () => clearInterval(interval);
  }, [getUnresolvedQueries]);

  const handleUpdateStatus = (orderId) => {
    updateOrderStatus(orderId, newStatus, customMessage);
    
    // Update local state immediately from context
    const updatedOrders = getAllOrders();
    setOrders(updatedOrders);
    
    setShowModal(false);
    setCustomMessage('');
    addToast('Order status updated successfully!', 'success');
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(orderId);
      setOrders(getAllOrders());
    }
  };

  const handleSaveUser = async () => {
    // Validate form first
    if (!validateUserForm()) {
      return;
    }
    
    try {
      if (selectedUser) {
        // Check if user has MongoDB _id (not local ID)
        const userId = selectedUser._id || selectedUser.id;
        const isMongoId = userId && (userId.match(/^[0-9a-fA-F]{24}$/) || userId.startsWith('admin-'));
        
        if (isMongoId && !userId.startsWith('user-')) {
          // Update existing user in backend
          const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userForm)
          });
          if (response.ok) {
            const updatedUser = await response.json();
            // Update in local context as well
            updateUser(selectedUser.id, { ...updatedUser, id: selectedUser.id });
            addToast('User updated successfully!', 'success');
          } else {
            const data = await response.json();
            addToast(data.message || 'Failed to update user', 'error');
          }
        } else {
          // Local user - just update in local storage
          updateUser(selectedUser.id, userForm);
          addToast('User updated successfully!', 'success');
        }
      } else {
        // Add new user - call backend API
        const response = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });
        if (response.ok) {
          const newUser = await response.json();
          // Also add to local context with the returned _id
          addUser({ ...userForm, id: newUser._id || newUser.id, _id: newUser._id });
          addToast('User added successfully!', 'success');
        } else {
          const data = await response.json();
          addToast(data.message || 'Failed to add user', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      addToast('Error saving user. Please try again.', 'error');
    }
    
    setShowUserModal(false);
    setUserForm({
      name: '', email: '', phone: '', password: '', role: 'user', address: '',
      permissions: { viewProducts: true, viewCart: true, viewProfile: true, viewPayment: true, manageOrders: false, manageUsers: false, viewAnalytics: false, manageChat: false }
    });
    setFormErrors({});
    setSelectedUser(null);
    setUsers(getAllUsers());
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user?.id || userId === user?._id) {
      alert('You cannot delete yourself!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Check if user has MongoDB _id
        const userToDelete = users.find(u => u.id === userId || u._id === userId);
        const mongoId = userToDelete?._id;
        
        if (mongoId && !userId.startsWith('user-')) {
          // Try to delete from backend
          const response = await fetch(`${API_URL}/api/users/${mongoId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            addToast('User deleted successfully!', 'success');
          }
        } else {
          // Local user - just delete from local storage
          addToast('User deleted from local storage', 'success');
        }
      } catch (error) {
        console.error('Error deleting user from backend:', error);
        addToast('Error deleting from backend, using local storage.', 'warning');
      }
      // Always delete from local storage
      deleteUser(userId);
      setUsers(getAllUsers());
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const openUserModal = (userData = null) => {
    if (userData) {
      setSelectedUser(userData);
      setUserForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'user',
        address: userData.address || '',
        permissions: userData.permissions || {
          viewProducts: true,
          viewCart: true,
          viewProfile: true,
          viewPayment: true,
          manageOrders: false,
          manageUsers: false,
          viewAnalytics: false,
          manageChat: false
        }
      });
    } else {
      setSelectedUser(null);
      setUserForm({
        name: '', email: '', phone: '', password: '', role: 'user', address: '',
        permissions: { viewProducts: true, viewCart: true, viewProfile: true, viewPayment: true, manageOrders: false, manageUsers: false, viewAnalytics: false, manageChat: false }
      });
    }
    setShowUserModal(true);
  };

  const handleSendChatMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, 'admin', 'Admin', newMessage.trim());
    setNewMessage('');
  };

  const getStatusColor = (status) => {
    const colors = ['#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#22c55e'];
    return colors[status] || colors[0];
  };

  const getStatusLabel = (status) => {
    const labels = ['Order Placed', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    return labels[status] || 'Unknown';
  };

  const getRoleBadge = (role) => {
    const badges = {
      superadmin: { bg: '#7c3aed', label: 'Super Admin' },
      admin: { bg: '#dc2626', label: 'Admin' },
      order_manager: { bg: '#f59e0b', label: 'Order Manager' },
      user: { bg: '#2563eb', label: 'User' }
    };
    return badges[role] || badges.user;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2><FaCog /> Admin Panel</h2>
          <span className="user-role">{getRoleBadge(userRole).label}</span>
        </div>
        
        <nav className="sidebar-nav">
          {(canManageOrders || isSuperAdmin) && (
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaBox /> Orders
              <span className="badge">{orders.filter(o => o.status < 5).length}</span>
            </button>
          )}
          
          {(canManageUsers || isSuperAdmin) && (
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers /> Users
              <span className="badge">{users.length}</span>
            </button>
          )}
          
          {(canManageChat || isSuperAdmin) && (
            <button 
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <FaComments /> Chat
              <span className="badge">{conversations.reduce((a, c) => a + c.unreadCount, 0) + unresolvedQueries.length}</span>
            </button>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/" className="back-home"><FaHome /> Back to Home</Link>
          {!isLoggedIn && (
            <Link to="/login" className="login-link"><FaUser /> Login</Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Orders Tab */}
        {(activeTab === 'orders') && (canManageOrders || isSuperAdmin) && (
          <div className="admin-section">
            <div className="section-header">
              <h1><FaBox /> Order Management</h1>
            </div>
            
            <div className="orders-stats">
              <div className="stat-card"><FaBox /><div><h3>{orders.length}</h3><p>Total Orders</p></div></div>
              <div className="stat-card"><FaClock /><div><h3>{orders.filter(o => o.status < 5).length}</h3><p>Active</p></div></div>
              <div className="stat-card"><FaCheck /><div><h3>{orders.filter(o => o.status === 5).length}</h3><p>Delivered</p></div></div>
            </div>

            <div className="filters-bar">
              <div className="search-box">
                <FaSearch />
                <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
                <option value="all">All Status</option>
                <option value="0">Order Placed</option>
                <option value="1">Order Confirmed</option>
                <option value="2">Processing</option>
                <option value="3">Shipped</option>
                <option value="4">Out for Delivery</option>
                <option value="5">Delivered</option>
              </select>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Delivery</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan="7" className="no-data">No orders found</td></tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td><div className="user-cell"><span className="name">{order.userName || 'N/A'}</span><span className="email">{order.userEmail}</span></div></td>
                        <td>{order.items?.length || 0} items</td>
                        <td className="amount">₹{order.total?.toFixed(2)}</td>
                        <td><span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>{getStatusLabel(order.status)}</span></td>
                        <td>{order.expectedDelivery ? formatDate(order.expectedDelivery) : `${order.estimatedDays} days`}</td>
                        <td className="actions">
                          <button className="btn-action btn-update" onClick={() => openStatusModal(order)} title="Update Status"><FaEdit /></button>
                          <button className="btn-action btn-delete" onClick={() => handleDeleteOrder(order.id)} title="Delete Order"><FaTrash /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {(activeTab === 'users') && (canManageUsers || isSuperAdmin) && (
          <div className="admin-section">
            <div className="section-header">
              <h1><FaUsers /> User Management</h1>
              <div className="header-actions">
                <div className="search-box">
                  <FaSearch />
                  <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={() => openUserModal()}><FaPlus /> Add User</button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Permissions</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="7" className="no-data">No users found</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="user-id">{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className="role-badge" style={{ backgroundColor: getRoleBadge(u.role).bg }}>{getRoleBadge(u.role).label}</span></td>
                        <td>
                          <div className="permissions-list">
                            {u.permissions?.manageOrders && <span className="perm-tag">Orders</span>}
                            {u.permissions?.manageUsers && <span className="perm-tag">Users</span>}
                            {u.permissions?.manageChat && <span className="perm-tag">Chat</span>}
                            {u.permissions?.viewAnalytics && <span className="perm-tag">Analytics</span>}
                            {!u.permissions?.manageOrders && !u.permissions?.manageUsers && !u.permissions?.manageChat && !u.permissions?.viewAnalytics && <span className="perm-tag default">No Access</span>}
                          </div>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td className="actions">
                          <button className="btn-action btn-update" onClick={() => openUserModal(u)}><FaEdit /></button>
                          <button className="btn-action btn-delete" onClick={() => handleDeleteUser(u.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {(activeTab === 'chat') && (canManageChat || isSuperAdmin) && (
          <div className="admin-section chat-section">
            <h1><FaComments /> Chat Management</h1>
            
            {/* Unresolved Queries Notification */}
            {unresolvedQueries.length > 0 && (
              <div className="unresolved-queries-notification">
                <div className="notification-header">
                  <span className="notification-badge">{unresolvedQueries.length}</span>
                  <h3>Queries Need Admin Attention</h3>
                </div>
                <div className="unresolved-queries-list">
                  {unresolvedQueries.map(query => (
                    <div key={query.id} className="unresolved-query-item" onClick={() => {
                      const conv = conversations.find(c => c.id === query.conversationId);
                      if (conv) setActiveConversation(conv);
                    }}>
                      <div className="query-user">
                        <FaUser /> {query.userName || 'Unknown User'}
                      </div>
                      <div className="query-message">
                        <strong>Query:</strong> {query.originalMessage}
                      </div>
                      <div className="query-time">
                        {new Date(query.timestamp).toLocaleString()}
                      </div>
                      <button 
                        className="btn-dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearUnresolvedQuery(query.id);
                        }}
                      >
                        Mark Resolved
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="chat-container">
              <div className="chat-conversations-list">
                <h3>Conversations</h3>
                {conversations.length === 0 ? (
                  <p className="no-data">No conversations yet</p>
                ) : (
                  conversations.map(conv => (
                    <div key={conv.id} className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`} onClick={() => setActiveConversation(conv)}>
                      <div className="conv-avatar"><FaUser /></div>
                      <div className="conv-info">
                        <span className="conv-name">{conv.userName}</span>
                        <span className="conv-preview">{conv.lastMessage || 'No messages'}</span>
                      </div>
                      {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                    </div>
                  ))
                )}
              </div>
              
              <div className="chat-messages-area">
                {activeConversation ? (
                  <>
                    <div className="chat-header"><h3>Chat with {activeConversation.userName}</h3></div>
                    <div className="chat-messages">
                      {chatMessages.length === 0 ? (
                        <p className="no-data">No messages yet</p>
                      ) : (
                        chatMessages.map(msg => (
                          <div key={msg.id} className={`message ${msg.sender === 'admin' ? 'sent' : 'received'}`}>
                            <div className="message-content">
                              <span className="message-text">{msg.text}</span>
                              <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="chat-input">
                      <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()} />
                      <button onClick={handleSendChatMessage} disabled={!newMessage.trim()}>Send</button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected"><p>Select a conversation to start chatting</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaEdit /> Update Order Status</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                <p><strong>Customer:</strong> {selectedOrder.userName}</p>
                <p><strong>Current Status:</strong> {getStatusLabel(selectedOrder.status)}</p>
              </div>
              <div className="status-selector">
                <label>Select New Status:</label>
                <div className="status-options">
                  {[
                    { value: 0, label: 'Order Placed', icon: '📦' },
                    { value: 1, label: 'Order Confirmed', icon: '✅' },
                    { value: 2, label: 'Processing', icon: '📋' },
                    { value: 3, label: 'Shipped', icon: '🚚' },
                    { value: 4, label: 'Out for Delivery', icon: '🏃' },
                    { value: 5, label: 'Delivered', icon: '🎉' }
                  ].map(status => (
                    <label key={status.value} className={`status-option ${newStatus === status.value ? 'selected' : ''}`}>
                      <input type="radio" name="status" value={status.value} checked={newStatus === status.value} onChange={() => setNewStatus(status.value)} />
                      <span className="status-icon">{status.icon}</span>
                      <span className="status-label">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="message-input">
                <label>Custom Message (Optional):</label>
                <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Enter custom status message..." rows="3" />
              </div>
              <button className="btn-primary btn-full" onClick={() => handleUpdateStatus(selectedOrder.id)}>Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaUser /> {selectedUser ? 'Edit User' : 'Add New User/Admin'}</h2>
              <button className="close-modal" onClick={() => setShowUserModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={userForm.name || ''} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Enter name" />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={userForm.email || ''} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="Enter email" disabled={!!selectedUser} />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" value={userForm.phone || ''} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} placeholder="Enter 10-digit phone number" maxLength={10} />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              {!selectedUser && (
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} value={userForm.password || ''} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Enter password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)" />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEye /> : <FaEye />}
                    </button>
                  </div>
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>
              )}
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role || 'user'} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="user">User</option>
                  <option value="order_manager">Order Manager</option>
                  {isSuperAdmin && <option value="admin">Admin</option>}
                  {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                </select>
              </div>
              
              {/* Permissions (only for non-superadmin roles) */}
              {userForm.role !== 'superadmin' && (
                <div className="permissions-section">
                  <label>Page Access Permissions:</label>
                  <div className="permissions-grid">
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.viewProducts ?? true} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, viewProducts: e.target.checked } })} />
                      <span>Access Products</span>
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.viewCart ?? true} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, viewCart: e.target.checked } })} />
                      <span>Access Cart</span>
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.viewProfile ?? true} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, viewProfile: e.target.checked } })} />
                      <span>Access Profile</span>
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.viewPayment ?? true} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, viewPayment: e.target.checked } })} />
                      <span>Access Payment</span>
                    </label>
                  </div>
                  
                  <label style={{ marginTop: '15px' }}>Admin Permissions:</label>
                  <div className="permissions-grid">
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.manageOrders ?? false} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, manageOrders: e.target.checked } })} />
                      <span>Manage Orders</span>
                    </label>
                    {isSuperAdmin && (
                      <label className="permission-checkbox">
                        <input type="checkbox" checked={userForm.permissions?.manageUsers ?? false} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, manageUsers: e.target.checked } })} />
                        <span>Manage Users</span>
                      </label>
                    )}
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.viewAnalytics ?? false} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, viewAnalytics: e.target.checked } })} />
                      <span>View Analytics</span>
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" checked={userForm.permissions?.manageChat ?? false} onChange={(e) => setUserForm({ ...userForm, permissions: { ...userForm.permissions, manageChat: e.target.checked } })} />
                      <span>Manage Chat</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Address</label>
                <textarea value={userForm.address || ''} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} placeholder="Enter address" rows="2" />
              </div>
              <button className="btn-primary btn-full" onClick={handleSaveUser}>{selectedUser ? 'Update User' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

import React, { createContext, useState, useContext, useEffect } from 'react';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      } catch (e) {
        console.error('Error parsing orders from localStorage:', e);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Create a new order
  const createOrder = async (orderDetails) => {
    try {
      // Save to backend first
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to create order in backend');
      }

      const backendOrder = await response.json();
      
      // Use the backend order with MongoDB _id
      const newOrder = {
        ...backendOrder,
        id: backendOrder._id // Map _id to id for frontend consistency
      };

      // Update state and localStorage
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      return newOrder.id;
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Fallback: create order locally if backend fails
      const fallbackOrder = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        ...orderDetails,
        status: 0,
        statusHistory: [
          {
            status: 0,
            label: 'Order Placed',
            message: 'Your order has been placed successfully!',
            date: new Date().toISOString(),
            updatedBy: 'System'
          }
        ],
        createdAt: new Date().toISOString(),
        expectedDelivery: null,
        estimatedDays: 5
      };

      const updatedOrders = [...orders, fallbackOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      return fallbackOrder.id;
    }
  };

  // Update order status (Admin function)
  const updateOrderStatus = async (orderId, newStatus, message) => {
    const statusLabels = [
      'Order Placed',
      'Order Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered'
    ];
    
    const statusMessages = [
      'Your order has been placed successfully!',
      'Your order has been confirmed by the seller!',
      'Your order is being processed and packed...',
      'Your order has been shipped!',
      'Your order is out for delivery!',
      'Your order has been delivered!'
    ];

    // Calculate expected delivery based on status
    let expectedDelivery = null;
    let estimatedDays = 5;

    if (newStatus === 3) { // Shipped
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      expectedDelivery = deliveryDate.toISOString();
      estimatedDays = 3;
    } else if (newStatus === 5) { // Delivered
      expectedDelivery = new Date().toISOString();
      estimatedDays = 0;
    }

    // Update locally first
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        // Ensure statusHistory is always an array
        let existingHistory = [];
        if (order.statusHistory) {
          if (Array.isArray(order.statusHistory)) {
            existingHistory = order.statusHistory;
          } else if (typeof order.statusHistory === 'string') {
            try {
              existingHistory = JSON.parse(order.statusHistory);
              if (!Array.isArray(existingHistory)) {
                existingHistory = [];
              }
            } catch (e) {
              existingHistory = [];
            }
          }
        }
        
        const newStatusHistory = [
          ...existingHistory,
          {
            status: newStatus,
            label: statusLabels[newStatus],
            message: message || statusMessages[newStatus],
            date: new Date().toISOString(),
            updatedBy: 'Admin'
          }
        ];

        return {
          ...order,
          status: newStatus,
          statusHistory: newStatusHistory,
          expectedDelivery,
          estimatedDays,
          lastUpdated: new Date().toISOString()
        };
      }
      return order;
    });
    
    // Update state and localStorage immediately
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Also update backend
    try {
      const orderToUpdate = updatedOrders.find(o => o.id === orderId);
      if (orderToUpdate) {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: newStatus,
            statusHistory: orderToUpdate.statusHistory,
            expectedDelivery: orderToUpdate.expectedDelivery,
            estimatedDays: orderToUpdate.estimatedDays,
            lastUpdated: orderToUpdate.lastUpdated
          })
        });
      }
    } catch (error) {
      console.error('Error updating order status in backend:', error);
    }
  };

  // Get order by ID
  const getOrder = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Get all orders (for admin)
  const getAllOrders = () => {
    return orders;
  };

  // Get orders by user email
  const getUserOrders = (email) => {
    return orders.filter(order => order.userEmail === email);
  };

  // Refresh orders from backend for a specific user
  const refreshOrdersFromBackend = async (userEmail = null) => {
    try {
      let url = '/api/orders';
      if (userEmail) {
        url = `/api/orders/user/${encodeURIComponent(userEmail)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const backendOrders = await response.json();
        
        if (backendOrders.length > 0) {
          // Map backend orders to frontend format
          const mappedOrders = backendOrders.map(order => ({
            ...order,
            id: order._id // Map _id to id
          }));

          if (userEmail) {
            // For user-specific orders, merge with existing orders
            const otherOrders = orders.filter(o => o.userEmail !== userEmail);
            const merged = [...otherOrders, ...mappedOrders];
            setOrders(merged);
            localStorage.setItem('orders', JSON.stringify(merged));
          } else {
            // For admin, replace all orders
            setOrders(mappedOrders);
            localStorage.setItem('orders', JSON.stringify(mappedOrders));
          }
        }
        return true;
      }
    } catch (error) {
      console.error('Error refreshing orders from backend:', error);
    }
    return false;
  };

  // Delete an order (Admin function)
  const deleteOrder = async (orderId) => {
    // Remove locally first
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Also delete from backend
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting order from backend:', error);
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      createOrder,
      updateOrderStatus,
      getOrder,
      getAllOrders,
      getUserOrders,
      deleteOrder,
      refreshOrdersFromBackend
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;

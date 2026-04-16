import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../utils/api';

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within an UsersProvider');
  }
  return context;
};

// Helper function to get users directly from localStorage
const getUsersFromStorage = () => {
  const savedUsers = localStorage.getItem('users');
  if (savedUsers) {
    return JSON.parse(savedUsers);
  }
  // Return default admin user if nothing in localStorage
  return [{
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@harshicart.com',
    password: 'admin123',
    phone: '9876543210',
    role: 'admin',
    address: '123 Admin Street, Admin City',
    permissions: {
      viewProducts: true,
      viewCart: true,
      viewProfile: true,
      viewPayment: true,
      manageOrders: true,
      manageUsers: true,
      viewAnalytics: true,
      manageChat: true
    },
    createdAt: new Date().toISOString()
  }];
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(() => getUsersFromStorage());

  // Load users from backend on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`);
        if (response.ok) {
          const backendUsers = await response.json();
          if (backendUsers.length > 0) {
            // Map backend users to frontend format
            const mappedUsers = backendUsers.map(user => ({
              ...user,
              id: user._id // Map _id to id
            }));
            setUsers(mappedUsers);
            localStorage.setItem('users', JSON.stringify(mappedUsers));
          }
        }
      } catch (error) {
        console.log('Using local users, backend not available');
        // Fallback to localStorage
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        }
      }
    };
    
    loadUsers();
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Get all users
  const getAllUsers = () => {
    return users;
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  // Get user by email - checks both state and localStorage
  const getUserByEmail = (email) => {
    // First check state
    let foundUser = users.find(u => u.email === email);
    if (foundUser) return foundUser;
    
    // If not found and state is empty (initial render), check localStorage directly
    if (users.length === 0) {
      const storedUsers = getUsersFromStorage();
      return storedUsers.find(u => u.email === email);
    }
    
    return undefined;
  };

  // Add a new user
  const addUser = async (userData) => {
    try {
      // Save to backend first
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const backendUser = await response.json();
        const newUser = {
          ...backendUser,
          id: backendUser._id // Map _id to id
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user to backend:', error);
      
      // Fallback: add locally
      const fallbackUser = {
        id: 'user-' + Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, fallbackUser]);
      return fallbackUser;
    }
  };

  // Update a user
  const updateUser = async (userId, updates) => {
    try {
      // Find user to get MongoDB _id
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const mongoId = userToUpdate._id || userId;
      
      // Update in backend
      const response = await fetch(`${API_URL}/api/users/${mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            return { 
              ...user, 
              ...updatedUser, 
              id: userId, // Keep frontend id
              updatedAt: new Date().toISOString() 
            };
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('Error updating user in backend:', error);
      
      // Fallback: update locally
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return { ...user, ...updates, updatedAt: new Date().toISOString() };
        }
        return user;
      }));
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      // Find user to get MongoDB _id
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) return;

      const mongoId = userToDelete._id || userId;
      
      // Delete from backend
      await fetch(`${API_URL}/api/users/${mongoId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting user from backend:', error);
    }
    
    // Always delete locally
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Get users by role
  const getUsersByRole = (role) => {
    return users.filter(u => u.role === role);
  };

  return (
    <UsersContext.Provider value={{
      users,
      getAllUsers,
      getUserById,
      getUserByEmail,
      addUser,
      updateUser,
      deleteUser,
      getUsersByRole
    }}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersContext;

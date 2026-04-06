import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute component for role-based access control
const ProtectedRoute = ({ children, requiredPermission, allowedRoles }) => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not provided, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || 'user';
    const isAllowedRole = allowedRoles.includes(userRole) || 
      (userRole === 'superadmin'); // Superadmin can access everything
    
    if (!isAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    const userRole = user.role || 'user';
    
    // Superadmin and admin have all permissions
    if (userRole === 'superadmin' || userRole === 'admin') {
      return children;
    }

    // Check specific permission
    const hasPermission = user.permissions && user.permissions[requiredPermission];
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

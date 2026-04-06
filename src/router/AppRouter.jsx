import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import About from '../pages/About';
import Blog from '../pages/Blog';
import Contact from '../pages/Contact';
import Products from '../pages/Products';
import Cart from '../pages/Cart';
import Payment from '../pages/Payment';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import Userform from '../pages/Userform';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes - accessible by everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute requiredPermission="viewProducts">
              <Products />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute requiredPermission="viewCart">
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute requiredPermission="viewPayment">
              <Payment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredPermission="viewProfile">
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userform" 
          element={
            <ProtectedRoute requiredPermission="viewProfile">
              <Userform />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes - require admin role or manageOrders/manageUsers permission */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'order_manager']}>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;

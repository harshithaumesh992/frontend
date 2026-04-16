import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should only contain letters';
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone number should be exactly 10 digits';
    return '';
  };

  const validateEmail = (email) => {
    // Allowed email domains
    const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
    
    if (!email) return 'Email is required';
    
    // Basic format check
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    // Extract domain and check if allowed
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !allowedDomains.includes(domain)) {
      return 'Please use a valid email provider (gmail.com, yahoo.com, etc.)';
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (address.trim().length < 10) return 'Please enter a complete address (at least 10 characters)';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === 'name') {
      // Allow only letters and spaces for name
      const nameValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: nameValue });
    } else if (name === 'email') {
      // Allow only alphanumeric, @ and . symbols for email
      const emailValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
      setFormData({ ...formData, [name]: emailValue });
    } else if (name === 'address') {
      // Allow alphanumeric, spaces, commas, periods for address
      const addressValue = value.replace(/[^a-zA-Z0-9\s,.]/g, '');
      setFormData({ ...formData, [name]: addressValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      address: validateAddress(formData.address),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };
    const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, val]) => val !== ''));
    if (Object.keys(filteredErrors).length > 0) {
      setErrors(filteredErrors);
      return;
    }

    // Call backend API
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setApiError(data.message || 'Registration failed');
      } else {
        addToast('Registration successful! Please login.', 'success');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      setApiError('Server error. Please try again later.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Create Your Account</h2>
        {apiError && <div className="error-message">{apiError}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className={errors.phone ? 'error' : ''} />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className={errors.address ? 'error' : ''}></textarea>
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p className="register-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
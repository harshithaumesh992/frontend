import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('https://backend-udye.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login failed');
      } else {
        // Save user in session storage and update AuthContext
        login(data.user);

        addToast('Login successful! Welcome back!', 'success');

        // Redirect based on role
        const role = data.user.role;
        if (['superadmin', 'admin', 'order_manager'].includes(role)) {
          navigate('/admin');
        } else if (!data.user.permissions.viewProducts) {
          if (data.user.permissions.viewProfile) navigate('/profile');
          else navigate('/');
        } else {
          navigate('/products');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login to Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p className="login-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Demo Admin Account:</p>
          <p style={{ margin: '0', fontSize: '14px' }}>Email: admin@harshicart.com</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
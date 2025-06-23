import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api'; // Import your API call
import './LoginPage.css'; // Create this CSS file for specific page styles

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token); // Save the JWT token
      localStorage.setItem('user', JSON.stringify(data.user)); // Save user data (optional)
      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
      setError(err); // Display error message from API
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon-placeholder">
          <svg className="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h2>Login</h2>
        {error && <p className="error-message">{error.message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" " // Use space to make placeholder visible with CSS
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <Link to="/forgot-password" className="link">Forgot password?</Link>
        <p className="signup-text">
          Don't have an account? <Link to="/register" className="link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
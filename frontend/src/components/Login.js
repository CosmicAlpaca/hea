import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';

function Login({ setIsAuthenticated, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      const userResponse = await apiClient.get('/auth/user/');
      setUser(userResponse.data);
      setIsAuthenticated(true);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      let errorMsg = 'Failed to login. Please check your credentials.';
       if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        if (backendErrors.detail) {
            errorMsg = backendErrors.detail;
        } else if (typeof backendErrors === 'object') {
          errorMsg = Object.entries(backendErrors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else if (typeof backendErrors === 'string') {
            errorMsg = backendErrors;
        }
      } else if (err.request) {
        errorMsg = "No response from server. Please check your network connection or if the server is running.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      console.error("Login error details:", err.response || err.request || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-username">Username:</label>
            <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="login-password">Password:</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          {error && <pre className="error-message">{error}</pre>}
          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch-link">
            Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
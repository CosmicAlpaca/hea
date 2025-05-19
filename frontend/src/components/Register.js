import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password !== password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post('/auth/register/', {
        username,
        email,
        password,
        password2,
        role,
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          errorMsg = Object.entries(backendErrors)
            .map(([key, value]) => {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join('\n');
        } else if (typeof backendErrors === 'string') {
          errorMsg = backendErrors;
        }
      } else if (err.request) {
        errorMsg = "No response from server. Please check your network or if the server is running.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      console.error("Registration error details:", err.response || err.request || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="register-username">Username:</label>
            <input id="register-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="register-email">Email:</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="register-password">Password:</label>
            <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="register-password2">Confirm Password:</label>
            <input id="register-password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="register-role">Register as:</label>
            <select id="register-role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isLoading}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="admin">Administrator</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Laboratory Technician</option>
              <option value="insurance_provider">Insurance Provider</option>
            </select>
          </div>
          {error && <pre className="error-message">{error}</pre>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch-link">
            Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
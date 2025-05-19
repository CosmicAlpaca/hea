import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import apiClient from './services/api';
import './App.css';

function AuthContent({ setIsAuthenticated, setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await apiClient.get('/auth/user/');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn('Auth check failed or token expired, logging out.', error.response || error.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          navigate('/login');
        }
      }
    } else {
        setIsAuthenticated(false);
        setUser(null);
    }
    setLoading(false);
  }, [setIsAuthenticated, setUser, navigate]);


  useEffect(() => {
    checkAuth();
    // Listen for storage changes to sync auth state across tabs (optional)
    const handleStorageChange = (event) => {
        if (event.key === 'accessToken' || event.key === 'refreshToken') {
            checkAuth();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [checkAuth]);

  if (loading) {
    return <div className="loading-fullscreen">Loading Application...</div>;
  }

  return null; // This component only handles auth logic, not rendering main routes
}


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = (navigate) => {
    apiClient.post('/auth/logout/', { refresh: localStorage.getItem('refreshToken') })
      .catch(err => console.error("Logout API call failed, clearing local tokens anyway.", err));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  function Navigation() {
    const navigate = useNavigate();
    return (
      <nav>
        <ul className="navbar">
          <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li className="nav-item nav-user-info"><span>Welcome, {user?.username} ({user?.role})</span></li>
              <li className="nav-item"><button onClick={() => handleLogout(navigate)} className="nav-link button-link">Logout</button></li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
              <li className="nav-item"><Link to="/register" className="nav-link">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    );
  }

  return (
    <Router>
      <AuthContent setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
      <Navigation />
      <div className="app-container">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
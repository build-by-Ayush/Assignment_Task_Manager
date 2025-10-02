import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';

function App() {
  const { user, logout } = useContext(AuthContext); // Get current user and logout function from AuthContext
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation(); // To detect current path

  const isAuthenticated = Boolean(user); // True if user is logged in

  // Hide Navbar on Login and Register pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Set axios Authorization header if token exists on load
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
      <Routes>
        {/* Redirect root based on authentication */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/tasks" /> : <Navigate to="/login" />} />

        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/tasks" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/tasks" /> : <Register />} />

        {/* Protected routes */}
        <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} />
        <Route path="/focus" element={isAuthenticated ? <Focus /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

// Wrap App in Router for routing context
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

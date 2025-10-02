import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, onLogout }) {
  const location = useLocation(); // Get current path to highlight active link

  // Helper for highlighting active nav link
  const navLinkStyle = path => ({
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 'bold' : 500,
    background: location.pathname === path ? '#2563eb' : 'transparent',
    color: location.pathname === path ? '#fff' : '#22223b',
    borderRadius: 8,
    padding: '7px 20px',
    transition: 'background 0.15s, color 0.15s',
    marginRight: 10,
    fontSize: 18
  });

  return (
    <nav style={{
      background: '#fff',
      boxShadow: '0 2px 8px #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '22px 42px 18px 42px',
      borderBottom: '2px solid #eceff2',
      minHeight: 30
    }}>
      <span style={{
        fontWeight: 700,
        fontSize: 25,
        color: '#22223b',
        letterSpacing: 2
      }}>
        Task Manager
      </span>
      <div>
        {isAuthenticated ? (
          <>
            <Link to="/tasks" style={navLinkStyle('/tasks')}>Tasks</Link>
            <Link to="/focus" style={navLinkStyle('/focus')}>Focus</Link>
            <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
            <button
              onClick={onLogout}
              style={{
                color: '#e53e3e',
                background: 'transparent',
                border: 'none',
                fontWeight: 600,
                fontSize: 18,
                marginLeft: 16,
                cursor: 'pointer',
                padding: '7px 12px',
                borderRadius: 8,
                transition: 'background 0.15s'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle('/login')}>Login</Link>
            <Link to="/register" style={navLinkStyle('/register')}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

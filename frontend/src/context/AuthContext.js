import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext to provide auth state globally
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Store current user info
  const [loading, setLoading] = useState(true); // Track if auth state is loading

  // On component mount, check if token exists and is valid
  useEffect(() => {
    const token = localStorage.getItem('access_token'); // Get token from localStorage
    const userData = localStorage.getItem('user_data'); // Get stored user info
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (userData) {
        setUser(JSON.parse(userData));
      }
      // Token validation check
      axios.get('http://127.0.0.1:8000/api/tasks/')
        .catch(err => {
          if (err.response && err.response.status === 401) {
            logout();
          }
        })
        .finally(() => setLoading(false)); // Stop loading after check
    } else {
      setLoading(false);
    }
  }, []);

  // Function to login user and store token + user info
  const login = (token, userData) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  // Function to logout user and clear token + state
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

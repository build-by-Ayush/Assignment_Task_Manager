import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username,
        password,
      });
      const token = response.data.access;
      const refreshToken = response.data.refresh;
      login(token, { username });
      localStorage.setItem('refresh_token', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/tasks');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      minHeight: "60vh",
      background: "#f7f8fa",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      margin: 0,
      padding: "140px",
      overflow: "hidden"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: 16,
          boxShadow: "0 4px 32px 0 rgba(0,0,0,0.08)",
          minWidth: 340,
          maxWidth: "96vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
        <h2 style={{
          marginBottom: "1.3rem",
          fontWeight: 700,
          color: "#51545dff",
          letterSpacing: 1
        }}>Login</h2>
        {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
        {/* Username Field */}
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Enter username"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #d2d6dc",
              marginBottom: 18,
              fontSize: 16
            }}
          />
        </div>
        {/* Password Field */}
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #d2d6dc",
              marginBottom: 18,
              fontSize: 16
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#357bfc",
            color: "#fff",
            padding: "12px",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 18,
            border: "none",
            marginBottom: 16,
            cursor: "pointer",
          }}
        >Login</button>
        <div style={{
          fontSize: 15,
          color: "#374151",
          marginBottom: 5
        }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#357bfc", fontWeight: 600 }}>
            Register
          </Link>
        </div>

        {/* Demo credentials block */}
        <div style={{
          width: "100%",
          background: "#f8fafd",
          border: "1px solid #ececec",
          borderRadius: 6,
          marginTop: 12,
          marginBottom: 0,
          padding: "8px 10px",
          textAlign: "center",
          fontSize: 13,
          color: "#687076",
          fontWeight: 500,
          userSelect: "none",
          lineHeight: 1.4,
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}>
          <span style={{ fontWeight: 600 }}>Demo credentials:</span>

          <span>
            Username: <code>Demo</code> &nbsp;|&nbsp; Password: <code>123</code>
          </span>

          <span
            style={{ 
              color: "#357bfc", 
              cursor: "pointer", 
              fontWeight: 600, 
              textDecoration: "underline", 
              alignSelf: "center" 
            }}
            onClick={() => {
              setUsername("Demo");
              setPassword("123");
            }}
          >
            Autofill
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;

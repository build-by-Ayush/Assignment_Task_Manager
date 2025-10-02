import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  // State Hooks
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/register/', {
        username,
        email,
        password,
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  // Page Layout / Container
  return (
    <div style={{
      minHeight: "70vh",
      background: "#f7f8fa",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      margin: 0,
      padding: "100px",
      overflow: "hidden"
    }}>
      {/* Registration Form */}
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
        }}>Register</h2>

        {/* Error & Success Messages */}
        {error && <div style={{
          background: "#ffe6e6",
          color: "#bc2626",
          padding: "7px 0",
          width: "100%",
          borderRadius: 6,
          textAlign: "center",
          marginBottom: 12,
          fontWeight: 600
        }}>{error}</div>}
        {success && <div style={{
          background: "#e8fae6",
          color: "#1f9c35",
          padding: "7px 0",
          width: "100%",
          borderRadius: 6,
          textAlign: "center",
          marginBottom: 12,
          fontWeight: 600
        }}>{success}</div>}
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Choose username"
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
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter email"
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
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Choose password"
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
        >Register</button>
        <div style={{
          fontSize: 15,
          color: "#374151",
          marginBottom: 5
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#357bfc", fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;

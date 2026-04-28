import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password) {
      setError('All fields required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.register(form.username, form.email, form.password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h1 style={{ textAlign: 'center' }}>SubTrack</h1>
        <h2 style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Create Account</h2>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={groupStyle}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" style={submitStyle} disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Already have account? <a href="/" style={linkStyle}>Login</a>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f3f4f6'
};

const boxStyle = {
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const groupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const inputStyle = {
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontFamily: 'inherit'
};

const submitStyle = {
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  padding: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px'
};

const errorStyle = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '15px'
};

const successStyle = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '15px'
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none'
};

export default SignupPage;

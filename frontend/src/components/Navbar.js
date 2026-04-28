import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          SubTrack
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user && (
            <>
              <a href="/dashboard" style={linkStyle}>Dashboard</a>
              <a href="/simulation" style={linkStyle}>Simulation</a>
              <span style={{ color: '#fff' }}>Hi, {user.username}</span>
              <button onClick={handleLogout} style={btnStyle}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navStyle = {
  backgroundColor: '#3b82f6',
  padding: '15px 30px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '14px'
};

const btnStyle = {
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SimulationPanel from '../components/SimulationPanel';
import * as api from '../services/api';

function SimulationPage() {
  const [user, setUser] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getCategoryStats();
      setCategoryStats(response.data);
    } catch (err) {
      console.log('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const maxCost = categoryStats.length > 0
    ? Math.max(...categoryStats.map(s => s.totalCost))
    : 1;

  return (
    <>
      <Navbar user={user} />
      <div style={containerStyle}>
        <h1>Subscription Simulator</h1>

        <SimulationPanel />

        <div style={statsStyle}>
          <h3>Spending by Category</h3>
          {categoryStats.length === 0 ? (
            <p>No subscriptions yet</p>
          ) : (
            <div>
              {categoryStats.map(stat => (
                <div key={stat._id} style={categoryItemStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{stat._id}</span>
                    <span>${stat.totalCost.toFixed(2)}</span>
                  </div>
                  <div style={barBackgroundStyle}>
                    <div
                      style={{
                        width: `${(stat.totalCost / maxCost) * 100}%`,
                        backgroundColor: '#3b82f6',
                        height: '20px',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const containerStyle = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '20px'
};

const statsStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px'
};

const categoryItemStyle = {
  marginBottom: '20px'
};

const barBackgroundStyle = {
  width: '100%',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  height: '20px'
};

export default SimulationPage;

import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

function TotalCard() {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTotals();
  }, []);

  const fetchTotals = async () => {
    try {
      const response = await api.getProjections();
      setTotals(response.data);
    } catch (err) {
      console.log('Error fetching totals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!totals) return <div>No data</div>;

  return (
    <div style={cardContainerStyle}>
      <div style={itemStyle}>
        <div style={labelStyle}>Monthly Burn Rate</div>
        <div style={valueStyle}>${totals.monthlyTotal.toFixed(2)}</div>
      </div>
      <div style={itemStyle}>
        <div style={labelStyle}>Annual Projection</div>
        <div style={valueStyle}>${totals.annualTotal.toFixed(2)}</div>
      </div>
      <div style={itemStyle}>
        <div style={labelStyle}>Active Subscriptions</div>
        <div style={valueStyle}>{totals.subscriptions.length}</div>
      </div>
    </div>
  );
}

const cardContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px',
  marginBottom: '20px'
};

const itemStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const labelStyle = {
  fontSize: '12px',
  color: '#666',
  marginBottom: '10px'
};

const valueStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937'
};

export default TotalCard;

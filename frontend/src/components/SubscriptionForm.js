import React, { useState } from 'react';
import * as api from '../services/api';

function SubscriptionForm({ onSubAdded }) {
  const [form, setForm] = useState({
    name: '',
    category: 'entertainment',
    cost: '',
    billingCycle: 'monthly'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.cost) {
      setError('All fields required');
      return;
    }

    if (form.cost <= 0) {
      setError('Cost must be positive');
      return;
    }

    try {
      setLoading(true);
      const response = await api.addSub(
        form.name,
        form.category,
        parseFloat(form.cost),
        form.billingCycle
      );
      
      onSubAdded(response.data);
      setForm({
        name: '',
        category: 'entertainment',
        cost: '',
        billingCycle: 'monthly'
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Add Subscription</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={groupStyle}>
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={groupStyle}>
          <label>Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="entertainment">Entertainment</option>
            <option value="productivity">Productivity</option>
            <option value="utilities">Utilities</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={groupStyle}>
          <label>Cost ($) *</label>
          <input
            type="number"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            style={inputStyle}
          />
        </div>

        <div style={groupStyle}>
          <label>Billing Cycle *</label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                name="billingCycle"
                value="monthly"
                checked={form.billingCycle === 'monthly'}
                onChange={handleChange}
              />
              {' '}Monthly
            </label>
            <label>
              <input
                type="radio"
                name="billingCycle"
                value="annual"
                checked={form.billingCycle === 'annual'}
                onChange={handleChange}
              />
              {' '}Annual
            </label>
          </div>
        </div>

        <button type="submit" style={submitBtnStyle} disabled={loading}>
          {loading ? 'Adding...' : 'Add Subscription'}
        </button>
      </form>
    </div>
  );
}

const formContainerStyle = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px'
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
  padding: '8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontFamily: 'inherit'
};

const errorStyle = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '10px'
};

const submitBtnStyle = {
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  padding: '10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default SubscriptionForm;

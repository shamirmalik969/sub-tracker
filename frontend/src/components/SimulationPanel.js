import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

function SimulationPanel() {
  const [projections, setProjections] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjections();
  }, []);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      const response = await api.getProjections();
      setProjections(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch projections');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (subId) => {
    setSelectedIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSimulate = async () => {
    if (selectedIds.length === 0) {
      setError('Select at least one subscription to cancel');
      return;
    }

    try {
      const response = await api.getWhatIf(selectedIds);
      setWhatIfResult(response.data);
      setError('');
    } catch (err) {
      setError('Simulation failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;
  if (!projections) return <div>No data</div>;

  return (
    <div style={panelStyle}>
      <h2>Subscription Simulator</h2>

      <div style={projectionsGridStyle}>
        <div style={cardStyle}>
          <div style={labelStyle}>3 Months</div>
          <div style={amountStyle}>${projections.threeMonthProjection.toFixed(2)}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>6 Months</div>
          <div style={amountStyle}>${projections.sixMonthProjection.toFixed(2)}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>12 Months</div>
          <div style={amountStyle}>${projections.twelveMonthProjection.toFixed(2)}</div>
        </div>
      </div>

      <div style={whatIfSectionStyle}>
        <h3>What-If Cancellation</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>Select subscriptions to cancel and see savings</p>

        <div style={checkboxContainerStyle}>
          {projections.subscriptions.map(sub => (
            <label key={sub.id} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedIds.includes(sub.id)}
                onChange={() => handleCheckboxChange(sub.id)}
              />
              {' '}{sub.name} - ${sub.monthlyEquivalent.toFixed(2)}/mo
            </label>
          ))}
        </div>

        <button onClick={handleSimulate} style={simulateBtn}>
          Simulate Cancellation
        </button>

        {whatIfResult && (
          <div style={resultStyle}>
            <h4>Results</h4>
            <div style={{ marginBottom: '10px' }}>
              <p><strong>Current Monthly:</strong> ${whatIfResult.originalMonthly.toFixed(2)}</p>
              <p><strong>New Monthly:</strong> ${whatIfResult.newMonthly.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#dcfce7', padding: '10px', borderRadius: '4px' }}>
              <p><strong>Monthly Savings:</strong> ${whatIfResult.monthlySavings.toFixed(2)}</p>
              <p><strong>Annual Savings:</strong> ${whatIfResult.annualSavings.toFixed(2)}</p>
              <p><strong>Percentage Saved:</strong> {whatIfResult.percentageSavings.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const panelStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px'
};

const projectionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px',
  marginBottom: '30px'
};

const cardStyle = {
  backgroundColor: '#f0f9ff',
  padding: '15px',
  borderRadius: '8px',
  textAlign: 'center',
  border: '1px solid #bfdbfe'
};

const labelStyle = {
  fontSize: '12px',
  color: '#666',
  marginBottom: '5px'
};

const amountStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0369a1'
};

const whatIfSectionStyle = {
  marginTop: '30px',
  padding: '15px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px'
};

const checkboxContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginY: '15px'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  cursor: 'pointer'
};

const simulateBtn = {
  backgroundColor: '#0369a1',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '15px',
  fontWeight: 'bold'
};

const resultStyle = {
  marginTop: '15px',
  padding: '15px',
  backgroundColor: '#fff',
  borderRadius: '4px',
  border: '1px solid #d1d5db'
};

const errorStyle = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '10px',
  borderRadius: '4px'
};

export default SimulationPanel;

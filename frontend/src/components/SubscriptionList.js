import React from 'react';

function SubscriptionList({ subscriptions, onDelete }) {
  if (subscriptions.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No subscriptions yet</p>;
  }

  return (
    <div style={tableContainerStyle}>
      <h2>Your Subscriptions</h2>
      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th>Name</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Billing</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub._id} style={trStyle}>
              <td>{sub.name}</td>
              <td style={{ textTransform: 'capitalize' }}>{sub.category}</td>
              <td>${sub.cost.toFixed(2)}</td>
              <td style={{ textTransform: 'capitalize' }}>{sub.billingCycle}</td>
              <td>
                <button
                  onClick={() => onDelete(sub._id)}
                  style={deleteBtnStyle}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableContainerStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const theadStyle = {
  backgroundColor: '#f3f4f6',
  borderBottom: '2px solid #d1d5db'
};

const trStyle = {
  borderBottom: '1px solid #e5e7eb',
  padding: '10px'
};

const deleteBtnStyle = {
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

export default SubscriptionList;

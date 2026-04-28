import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TotalCard from '../components/TotalCard';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import * as api from '../services/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.getSubs();
      setSubscriptions(response.data);
      setFilteredSubs(response.data);
    } catch (err) {
      console.log('Error fetching subs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubAdded = (newSub) => {
    setSubscriptions(prev => [newSub, ...prev]);
    setFilteredSubs(prev => [newSub, ...prev]);
  };

  const handleDelete = async (subId) => {
    try {
      await api.deleteSub(subId);
      setSubscriptions(prev => prev.filter(sub => sub._id !== subId));
      setFilteredSubs(prev => prev.filter(sub => sub._id !== subId));
    } catch (err) {
      console.log('Error deleting:', err);
    }
  };

  useEffect(() => {
    let filtered = subscriptions;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sub => sub.category === categoryFilter);
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.cost - b.cost;
      } else {
        return b.cost - a.cost;
      }
    });

    setFilteredSubs(filtered);
  }, [categoryFilter, sortOrder, subscriptions]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar user={user} />
      <div style={containerStyle}>
        <h1>Dashboard</h1>
        <TotalCard />

        <SubscriptionForm onSubAdded={handleSubAdded} />

        <div style={filterRowStyle}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Categories</option>
            <option value="entertainment">Entertainment</option>
            <option value="productivity">Productivity</option>
            <option value="utilities">Utilities</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={selectStyle}
          >
            <option value="asc">Cost: Low to High</option>
            <option value="desc">Cost: High to Low</option>
          </select>
        </div>

        <SubscriptionList subscriptions={filteredSubs} onDelete={handleDelete} />
      </div>
    </>
  );
}

const containerStyle = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '20px'
};

const filterRowStyle = {
  display: 'flex',
  gap: '15px',
  marginBottom: '20px'
};

const selectStyle = {
  padding: '8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontFamily: 'inherit'
};

export default DashboardPage;

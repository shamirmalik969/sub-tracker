import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Request interceptor to add token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });

export const getSubs = () =>
  api.get('/subscriptions');

export const addSub = (name, category, cost, billingCycle) =>
  api.post('/subscriptions', { name, category, cost, billingCycle });

export const deleteSub = (id) =>
  api.delete(`/subscriptions/${id}`);

export const getProjections = () =>
  api.get('/simulation/project');

export const getWhatIf = (excludeIds) =>
  api.get('/simulation/whatif', { params: { exclude: excludeIds.join(',') } });

export const getCategoryStats = () =>
  api.get('/subscriptions/stats/category');

export const getBillingStats = () =>
  api.get('/subscriptions/stats/billing');

export default api;

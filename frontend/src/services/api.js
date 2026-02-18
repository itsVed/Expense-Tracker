import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

export const expenseAPI = {
  createExpense: (expenseData, idempotencyKey) =>
    api.post('/expenses', expenseData, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getExpenses: (category = '', sort = 'date_desc') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    return api.get(`/expenses?${params.toString()}`);
  },
  getExpense: (id) => api.get(`/expenses/${id}`),
  updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getExpenseSummary: () => api.get('/expenses/summary/by-category'),
};

export default api;

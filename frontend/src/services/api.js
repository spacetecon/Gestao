import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Só fazer logout se for erro de autenticação E não for erro de senha incorreta
    if (error.response?.status === 401) {
      const isChangePasswordError = error.config?.url?.includes('/change-password');
      const isLoginError = error.config?.url?.includes('/login');
      
      // Não fazer logout se for erro de login ou senha incorreta
      if (!isChangePasswordError && !isLoginError) {
        // Token inválido ou expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// AUTH
// ========================================
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ========================================
// ACCOUNTS
// ========================================
export const accountService = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getSummary: () => api.get('/accounts/summary'),
};

// ========================================
// CATEGORIES
// ========================================
export const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ========================================
// TRANSACTIONS
// ========================================
export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getRecurring: () => api.get('/transactions/recurring'),
};

// ========================================
// DASHBOARD
// ========================================
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getByCategory: (params) => api.get('/dashboard/by-category', { params }),
  getBalanceHistory: (params) => api.get('/dashboard/balance-history', { params }),
  getRecentTransactions: (params) => api.get('/dashboard/recent-transactions', { params }),
};

export default api;
  
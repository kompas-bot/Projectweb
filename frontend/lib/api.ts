import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Add token to requests and handle Content-Type
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData, let browser handle it
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (data: { name: string; email: string; password?: string; password_confirmation?: string }) =>
    api.put('/profile', data),
};

// Book API
export const bookAPI = {
  list: (params?: { category_id?: number; keyword?: string; page?: number }) =>
    api.get('/books', { params }),
  get: (id: number) => api.get(`/books/${id}`),
  create: (data: FormData) => api.post('/books', data),
  update: (id: number, data: FormData) => {
    // Laravel doesn't support file upload with PUT, use POST with _method
    data.append('_method', 'PUT');
    return api.post(`/books/${id}`, data);
  },
  delete: (id: number) => api.delete(`/books/${id}`),
};

// Category API
export const categoryAPI = {
  list: () => api.get('/categories'),
  get: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string }) => api.post('/categories', data),
  update: (id: number, data: { name: string }) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Borrow API
export const borrowAPI = {
  list: (params?: { status?: string; category_id?: number; keyword?: string; page?: number }) =>
    api.get('/borrows', { params }),
  get: (id: number) => api.get(`/borrows/${id}`),
  create: (data: { book_id: number }) => api.post('/borrows', data),
  return: (id: number) => api.post(`/borrows/${id}/return`),
  updateStatus: (id: number, data: { status: string; admin_notes?: string }) =>
    api.put(`/borrows/${id}/status`, data),
};

// Admin API
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  exportTransactions: (params?: { status?: string; category_id?: number; keyword?: string }) =>
    api.get('/admin/export', { params, responseType: 'blob' }),
};

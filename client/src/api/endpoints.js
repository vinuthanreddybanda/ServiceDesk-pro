// ============================================
// API endpoint functions
// ============================================

import api from './axios.js';

// --- Auth ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// --- Tickets ---
export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  addNote: (id, data) => api.post(`/tickets/${id}/notes`, data),
  uploadAttachments: (id, formData) =>
    api.post(`/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (id, attachmentId) =>
    api.delete(`/tickets/${id}/attachments/${attachmentId}`),
};

// --- Assets ---
export const assetAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  transition: (id, data) => api.put(`/assets/${id}/transition`, data),
  assign: (id, data) => api.put(`/assets/${id}/assign`, data),
};

// --- Users ---
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  getAgents: () => api.get('/users/agents'),
};

// --- Categories ---
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// --- Priorities ---
export const priorityAPI = {
  getAll: () => api.get('/priorities'),
  create: (data) => api.post('/priorities', data),
  update: (id, data) => api.put(`/priorities/${id}`, data),
  delete: (id) => api.delete(`/priorities/${id}`),
};

// --- SLA Policies ---
export const slaAPI = {
  getAll: () => api.get('/sla-policies'),
  create: (data) => api.post('/sla-policies', data),
  update: (id, data) => api.put(`/sla-policies/${id}`, data),
  delete: (id) => api.delete(`/sla-policies/${id}`),
};

// --- Dashboard ---
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getAssets: () => api.get('/dashboard/assets'),
};

// --- Knowledge Base ---
export const knowledgeAPI = {
  getAll: (params) => api.get('/knowledge', { params }),
  getById: (id) => api.get(`/knowledge/${id}`),
  create: (data) => api.post('/knowledge', data),
  update: (id, data) => api.put(`/knowledge/${id}`, data),
  delete: (id) => api.delete(`/knowledge/${id}`),
  markHelpful: (id) => api.post(`/knowledge/${id}/helpful`),
};

// --- Notifications ---
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

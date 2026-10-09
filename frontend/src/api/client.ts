import axios from 'axios';
import { ApiResponse, RightsAuditLogEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinevault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('cinevault_token')) {
      localStorage.removeItem('cinevault_token');
      localStorage.removeItem('cinevault_user');
    }
    return Promise.reject(error);
  }
);

// High-level API methods
export const moviesApi = {
  getFeatured: () => apiClient.get<ApiResponse<any>>('/movies/featured').then((r) => r.data.data),
  getSections: () => apiClient.get<ApiResponse<any>>('/movies/sections').then((r) => r.data.data),
  getMovies: (params?: any) => apiClient.get<ApiResponse<any>>('/movies', { params }).then((r) => r.data),
  getByIdOrSlug: (idOrSlug: string) => apiClient.get<ApiResponse<any>>(`/movies/${idOrSlug}`).then((r) => r.data.data),
  getRelated: (id: string) => apiClient.get<ApiResponse<any>>(`/movies/${id}/related`).then((r) => r.data.data),
  search: (params: any) => apiClient.get<ApiResponse<any>>('/search', { params }).then((r) => r.data),
};

export const genresApi = {
  getAll: () => apiClient.get<ApiResponse<any>>('/genres').then((r) => r.data.data),
  getBySlug: (slug: string, params?: any) => apiClient.get<ApiResponse<any>>(`/genres/${slug}/movies`, { params }).then((r) => r.data),
};

export const watchlistApi = {
  getWatchlist: () => apiClient.get<ApiResponse<any>>('/watchlist').then((r) => r.data.data),
  add: (movieId: string) => apiClient.post<ApiResponse<any>>('/watchlist', { movieId }).then((r) => r.data),
  remove: (movieId: string) => apiClient.delete<ApiResponse<any>>(`/watchlist/${movieId}`).then((r) => r.data),
};

export const historyApi = {
  getHistory: () => apiClient.get<ApiResponse<any>>('/history').then((r) => r.data.data),
  getContinueWatching: () => apiClient.get<ApiResponse<any>>('/history/continue-watching').then((r) => r.data.data),
  updateProgress: (data: { movieId: string; progressSeconds: number; durationSeconds: number }) =>
    apiClient.post<ApiResponse<any>>('/history', data).then((r) => r.data),
  clear: () => apiClient.delete<ApiResponse<any>>('/history').then((r) => r.data),
};

export const reviewsApi = {
  getByMovie: (movieId: string, params?: any) =>
    apiClient.get<ApiResponse<any>>(`/movies/${movieId}/reviews`, { params }).then((r) => r.data),
  create: (movieId: string, data: { rating: number; content: string }) =>
    apiClient.post<ApiResponse<any>>(`/movies/${movieId}/reviews`, data).then((r) => r.data),
  update: (id: string, data: { rating?: number; content?: string }) =>
    apiClient.put<ApiResponse<any>>(`/reviews/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete<ApiResponse<any>>(`/reviews/${id}`).then((r) => r.data),
  getUserReviews: () => apiClient.get<ApiResponse<any>>('/reviews/my').then((r) => r.data.data),
};

export const adminApi = {
  getDashboard: () => apiClient.get<ApiResponse<any>>('/admin/dashboard').then((r) => r.data.data),
  getAnalytics: () => apiClient.get<ApiResponse<any>>('/admin/analytics').then((r) => r.data.data),
  getUsers: (params?: any) => apiClient.get<ApiResponse<any>>('/admin/users', { params }).then((r) => r.data),
  toggleUserStatus: (id: string) => apiClient.put<ApiResponse<any>>(`/admin/users/${id}/toggle-status`).then((r) => r.data),
  deleteUser: (id: string) => apiClient.delete<ApiResponse<any>>(`/admin/users/${id}`).then((r) => r.data),
  getReviews: (params?: any) => apiClient.get<ApiResponse<any>>('/admin/reviews', { params }).then((r) => r.data),
  moderateReview: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/admin/reviews/${id}/moderate`, data).then((r) => r.data),
  createMovie: (data: any) => apiClient.post<ApiResponse<any>>('/movies', data).then((r) => r.data),
  updateMovie: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/movies/${id}`, data).then((r) => r.data),
  deleteMovie: (id: string) => apiClient.delete<ApiResponse<any>>(`/movies/${id}`).then((r) => r.data),
  updateWorkflow: (id: string, targetStatus: string, reason: string) =>
    apiClient.put<ApiResponse<any>>(`/movies/${id}/workflow`, { targetStatus, reason }).then((r) => r.data),
  getRightsAuditLogs: (params?: any) =>
    apiClient.get<ApiResponse<RightsAuditLogEntry[]>>('/admin/rights-audit', { params }).then((r) => r.data.data),
};

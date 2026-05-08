import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`,
  timeout: 15000,
  withCredentials: true 
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ygb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to fetch and set CSRF token
// export const initCsrf = async () => {
//   try {
//     const { data } = await API.get('csrf-token');
//     API.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
//   } catch (err) {
//     console.error('Failed to initialize CSRF:', err);
//   }
// };

// Handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ygb_token');
      localStorage.removeItem('ygb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('auth/register', data),
  login: (data) => API.post('auth/login', data),
  getMe: () => API.get('auth/me'),
};

// ── User ──────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => API.get('user/profile'),
  updateProfile: (data) => API.put('user/profile', data),
  updatePassword: (data) => API.put('user/password', data),
  getWeightHistory: () => API.get('user/weight-history'),
  logWeight: (weight) => API.post('user/weight', { weight }),
  search: (q) => API.get('user/search', { params: { q } }),
  getPublicProfile: (username) => API.get(`user/u/${username}`),
  addProgressPhoto: (data) => API.post('user/progress-photo', data),
  getProgressPhotos: () => API.get('user/progress-photos'),
  deleteProgressPhoto: (id) => API.delete(`user/progress-photo/${id}`),
  verifyPromo: (code) => API.post('user/verify-promo', { code }),
  togglePrivacy: () => API.post('user/privacy'),
};

// ── Workouts ──────────────────────────────────────────────
export const workoutAPI = {
  create: (data) => API.post('workouts', data),
  getAll: (params) => API.get('workouts', { params }),
  getOne: (id) => API.get(`workouts/${id}`),
  update: (id, data) => API.put(`workouts/${id}`, data),
  delete: (id) => API.delete(`workouts/${id}`),
  getStats: (days) => API.get('workouts/stats', { params: { days } }),
  startFromTemplate: (templateId) => API.post(`workouts/start-from-template/${templateId}`),
};

// ── Diet ──────────────────────────────────────────────────
export const dietAPI = {
  calculate: (data) => API.post('diet/calculate', data),
  generateAi: (data) => API.post('diet/generate-ai', data),
  get: () => API.get('diet'),
  logMeal: (data) => API.post('diet/log', data),
  getTodaysLog: (date) => API.get('diet/logs/today', { params: { date } }),
  deleteLog: (id) => API.delete(`diet/logs/${id}`),
};

// ── Plans ──────────────────────────────────────────────────
export const plansAPI = {
  getWorkoutPlan: () => API.get('plans/workout'),
  getMuscleGroups: () => API.get('plans/muscle-groups'),
  getExercises: (muscleGroup) => API.get('plans/exercises', { params: { muscleGroup } }),
  getExercise: (id) => API.get(`plans/exercises/${id}`),
};

// ── Templates ─────────────────────────────────────────────
export const templatesAPI = {
  getAll: () => API.get('templates'),
  create: (data) => API.post('templates', data),
  update: (id, data) => API.put(`templates/${id}`, data),
  delete: (id) => API.delete(`templates/${id}`),
};

export default API;
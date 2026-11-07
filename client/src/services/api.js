import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token or Demo User ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('datelock_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const demoUserId = localStorage.getItem('datelock_demo_user_id');
  if (demoUserId) {
    config.headers['x-demo-user-id'] = demoUserId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication
export const authApi = {
  login: (email, password, adminSecurityKey = null) => api.post('/auth/login', { email, password, adminSecurityKey }),
  register: (data) => api.post('/auth/register', data),
  sendOtp: (email, purpose = 'registration') => api.post('/auth/send-otp', { email, purpose }),
  verifyOtp: (email, otp, purpose = 'registration') => api.post('/auth/verify-otp', { email, otp, purpose }),
  switchDemo: (role, studentIndex, adminSecretKey = null) => api.post('/auth/switch-demo', { role, studentIndex, adminSecretKey }),
  getMe: () => api.get('/auth/me')
};

// Colleges & Interests
export const collegeApi = {
  getColleges: () => api.get('/colleges'),
  getInterests: () => api.get('/colleges/interests')
};

// Profiles
export const profileApi = {
  getMyProfile: () => api.get('/profiles/me'),
  getProfile: (userId) => api.get(`/profiles/${userId}`),
  updateProfile: (data) => api.put('/profiles/update', data),
  uploadImage: (image, type = 'photo') => api.post('/profiles/upload', { image, type })
};

// Discovery
export const discoverApi = {
  getCandidates: (params) => api.get('/discover', { params })
};

// Likes & Matches
export const likeApi = {
  sendLike: (targetUserId, type = 'like') => api.post('/likes', { targetUserId, type }),
  undoLastAction: () => api.post('/likes/undo')
};

export const matchApi = {
  getMatches: () => api.get('/matches'),
  unmatch: (matchId) => api.post(`/matches/${matchId}/unmatch`)
};

// Messaging & Reactions
export const messageApi = {
  getConversation: (matchId) => api.get(`/messages/${matchId}`),
  sendMessage: (matchId, content) => api.post('/messages/send', { matchId, content }),
  reactToMessage: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  searchMessages: (matchId, q) => api.get(`/messages/${matchId}/search`, { params: { q } })
};

// Notifications (PRD Section 5.8)
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// Verification
export const verificationApi = {
  getStatus: () => api.get('/verification/status'),
  submitVerification: (data) => api.post('/verification/submit', data),
  sendCollegeOtp: (collegeEmail, collegeId) => api.post('/verification/send-college-otp', { collegeEmail, collegeId }),
  verifyCollegeOtp: (collegeEmail, otp) => api.post('/verification/verify-college-otp', { collegeEmail, otp })
};

// Safety & Moderation
export const safetyApi = {
  reportUser: (data) => api.post('/safety/report', data),
  blockUser: (targetUserId) => api.post('/safety/block', { targetUserId }),
  unblockUser: (targetUserId) => api.post('/safety/unblock', { targetUserId }),
  getBlockedUsers: () => api.get('/safety/blocks')
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getVerifications: () => api.get('/admin/verifications'),
  updateVerification: (id, data) => api.put(`/admin/verifications/${id}`, data),
  getReports: () => api.get('/admin/reports'),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getActions: () => api.get('/admin/actions'),
  resetDemoData: () => api.post('/admin/reset-demo')
};

export default api;

// src/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ================================
// AUTH
// ================================
export const login          = (data) => api.post("/auth/login", data);
export const register       = (data) => api.post("/auth/register", data);
export const logout         = ()     => api.post("/auth/logout");

// ================================
// STUDENTS
// ================================
export const getStudentById      = (studentId) => api.get(`/students/${studentId}`);
export const updateStudentProfile= (studentId, data) => api.put(`/students/${studentId}`, data);
export const getStudentStatus    = (studentId) => api.get(`/students/${studentId}/status`);

// ================================
// DEVICES
// ================================
export const getAllDevices        = (filters = {}) => api.get("/devices", { params: filters });
export const getDeviceById       = (deviceId)     => api.get(`/devices/${deviceId}`);
export const addDevice           = (data)          => api.post("/devices", data);
export const updateDevice        = (deviceId, data)=> api.put(`/devices/${deviceId}`, data);
export const updateDeviceStatus  = (deviceId, data)=> api.put(`/devices/${deviceId}/status`, data);
export const deleteDevice        = (deviceId)      => api.delete(`/devices/${deviceId}`);

// ================================
// BORROW REQUESTS
// ================================
export const createBorrowRequest    = (data)                  => api.post("/borrow/request", data);
export const approveBorrowRequest   = (borrowId, approvedBy)  => api.put(`/borrow/approve/${borrowId}`, { approved_by: approvedBy });
export const rejectBorrowRequest    = (borrowId, approvedBy)  => api.put(`/borrow/reject/${borrowId}`,  { approved_by: approvedBy });
export const returnDevice           = (borrowId, data)        => api.put(`/borrow/return/${borrowId}`, data);
export const getBorrowHistory       = (studentId)             => api.get(`/borrow/history/${studentId}`);
export const getPendingBorrowRequests = ()                    => api.get("/borrow/pending");
export const getActiveBorrows       = ()                      => api.get("/borrow/active");
export const submitBorrowReview     = (borrowId, data)        => api.put(`/borrow/${borrowId}/review`, data);

// ================================
// DAMAGE REPORTS
// ================================
export const reportDamage       = (data)     => api.post("/damage/report", data);
export const getDamageReports   = ()         => api.get("/damage");
export const getPendingDamages  = ()         => api.get("/damage/pending");
export const getDamageById      = (id)       => api.get(`/damage/${id}`);
export const reviewDamage       = (id, data) => api.put(`/damage/${id}/review`, data);
export const resolveDamage      = (id, data) => api.put(`/damage/${id}/resolve`, data);

// ================================
// FINES
// ================================
export const getMyFines         = ()          => api.get("/fines/my-fines");
export const getFinesByStudent  = (studentId) => api.get(`/fines/student/${studentId}`);
export const applyFine          = (data)      => api.post("/fines", data);
export const payFine            = (id)        => api.put(`/fines/${id}/pay`);
export const waiveFine          = (id, data)  => api.put(`/fines/${id}/waive`, data);
export const getOverdueFines    = ()          => api.get("/fines/overdue");

// ================================
// NOTIFICATIONS
// ================================
export const getNotifications        = ()  => api.get("/notifications");
export const getUnreadNotifications  = ()  => api.get("/notifications/unread");
export const markNotificationRead    = (id)=> api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead= ()  => api.put("/notifications/read-all");
export const deleteNotification      = (id)=> api.delete(`/notifications/${id}`);

// ================================
// WAITLIST
// ================================
export const joinWaitlist        = (data)      => api.post("/waitlist/join", data);
export const leaveWaitlist       = (id)        => api.delete(`/waitlist/${id}/leave`);
export const getWaitlistByDevice = (deviceId)  => api.get(`/waitlist/device/${deviceId}`);
export const getMyWaitlist       = ()          => api.get("/waitlist/my-waitlist");
export const getWaitlistPosition = (deviceId)  => api.get(`/waitlist/position/${deviceId}`);

// ================================
// OWNER (Lender Dashboard)
// ================================
export const getOwnerDashboard  = ()          => api.get("/owner/dashboard");
export const getOwnedDevices    = ()          => api.get("/owner/devices");
export const addOwnedDevice     = (data)      => api.post("/owner/devices", data);
export const updateOwnedDevice  = (id, data)  => api.put(`/owner/devices/${id}`, data);
export const deleteOwnedDevice  = (id)        => api.delete(`/owner/devices/${id}`);
export const getActiveLends     = ()          => api.get("/owner/active-lends");
export const getLendHistory     = ()          => api.get("/owner/lend-history");

// ================================
// BROADCAST
// ================================
export const createBroadcast     = (data)     => api.post("/broadcast", data);
export const getAllBroadcasts    = ()          => api.get("/broadcast");
export const getBroadcastById    = (id)       => api.get(`/broadcast/${id}`);
export const respondToBroadcast  = (id, data) => api.post(`/broadcast/${id}/respond`, data);
export const closeBroadcast      = (id)       => api.put(`/broadcast/${id}/close`);

// ================================
// STATS (Admin Dashboard)
// ================================
export const getSystemStats  = ()  => api.get("/stats");
export const getStudentStats = ()  => api.get("/stats/students");
export const getDeviceStats  = ()  => api.get("/stats/devices");

// ================================
// ADMIN — User Management
// ================================
export const getAllStudents      = ()          => api.get("/admin/students");
export const getAdminDashboard   = ()          => api.get("/admin/dashboard");
export const suspendStudent      = (id, data)  => api.put(`/admin/students/${id}/suspend`, data);
export const unsuspendStudent    = (id)        => api.put(`/admin/students/${id}/unsuspend`);
export const restrictStudent     = (id)        => api.put(`/admin/students/${id}/restrict`);
export const unrestrictStudent   = (id)        => api.put(`/admin/students/${id}/unrestrict`);

// ================================
// AUDIT LOGS (Admin only)
// ================================
export const getAuditLogs = (filters = {}) => api.get("/audit", { params: filters });
export const addAuditLog  = (data)         => api.post("/audit", data);

export default api;
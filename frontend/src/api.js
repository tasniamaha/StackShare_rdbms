import axios from "axios";

// Base URL of your backend
const API_BASE_URL = "http://localhost:5000/api"; // Change if your backend is hosted elsewhere

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach auth token from localStorage to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ================= Borrowers =================

// Get borrower info by ID
export const getStudentById = (studentId) => api.get(`/students/${studentId}`);

// Update borrower profile
export const updateStudentProfile = (studentId, data) => api.put(`/students/${studentId}`, data);

// Get borrower status (borrow, reputation, suspended)
export const getStudentStatus = (studentId) => api.get(`/students/${studentId}/status`);

// ================= Devices =================

// Get all devices (optional filters: category, status)
export const getAllDevices = (filters = {}) => api.get("/devices", { params: filters });

// Get single device by ID
export const getDeviceById = (deviceId) => api.get(`/devices/${deviceId}`);

// Add new device (admin only)
export const addDevice = (data) => api.post("/devices", data);

// Update device status/condition (admin only)
export const updateDeviceStatus = (deviceId, data) => api.put(`/devices/${deviceId}/status`, data);

// Delete device (admin only)
export const deleteDevice = (deviceId) => api.delete(`/devices/${deviceId}`);

// ================= Borrow Requests =================

// Create borrow request (student)
export const createBorrowRequest = (data) => api.post("/borrow/request", data);

// Approve borrow request (admin)
export const approveBorrowRequest = (borrowId, approvedBy) =>
  api.put(`/borrow/approve/${borrowId}`, { approved_by: approvedBy });

// Reject borrow request (admin)
export const rejectBorrowRequest = (borrowId, approvedBy) =>
  api.put(`/borrow/reject/${borrowId}`, { approved_by: approvedBy });

// Return device
export const returnDevice = (borrowId, data) => api.put(`/borrow/return/${borrowId}`, data);

// Get borrow history for a student
export const getBorrowHistory = (studentId) => api.get(`/borrow/history/${studentId}`);

// Get all pending borrow requests (admin)
export const getPendingBorrowRequests = () => api.get(`/borrow/pending`);

// ================= Audit Logs =================

// Get audit logs (admin)
export const getAuditLogs = (filters = {}) => api.get("/audit", { params: filters });

// Add manual audit log (admin)
export const addAuditLog = (data) => api.post("/audit", data);

// ================= Auth =================

// Admin login
export const adminLogin = (data) => api.post("/auth/login", data);

export default api;

// src/components/devices/device.api.js
import axios from 'axios';
import { getAuthHeader } from '../utils/authStorage'; // your auth helper

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/devices';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add Bearer token to every request
api.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
}, (error) => Promise.reject(error));

// ────────────────────────────────────────────────
// Device API Functions
// ────────────────────────────────────────────────

/**
 * Get all devices (with optional filters/pagination)
 * @param {object} params - query params (category, status, search, page, limit, etc.)
 * @returns {Promise<{ devices: array, total: number, page: number, limit: number }>}
 */
export const getAllDevices = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('getAllDevices failed:', error);
    throw error.response?.data || new Error('Failed to fetch devices');
  }
};

/**
 * Get a single device by ID (for DeviceDetails page)
 * @param {string|number} deviceId
 * @returns {Promise<object>} full device details
 */
export const getDeviceById = async (deviceId) => {
  try {
    const response = await api.get(`/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`getDeviceById(${deviceId}) failed:`, error);
    throw error.response?.data || new Error('Device not found');
  }
};

/**
 * Create a new device (owner only)
 * @param {object} deviceData
 * @returns {Promise<object>} created device
 */
export const createDevice = async (deviceData) => {
  try {
    const response = await api.post('/', deviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to create device');
  }
};

/**
 * Update device (owner only)
 * @param {string|number} deviceId
 * @param {object} updates
 * @returns {Promise<object>} updated device
 */
export const updateDevice = async (deviceId, updates) => {
  try {
    const response = await api.put(`/${deviceId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to update device');
  }
};

/**
 * Delete device (owner/admin only)
 * @param {string|number} deviceId
 */
export const deleteDevice = async (deviceId) => {
  try {
    await api.delete(`/${deviceId}`);
  } catch (error) {
    throw error.response?.data || new Error('Failed to delete device');
  }
};

/**
 * Search devices
 * @param {string} query
 * @param {object} filters
 * @returns {Promise<array>}
 */
export const searchDevices = async (query = '', filters = {}) => {
  try {
    const params = { q: query, ...filters };
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Search failed');
  }
};

/**
 * Get devices owned by current user
 * @returns {Promise<array>}
 */
export const getMyDevices = async () => {
  try {
    const response = await api.get('/my-devices');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch your devices');
  }
};

/**
 * Get device availability
 * @param {string|number} deviceId
 * @returns {Promise<object>}
 */
export const getDeviceAvailability = async (deviceId) => {
  try {
    const response = await api.get(`/${deviceId}/availability`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch availability');
  }
};

/**
 * Toggle device availability
 * @param {string|number} deviceId
 * @param {boolean} isAvailable
 */
export const toggleDeviceAvailability = async (deviceId, isAvailable) => {
  try {
    const response = await api.patch(`/${deviceId}/availability`, { available: isAvailable });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to update availability');
  }
};

export default {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  searchDevices,
  getMyDevices,
  getDeviceAvailability,
  toggleDeviceAvailability,
};
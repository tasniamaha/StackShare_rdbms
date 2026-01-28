// src/components/api/apiClient.js
import axios from "axios";
import { getAuthToken, clearAuth } from "../utils/authStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT token to every request (if exists)
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // use authStorage utility
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid
    if (error.response?.status === 401) {
      clearAuth(); // remove token & user data
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

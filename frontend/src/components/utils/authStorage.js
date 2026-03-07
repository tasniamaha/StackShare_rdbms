// D:\StackShare\frontend\src\components\utils\authStorage.js

const TOKEN_KEY = 'stackshare_token';
const USER_KEY = 'stackshare_user';

/**
 * Save authentication data to localStorage
 * @param {string} token - JWT token
 * @param {object} user - User object (should contain at least student_email or id)
 */
export const setAuth = (token, user) => {
  if (!token || typeof token !== 'string') {
    console.warn('setAuth: Invalid or missing token');
    return;
  }

  if (!user || typeof user !== 'object') {
    console.warn('setAuth: Invalid or missing user object');
    return;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('Auth data saved successfully');
  } catch (err) {
    console.error('Failed to save auth data to localStorage:', err);
  }
};

/**
 * Get the stored JWT token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the stored user object
 * @returns {object|null}
 */
export const getAuthUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    const user = JSON.parse(userJson);

    // Basic validation - you can extend this
    if (!user || typeof user !== 'object' || !user.student_email) {
      console.warn('getAuthUser: Invalid user structure - clearing');
      clearAuth();
      return null;
    }

    return user;
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    clearAuth(); // Clean up corrupted data
    return null;
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!token && !!user;
};

/**
 * Get Authorization header value for API requests
 * @returns {string|null} "Bearer <token>" or null
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  console.log('Auth data cleared');
};

/**
 * Optional: Check if token might be expired (client-side approximation)
 * Useful only if your backend includes exp claim and you decode it
 * @returns {boolean} true if token looks expired
 */
export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // convert to ms
    return Date.now() >= exp;
  } catch (err) {
    console.warn('Cannot parse token expiration:', err);
    return true; // assume expired if can't read
  }
};
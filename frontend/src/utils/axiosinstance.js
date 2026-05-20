import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//HELPER: Validate UUID format
const isValidUUID = (str) => {
  return typeof str === 'string' && 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token") || sessionStorage.getItem('token');
    const guestSessionId = localStorage.getItem('guestSessionId');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      delete config.headers['x-guest-session'];
    }
    else if (guestSessionId && isValidUUID(guestSessionId)) {
      config.headers['x-guest-session'] = guestSessionId;
      delete config.headers.Authorization;
    } 
    else {
      console.warn('No valid auth, generating new guest session...');
      
      // Generate new UUID
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        guestSessionId = crypto.randomUUID();
      } else {
        // Fallback manual UUID
        guestSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      
      localStorage.setItem('guestSessionId', guestSessionId);
      config.headers['x-guest-session'] = guestSessionId;
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 500) {
        console.log("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
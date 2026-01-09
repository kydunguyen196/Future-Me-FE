import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

/**
 * Axios instance with global error handling and toast notifications
 * 
 * Features:
 * - Automatic authentication headers (x-one-time-uuid, x-event-time)
 * - Global error handling with toast notifications using response.data.errorMessage
 * - Automatic redirect to login on 401 errors
 * - Skip global error toast by setting skipGlobalErrorToast: true in request config
 * 
 * Examples:
 * ```typescript
 * // Normal request (will show toast on error)
 * api.get('/endpoint');
 * 
 * // Skip global error toast (handle error manually)
 * api.get('/endpoint', { skipGlobalErrorToast: true });
 * 
 * // Using utility function
 * import { skipErrorToast } from '@/lib/utils';
 * api.get('/endpoint', skipErrorToast());
 * ```
 */

// Navigation handler for session expiration
let sessionExpiredHandler: (() => void) | null = null;

// Function to set the session expired handler (called from App component)
export const setSessionExpiredHandler = (handler: () => void) => {
  sessionExpiredHandler = handler;
};

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
  withCredentials: true, // Important for handling cookies
});

// Request interceptor to add required headers (cookies are handled automatically)
api.interceptors.request.use(
  (config) => {
    // Add required headers for your API
    config.headers['x-one-time-uuid'] = uuidv4();
    config.headers['x-event-time'] = new Date().toISOString();
    
    // FIXED: Only set Content-Type for non-FormData requests
    // FormData requests need the browser to set Content-Type automatically with boundary
    const isFormData = config.data instanceof FormData;
    
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    // For FormData, don't set Content-Type at all - let the browser handle it
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors and global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses (cookie expired/invalid)
    if (error.response?.status === 401) {
      // Authentication failed - cookies are invalid or expired
      console.error('Authentication failed - cookies invalid or expired');
      
      // Clear any stored user data (cookies are cleared by server)
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      
      // Clear Redux persist store and handle logout
      import('@/redux/store').then(({ store, persistor }) => {
        // Clear the auth state
        store.dispatch({ type: 'auth/logout' });
        persistor.purge();
      });
      
      // Show toast for authentication error
      toast.error('Session expired. Please login again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Use the session expired handler if available, otherwise fallback to location.replace
      if (sessionExpiredHandler) {
        sessionExpiredHandler();
      } else {
        // Fallback: use replace to avoid adding to history but still without full reload
        window.location.replace('/auth/login');
      }
      
      return Promise.reject(error);
    }

    // Global error handling with toast notifications
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorData = error.response.data;
      
      // Extract error message using various possible keys
      let errorMessage = errorData?.errorMessage || 
                        errorData?.message || 
                        errorData?.error || 
                        errorData?.errors?.[0]?.message ||
                        `Request failed with status ${error.response.status}`;
      
      // Show toast notification for all non-401 errors
      // Skip showing toast if the error is handled by specific components
      const skipToast = error.config?.skipGlobalErrorToast;
      if (!skipToast) {
        toast.error(errorMessage);
      }
      
      console.error('API Error:', {
        status: error.response.status,
        message: errorMessage,
        url: error.config?.url,
        method: error.config?.method
      });
    } else if (error.request) {
      // The request was made but no response was received (network error)
      const networkErrorMessage = 'Network error. Please check your internet connection and try again.';
      
      const skipToast = error.config?.skipGlobalErrorToast;
      if (!skipToast) {
        toast.error(networkErrorMessage);
      }
      
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      const setupErrorMessage = error.message || 'An unexpected error occurred. Please try again.';
      
      const skipToast = error.config?.skipGlobalErrorToast;
      if (!skipToast) {
        toast.error(setupErrorMessage);
      }
      
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
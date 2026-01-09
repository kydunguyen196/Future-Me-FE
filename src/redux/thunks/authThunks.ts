import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../slices/authSlice';
import api from '@/lib/axios';
import { skipErrorToast } from '@/lib/utils';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  role: string;
  education: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
  email?: string; // Optional email for additional validation
}

interface LoginResponse {
  user: User;
  token: string;
}

// API response structure
interface ApiResponse {
  result: string;
  correlationId: string;
  data: {
    accountId: string;
    avatar: string | null;
    email: string;
    username: string;
    role: string;
    fullName: string;
    status: string;
  };
  token?: string;
}

// Create the login async thunk
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use configured axios instance for login (skip global error toast since we handle errors)
      const response = await api.post<ApiResponse>(
        '/auth/login',
        credentials,
        skipErrorToast()
      );
      
      // Extract user data from the nested response structure
      const responseData = response.data;
      
      // Check if we have the expected response structure
      if (responseData.result !== 'OK' || !responseData.data) {
        console.error('Invalid API response format:', responseData);
        return rejectWithValue('Invalid response format from server');
      }
      
      const userData = responseData.data;
      console.log('User data from API:', userData);
      
      // With cookie-based auth, no need to extract token from response
      // Authentication is handled automatically by cookies
      
      // Prepare the user data - important to create a new object that's not directly part of the response
      // This ensures proper serialization
      const user: User = {
        accountId: userData.accountId,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        status: userData.status,
        fullName: userData.fullName,
        avatar: userData.avatar // Include avatar from API response
      };
      
      // Log user data for debugging
      console.log('User data prepared for Redux:', user);
      
      // Store user role for admin check (keep for compatibility)
      if (user.role === 'ADMIN' || user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
      }
      
      // Store user info for redundancy (keep for compatibility)
      localStorage.setItem('userFullName', user.fullName);
      localStorage.setItem('userEmail', user.email);
      
      return {
        user,
        token: 'cookie-auth' // Placeholder since cookies handle auth
      };
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        console.error('Login error response:', errorData);
        
        // Extract error message - different APIs structure this differently
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.errors?.[0]?.message || 
          'Invalid credentials';
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error:', error.request);
        return rejectWithValue('Network error. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        return rejectWithValue(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  }
);

// Create the register async thunk
export const registerUser = createAsyncThunk<
  LoginResponse,
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (registrationData, { rejectWithValue }) => {
    try {
      // Use configured axios instance for registration (skip global error toast since we handle errors)
      const response = await api.post<ApiResponse>(
        '/auth/register',
        registrationData,
        skipErrorToast()
      );
      
      // Extract user data from the nested response structure
      const responseData = response.data;
      
      // Check if we have the expected response structure
      if (responseData.result !== 'OK' || !responseData.data) {
        console.error('Invalid API response format:', responseData);
        return rejectWithValue('Invalid response format from server');
      }
      
      const userData = responseData.data;
      console.log('User data from API after registration:', userData);
      
      // With cookie-based auth, no need to extract token from response
      // Authentication is handled automatically by cookies
      
      // Prepare the user data - new users should have UNVERIFIED status
      const user: User = {
        accountId: userData.accountId,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        status: userData.status || 'UNVERIFIED', // Default to UNVERIFIED for new users
        fullName: userData.fullName,
        avatar: userData.avatar // Include avatar from API response
      };
      
      // Log user data for debugging
      console.log('User data prepared for Redux after registration:', user);
      
      // Store user role for admin check (keep for compatibility)
      if (user.role === 'ADMIN' || user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
      }
      
      // Store user info for redundancy (keep for compatibility)
      localStorage.setItem('userFullName', user.fullName);
      localStorage.setItem('userEmail', user.email);
      
      return {
        user,
        token: 'cookie-auth' // Placeholder since cookies handle auth
      };
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        console.error('Registration error response:', errorData);
        
        // Extract error message - different APIs structure this differently
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.errors?.[0]?.message || 
          'Registration failed';
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error:', error.request);
        return rejectWithValue('Network error. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        return rejectWithValue(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  }
);

// Create the reset password async thunk
export const resetPassword = createAsyncThunk<
  { message: string },
  ResetPasswordData,
  { rejectValue: string }
>(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
  try {
      // Call /auth/password/forget/change API using configured instance
      const response = await api.post(
        '/auth/password/forget/change',
        {
          token: resetData.token,
          newPassword: resetData.newPassword,
          ...(resetData.email && { email: resetData.email }) // Include email if provided
        },
        skipErrorToast()
      );
      
      // Check if the response has the expected structure
      if (response.data.result === 'OK') {
        return { message: 'Password reset successfully' };
      } else {
        const errorMessage = response.data.message || 'Failed to reset password';
        return rejectWithValue(errorMessage);
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          'Failed to reset password';
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        return rejectWithValue('Network error. Please check your internet connection and try again.');
      } else {
        return rejectWithValue(error.message || 'An unexpected error occurred. Please try again.');
      }
    }
  }
);

// Fix the logoutUser thunk to remove unused parameter
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    // TODO: Call logout API if needed
    // const response = await api.post('/auth/logout');
    
    // Clear localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    
    return { message: 'Logout successful' };
  } catch (error) {
    // Even if logout fails, we still clear local state
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    return { message: 'Logout completed' };
  }
}); 
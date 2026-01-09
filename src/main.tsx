import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import { loginSuccess } from './redux/slices/authSlice'
import './lib/axios' // Import axios configuration to set up interceptors
import api from '@/lib/axios'
import './utils/debugAuth' // Import debug utilities
import './utils/debugPersist' // Import persistence debug utilities
import DisableDevtool from 'disable-devtool';
import './i18n'
import './index.css'
import App from './App.tsx'
import { configureFonts } from './lib/fonts'

// API response interface for user profile
interface ProfileResponse {
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
}

// Theme and language initialization
const initializeApp = async () => {
  // Configure fonts
  configureFonts();

  // Initialize developer tools protection and disable responsive
  if (import.meta.env.IS_PRODUCTION) {
    DisableDevtool({
      url: 'https://www.google.com',
      disableCut: true,
      disableCopy: true,
      disablePaste: true,
      clearLog: true,
      ondevtoolopen(type, next){
        alert('Devtool opened with type:' + type);
        next();
    }
    });
  }
  // devToolsDisabler.disableResponsive();

  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme');
  
  // Only apply dark mode if explicitly set to 'dark'
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    // Default to light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  // Initialize language from localStorage or set default
  const storedLanguage = localStorage.getItem('language');
  if (!storedLanguage) {
    localStorage.setItem('language', 'en');
  }
  
  // Note: With redux-persist, user data will be automatically rehydrated from localStorage
  // Only validate session if we have persisted auth data
  const persistedAuth = localStorage.getItem('persist:auth');
  if (persistedAuth) {
    try {
      const authData = JSON.parse(persistedAuth);
      const isAuthenticated = authData.isAuthenticated ? JSON.parse(authData.isAuthenticated) : false;
      
      if (isAuthenticated) {
        // Optional: validate session with a lightweight API call
        // This checks if the authentication cookies are still valid
        try {
          const response = await api.get<ProfileResponse>('/id/account/info');
          
          // Check if the response has the expected structure
          if (response.data.result === 'OK' && response.data.data) {
            const userData = response.data.data;
            
            // Update Redux store with fresh user data (only if different)
            const currentUser = authData.user ? JSON.parse(authData.user) : null;
            if (!currentUser || currentUser.status !== userData.status) {
              store.dispatch(loginSuccess({
                user: {
                  accountId: userData.accountId,
                  email: userData.email,
                  username: userData.username,
                  role: userData.role,
                  status: userData.status,
                  fullName: userData.fullName
                },
                token: 'cookie-auth' // Placeholder since cookies handle auth
              }));
            }
            
            console.log('Session validated and user profile loaded:', userData.fullName);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          // Don't clear persisted data immediately - let user try to use the app
          // Only clear if there's a 401 or similar auth error
          if ((error as any)?.response?.status === 401) {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userFullName');
            localStorage.removeItem('userEmail');
            persistor.purge();
          }
        }
      }
    } catch (error) {
      console.error('Error parsing persisted auth data:', error);
      // Clear corrupted data
      persistor.purge();
    }
  }
};

// Run initialization
initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
});

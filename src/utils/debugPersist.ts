// Debug utility for Redux persistence
export const debugPersist = {
  // Check what's stored in localStorage
  checkStorage: () => {
    console.log('🔍 Redux Persist Debug:');
    
    // Check for persist:auth key
    const persistedAuth = localStorage.getItem('persist:auth');
    if (persistedAuth) {
      try {
        const parsed = JSON.parse(persistedAuth);
        console.log('✅ Persisted auth data found:', parsed);
        
        // Check if user data is properly stored
        if (parsed.user) {
          const user = JSON.parse(parsed.user);
          console.log('👤 User data:', user);
        }
        
        if (parsed.isAuthenticated) {
          console.log('🔐 Is authenticated:', JSON.parse(parsed.isAuthenticated));
        }
        
        if (parsed.token) {
          console.log('🎫 Token stored:', JSON.parse(parsed.token) ? 'Yes' : 'No');
        }
      } catch (error) {
        console.error('❌ Error parsing persisted data:', error);
      }
    } else {
      console.log('❌ No persisted auth data found');
    }
    
    // Check other localStorage items
    console.log('📦 Other localStorage items:');
    console.log('- isAdmin:', localStorage.getItem('isAdmin'));
    console.log('- userFullName:', localStorage.getItem('userFullName'));
    console.log('- userEmail:', localStorage.getItem('userEmail'));
  },

  // Clear all persistence data
  clearAll: () => {
    console.log('🧹 Clearing all persistence data...');
    localStorage.removeItem('persist:auth');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    console.log('✅ All persistence data cleared');
  },

  // Check Redux store state
  checkStoreState: (store: any) => {
    const state = store.getState();
    console.log('🏪 Current Redux state:');
    console.log('- auth.user:', state.auth.user);
    console.log('- auth.isAuthenticated:', state.auth.isAuthenticated);
    console.log('- auth.token:', state.auth.token);
    console.log('- _persist:', state.auth._persist);
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugPersist = debugPersist;
} 
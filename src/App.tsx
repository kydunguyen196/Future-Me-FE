import { BrowserRouter, useRoutes, useNavigate } from 'react-router-dom'
import { NavigationProvider } from './contexts/NavigationContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRoutes from './routes/approute'
import './App.css'
import { Suspense, useEffect } from 'react'
import { AccountVerificationCheck } from './components/AccountVerificationCheck'
import { setSessionExpiredHandler } from './lib/axios'
import SEBGuard from './components/SEBGuard'

// Router component that uses the AppRoutes configuration
const AppRouter = () => {
  const routeElement = useRoutes(AppRoutes);
  const navigate = useNavigate();

  // Set up session expired handler
  useEffect(() => {
    const handleSessionExpired = () => {
      // Navigate to login without page reload
      navigate('/auth/login', { replace: true });
    };

    setSessionExpiredHandler(handleSessionExpired);

    // Cleanup
    return () => {
      setSessionExpiredHandler(() => {});
    };
  }, [navigate]);

  return routeElement;
};

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        {/* Toast notifications */}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Account verification check */}
        <AccountVerificationCheck />
        
        {/* Safe Exam Browser Guard - protects exam-related routes */}
        <SEBGuard 
          protectedRoutes={['/test', '/exam', '/protected/test', '/protected/exam']}
          customErrorMessage="This exam platform requires Safe Exam Browser to ensure academic integrity and security."
        >
          {/* Main application routes with fallback during initial load */}
          <Suspense fallback={<div className="p-8 flex justify-center">Loading application...</div>}>
            <AppRouter />
          </Suspense>
        </SEBGuard>
      </NavigationProvider>
    </BrowserRouter>
  )
}

export default App

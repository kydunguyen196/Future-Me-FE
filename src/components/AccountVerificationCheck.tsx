import { useState, useEffect } from 'react';
import { AccountVerificationModal } from './ui/AccountVerificationModal';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useLocation } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { loginSuccess, logout } from '@/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export function AccountVerificationCheck() {
  const { user, isAuthenticated, token } = useAppSelector(state => state.auth);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the user needs verification when auth state or location changes
  useEffect(() => {
    // Check if current path is NOT an auth page (not starting with /auth)
    const isAuthPage = location.pathname.startsWith('/auth');
    
    // Debug logging
    console.log('AccountVerificationCheck - Debug Info:', {
      isAuthenticated,
      userStatus: user?.status,
      isAuthPage,
      pathname: location.pathname,
      userEmail: user?.email,
      shouldShowModal: isAuthenticated && user && user.status === 'UNVERIFIED' && !isAuthPage
    });
    
    // Show modal if user is authenticated, unverified, and NOT on auth pages
    if (isAuthenticated && user && user.status === 'UNVERIFIED' && !isAuthPage) {
      console.log('Showing verification modal for unverified user');
      setShowVerificationModal(true);
    } else {
      setShowVerificationModal(false);
    }
  }, [isAuthenticated, user, location.pathname]);

  const handleVerificationSuccess = async () => {
    try {
      // Update user profile to get the latest status
      const response = await api.get('/id/account/info');

      if (response.data.result === 'OK' && response.data.data) {
        const userData = response.data.data;
        
        // Update Redux store with fresh user data (including updated status)
        dispatch(loginSuccess({
          user: {
            ...user!,
            status: userData.status // This should now be 'ACTIVE' or similar
          },
          token: token!
        }));
        
        toast.success('Your account has been verified successfully!');
        setShowVerificationModal(false);
      }
    } catch (error) {
      console.error('Error updating user profile after verification:', error);
      // Close the modal anyway, user will have to try again later
      setShowVerificationModal(false);
    }
  };

  const handleBackToLogin = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  // Don't render anything if verification is not needed
  if (!showVerificationModal) return null;

  return (
    <AccountVerificationModal
      email={user?.email || ''}
      onVerificationSuccess={handleVerificationSuccess}
      onBackToLogin={handleBackToLogin}
    />
  );
} 
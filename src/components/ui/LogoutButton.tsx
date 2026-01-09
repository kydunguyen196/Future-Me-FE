import { useAppDispatch } from '@/redux/hooks';
import { logoutUser } from '@/redux/thunks/authThunks';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { persistor } from '@/redux/store';

interface LogoutButtonProps {
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function LogoutButton({ 
  showIcon = true, 
  children, 
  className,
  variant = 'ghost',
  ...props 
}: LogoutButtonProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    // Call the logout thunk
    await dispatch(logoutUser());
    
    // Clear any additional localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    
    // Clear persisted state
    persistor.purge();
    
    // Add an additional toast notification
    toast.info('Redirecting to login page...', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    // Navigate to login page
    navigate('/auth/login');
  };

  return (
    <Button 
      variant={variant}
      onClick={handleLogout} 
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {showIcon && <LogOut size={16} />}
      {children || t('header.logout')}
    </Button>
  );
} 
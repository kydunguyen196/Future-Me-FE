import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { default as Link } from "@/components/ui/CustomLink"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { resetPassword } from '@/redux/thunks/authThunks';
import { clearResetPasswordState } from '@/redux/slices/authSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Globe, XCircle, ArrowLeft, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import i18n from 'i18next';
import { toast } from 'react-toastify';
import api from '@/lib/axios';

// API Response interface
interface ValidateTokenResponse {
  result: string;
  correlationId: string;
  data?: {
    accountId: string;
    email: string;
    username: string;
    fullName: string;
  };
  message?: string;
}

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [userData, setUserData] = useState<ValidateTokenResponse['data'] | null>(null);
  
  const currentLang = i18n.language || 'en';
  const token = searchParams.get('token');
  
  const { 
    resetPasswordLoading, 
    resetPasswordSuccess, 
    resetPasswordError 
  } = useAppSelector((state) => state.auth);

  // Step 2: Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError(t('auth.resetPassword.invalidToken'));
        return;
      }

      setIsValidatingToken(true);
      try {
        const response = await api.post<ValidateTokenResponse>('/auth/password/forget/validate-token', {
          token: token
        });

        if (response.data.result === 'OK' && response.data.data) {
          // Token is valid, store user data
          setUserData(response.data.data);
          setTokenError('');
        } else {
          // Token is invalid
          const errorMessage = response.data.message || t('auth.resetPassword.invalidToken');
          setTokenError(errorMessage);
        }
      } catch (error: any) {
        console.error('Token validation failed:', error);
        
        let errorMessage = t('auth.resetPassword.invalidToken');
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
          errorMessage = t('auth.resetPassword.tokenExpired');
        }
        
        setTokenError(errorMessage);
      } finally {
        setIsValidatingToken(false);
      }
    };

    dispatch(clearResetPasswordState());
    validateToken();
    
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch, token, t]);

  // Show success toast and redirect when reset is successful
  useEffect(() => {
    if (resetPasswordSuccess) {
      toast.success(t('auth.resetPassword.success'), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    }
  }, [resetPasswordSuccess, t, navigate]);

  // Show error toast when there's an error
  useEffect(() => {
    if (resetPasswordError) {
      toast.error(resetPasswordError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [resetPasswordError]);

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.resetPassword.passwordRequired'));
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError(t('auth.resetPassword.passwordTooShort'));
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setPasswordError(t('auth.resetPassword.passwordNoUppercase'));
      return false;
    }
    
    if (!/[!@#$%^&*()_+\-=\{}`;':"\\|,.<>/?]/.test(password)) {
      setPasswordError(t('auth.resetPassword.passwordNoSpecial'));
      return false;
    }
    
    if (/\s/.test(password)) {
      setPasswordError(t('auth.resetPassword.passwordNoSpaces'));
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError(t('auth.resetPassword.confirmPasswordRequired'));
      return false;
    }
    
    if (confirmPassword !== password) {
      setConfirmPasswordError(t('auth.resetPassword.passwordsDoNotMatch'));
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !userData) {
      setTokenError(t('auth.resetPassword.invalidToken'));
      return;
    }
    
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      // Step 3: Call the password change API with the validated token
      await dispatch(resetPassword({ 
        token, 
        newPassword: password,
        email: userData.email // Include email for additional validation
      })).unwrap();
    } catch (error) {
      // Error is handled by the Redux state and useEffect
      console.error('Reset password failed:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleBackToLogin = () => {
    dispatch(clearResetPasswordState());
    navigate('/auth/login');
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        {/* Language toggle button positioned at top-right corner of screen */}
        <div className="fixed top-6 right-6 z-50">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-100 transition-colors shadow-sm"
          >
            <Globe size={16} />
            <span>{currentLang === 'en' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>
        
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">{t('auth.resetPassword.validatingToken')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If no token or token validation failed, show error state
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        {/* Language toggle button positioned at top-right corner of screen */}
        <div className="fixed top-6 right-6 z-50">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-100 transition-colors shadow-sm"
          >
            <Globe size={16} />
            <span>{currentLang === 'en' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>
        
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2 text-red-600">
                <XCircle className="w-6 h-6" />
                {t('auth.resetPassword.invalidLinkTitle')}
              </CardTitle>
              <CardDescription>
                {tokenError}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/auth/forgot-password')} className="w-full">
                  {t('auth.resetPassword.requestNewLink')}
                </Button>
                <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  {t('auth.forgotPassword.backToLogin')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Language toggle button positioned at top-right corner of screen */}
      <div className="fixed top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white text-sm hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Globe size={16} />
          <span>{currentLang === 'en' ? 'Tiếng Việt' : 'English'}</span>
        </button>
      </div>
      
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              {t('auth.resetPassword.title')}
            </CardTitle>
            <CardDescription>
              {userData && (
                <span className="block text-sm text-gray-600 mt-2">
                  {t('auth.resetPassword.resetForAccount')}: <strong>{userData.email}</strong>
                </span>
              )}
              {t('auth.resetPassword.subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('auth.resetPassword.passwordPlaceholder')}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      className={cn("pr-10", passwordError ? 'border-red-500' : '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('register.passwordHint')}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      className={cn("pr-10", confirmPasswordError ? 'border-red-500' : '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-red-600">{confirmPasswordError}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('auth.resetPassword.resetting')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>{t('auth.resetPassword.resetButton')}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="text-center text-sm mt-6">
              <Link 
                to="/auth/login" 
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline underline-offset-4"
                onClick={handleBackToLogin}
              >
                <ArrowLeft size={14} />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-balance text-center text-xs text-muted-foreground mt-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          {t('auth.login.termsPrefix')}{" "}
          <a href="#">{t('auth.login.termsOfService')}</a>{" "}
          {t('auth.login.termsAnd')}{" "}
          <a href="#">{t('auth.login.privacyPolicy')}</a>.
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage; 
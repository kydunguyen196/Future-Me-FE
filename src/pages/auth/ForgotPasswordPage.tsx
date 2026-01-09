import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { default as Link } from "@/components/ui/CustomLink"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Check, Mail, AlertCircle } from "lucide-react";
import api from '@/lib/axios';
import { toast } from 'react-toastify';

// API Response interface
interface ForgotPasswordResponse {
  result: string;
  correlationId: string;
  message?: string;
}

export function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    }
  }, [i18n]);
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    localStorage.setItem('language', newLang);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Step 1: Call /auth/password/forget API
      const response = await api.post<ForgotPasswordResponse>('/auth/password/forget', {
        email: email.trim()
      });
      
      if (response.data.result === 'OK') {
        setIsSubmitted(true);
        toast.success(t('auth.forgotPassword.emailSent'), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Handle API error response
        const errorMessage = response.data.message || t('auth.forgotPassword.emailError');
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      
      let errorMessage = t('auth.forgotPassword.emailError');
      
      if (error.response) {
        // The request was made and the server responded with a status code
        const errorData = error.response.data;
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = t('auth.forgotPassword.networkError');
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
      
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('auth.forgotPassword.title')}</CardTitle>
            <CardDescription>
              {t('auth.forgotPassword.subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('auth.forgotPassword.emailSent')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('auth.forgotPassword.checkInbox')}
                  </p>
                </div>
                <div className="pt-4">
                  <Link to="/auth/login">
                    <Button variant="outline" className="w-full">
                      {t('auth.forgotPassword.backToLogin')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(''); // Clear error when user types
                      }}
                      className={cn(error ? 'border-red-500' : '')}
                    />
                    {error && (
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{currentLang === 'en' ? 'Sending...' : 'Đang gửi...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{t('auth.forgotPassword.resetButton')}</span>
                      </div>
                    )}
                  </Button>
                </div>
                
                <div className="text-center mt-6">
                  <Link 
                    to="/auth/login" 
                    className="text-sm text-blue-600 hover:underline underline-offset-4"
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </div>
              </form>
            )}
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

export default ForgotPasswordPage; 
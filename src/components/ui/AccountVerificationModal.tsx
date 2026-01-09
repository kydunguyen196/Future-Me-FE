import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot,
  InputOTPSeparator
} from './input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface AccountVerificationModalProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

export function AccountVerificationModal({ email, onVerificationSuccess, onBackToLogin }: AccountVerificationModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Request initial OTP when component mounts
  useEffect(() => {
    sendInitialOtp();
  }, []);

  // Handle cooldown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Send initial OTP when modal opens
  const sendInitialOtp = async () => {
    setLoading(true);
    try {
      // Use the correct API endpoint for initial OTP request
      await api.post('/auth/account/email/otp/verify', {
        email
      });
      
      toast.success(t('otp.sent'));
      setResendCooldown(60); // Set cooldown to 60 seconds
    } catch (error) {
      console.error('Error sending initial OTP:', error);
      toast.error(t('otp.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP when user clicks resend button
  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      // Use the correct API endpoint for resending OTP
      await api.post('/auth/account/email/otp/resend', {
        email
      });
      
      toast.success(t('otp.sent'));
      setResendCooldown(60); // Set cooldown to 60 seconds
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(t('otp.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (value.length !== 6) {
      toast.error(t('otp.incomplete'));
      return;
    }
    
    setVerifying(true);
    try {
      // Use the correct API endpoint for verifying OTP
      const response = await api.post('/auth/account/email/otp/verify', {
        email,
        otp: value
      });
      
      if (response.data.result === 'OK') {
        setVerificationSuccess(true);
        toast.success(t('otp.verified'));
        
        // Delay to show success state before closing
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        toast.error(t('otp.invalid'));
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(t('otp.verificationFailed'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('otp.title') || 'Verify Your Account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification code to <span className="font-medium text-gray-900 dark:text-white">{email}</span>. Please enter the code below to verify your account.
          </p>
        </div>

        {verificationSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {t('otp.successMessage')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <InputOTP 
                maxLength={6} 
                value={value} 
                onChange={setValue} 
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="gap-3"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={verifyOtp} 
                disabled={value.length !== 6 || verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('otp.verifying')}
                  </>
                ) : (
                  t('otp.verify')
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resendOtp}
                disabled={resendCooldown > 0 || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('otp.sending')}
                  </>
                ) : resendCooldown > 0 ? (
                  `${t('otp.resendIn')} (${resendCooldown}s)`
                ) : (
                  t('otp.resend')
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={onBackToLogin}
                className="w-full mt-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.backToLogin', 'Back to Login')}
              </Button>
            </div>
          </>
        )}

        <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          {t('otp.contactSupport')}
        </div>
      </div>
    </div>
  );
} 
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, Shield, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

interface PayOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  remainingTrials: number;
}

export function PayOSModal({ isOpen, onClose, onPaymentSuccess, remainingTrials }: PayOSModalProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plan = {
    price: 49000, // VND
    priceUSD: 2, // USD
    duration: t('payos.lifetime'),
  };

  const features = [
    t('payos.features.unlimited'),
    t('payos.features.detailed'),
    t('payos.features.progress'),
    t('payos.features.support'),
    t('payos.features.updates'),
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Kiểm tra trạng thái đăng nhập
      const authData = JSON.parse(localStorage.getItem('persist:auth') || '{}');
      if (authData.isAuthenticated !== 'true') {
        throw new Error('User not authenticated');
      }

      // Lấy token từ localStorage
      const token = authData.token ? JSON.parse(authData.token) : null;
      if (!token) {
        throw new Error('No token found');
      }

      // Tạo header cho API
      const uuid = uuidv4();
      const eventTime = new Date().toISOString();

      // Gọi API upgrade account
      const upgradeResponse = await fetch('https://futureme.com.vn/api/v1/id/exe/account/plan/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-one-time-uuid': uuid,
          'x-event-time': eventTime,
          'Authorization': `Bearer ${token}`, // Thêm header Authorization
        },
        credentials: 'include', // Gửi cookie nếu server yêu cầu
      });

      if (!upgradeResponse.ok) {
        throw new Error(`Upgrade API failed with status: ${upgradeResponse.status}`);
      }

      const upgradeResult = await upgradeResponse.json();

      if (upgradeResult.result !== 'OK' || !upgradeResult.data.checkoutUrl) {
        throw new Error('Failed to initiate upgrade process');
      }

      // Lưu paymentId vào localStorage
      localStorage.setItem('pendingPaymentId', upgradeResult.data.paymentId);

      // Redirect đến checkoutUrl
      window.location.href = upgradeResult.data.checkoutUrl;

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error(t('payos.error'));
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 border-0 shadow-2xl">
        <CardHeader className="relative pb-2">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('payos.title')}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('payos.subtitle', { trials: remainingTrials === -1 ? 'Unlimited' : remainingTrials })}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  {t('payos.trialEnded')}
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {t('payos.trialMessage', { trials: remainingTrials === -1 ? 'Unlimited' : remainingTrials })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{plan.duration}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                <p className="text-sm text-gray-500">≈ ${plan.priceUSD}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-center">{t('payos.whatYouGet')}</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('payos.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t('payos.payNow')}
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              {t('payos.securePayment')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
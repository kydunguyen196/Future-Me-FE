import { useTranslation } from 'react-i18next';
import { default as Link } from "@/components/ui/CustomLink";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayOSModal } from '@/components/ui/PayOSModal';
import { 
  hasTrialsRemaining, 
  useTrial, 
  getRemainingTrials, 
  isPaidUser 
} from '@/utils/trialManager';
import { useEffect, useState } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  Brain,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap,
  Star,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';

export function TestsPage() {
  const { t } = useTranslation();
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const [remainingTrials, setRemainingTrials] = useState(0);
  const [userIsPaid, setUserIsPaid] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái trả phí và số lượt thử
    const isPaid = isPaidUser();
    setUserIsPaid(isPaid);
    setRemainingTrials(getRemainingTrials());

    // Nếu có pendingPaymentId và vừa trả phí thành công, hiển thị thông báo
    const paymentId = localStorage.getItem('pendingPaymentId');
    if (paymentId && isPaid) {
      localStorage.removeItem('pendingPaymentId');
      toast.success(t('tests.paymentSuccess'));
    }
  }, []);

  const handleStartTest = () => {
    if (userIsPaid) {
      return true;
    }

    if (hasTrialsRemaining()) {
      const newTrialData = useTrial();
      setRemainingTrials(newTrialData.remainingTrials);
      return true;
    } else {
      setShowPayOSModal(true);
      return false;
    }
  };

  const handlePaymentSuccess = () => {
    setUserIsPaid(true);
    setRemainingTrials(-1);
    setShowPayOSModal(false);
    toast.success(t('tests.paymentSuccess'));
  };

  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: t('tests.features.realExam.title'),
      description: t('tests.features.realExam.description'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('tests.features.detailed.title'),
      description: t('tests.features.detailed.description'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('tests.features.adaptive.title'),
      description: t('tests.features.adaptive.description'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const testTypes = [
    {
      key: 'fullLength', 
      available: true,
      link: '/test/screen',
      gradient: 'from-indigo-600 via-purple-600 to-blue-600'
    }
  ];

  const stats = [
    { label: t('tests.stats.testsCompleted'), value: '1,234', icon: <CheckCircle className="h-6 w-6" />, color: 'text-green-500' },
    { label: t('tests.stats.averageScore'), value: '1420', icon: <Award className="h-6 w-6" />, color: 'text-yellow-500' },
    { label: t('tests.stats.improvementRate'), value: '+187', icon: <TrendingUp className="h-6 w-6" />, color: 'text-blue-500' },
    { label: t('tests.stats.timeSpent'), value: '45h', icon: <Clock className="h-6 w-6" />, color: 'text-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <section className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="mx-auto max-w-7xl w-full">
          <div className="text-center mb-20">
            <div className="mb-8 flex justify-center flex-col items-center gap-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-lg font-semibold border-0 shadow-lg">
                🎯 {t('tests.features.realExam.title')}
              </Badge>
              
              {!userIsPaid && (
                <div className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 shadow-lg">
                  {remainingTrials > 0 ? (
                    <>
                      <Zap className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {t('tests.trialsRemaining', { count: remainingTrials })}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {t('tests.trialsExhausted')}
                      </span>
                    </>
                  )}
                </div>
              )}

              {userIsPaid && (
                <div className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 shadow-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    {t('tests.premiumUser')}
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-8 leading-tight">
              {t('tests.hero.title')}
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-300 mb-12">
              {t('tests.hero.description')}
            </p>

            <div className="flex justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 200}ms`}} />
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              {testTypes.map((test, index) => {
                const testData = t(`tests.testTypes.${test.key}`, { returnObjects: true }) as any;
                
                return (
                  <div key={index} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 scale-105"></div>
                    
                    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl transform transition-all duration-500 hover:-translate-y-4 hover:scale-105">
                      <div className={`absolute inset-0 bg-gradient-to-br ${test.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                      
                      <CardHeader className="relative p-10">
                        <div className="flex items-center justify-between mb-6">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 text-lg font-bold border-0 shadow-lg">
                            ⭐ {testData.badge}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                            <span className="text-yellow-400 font-semibold">Premium</span>
                          </div>
                        </div>
                        
                        <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                          {testData.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg leading-relaxed">
                          {testData.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="relative p-10">                       
                        <div className="flex justify-center">
                          {userIsPaid || hasTrialsRemaining() ? (
                            <Button asChild className="w-full max-w-md h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 border-0 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 group">
                              <Link 
                                to={test.link}
                                onClick={(e) => {
                                  if (!handleStartTest()) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <span className='flex items-center justify-center text-white text-xl font-bold'>
                                  <Zap className="mr-3 h-6 w-6 text-yellow-300 group-hover:animate-pulse" />
                                  {t('tests.startNow')}
                                  <ArrowRight className="ml-3 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                                </span>
                              </Link>
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => setShowPayOSModal(true)}
                              className="w-full max-w-md h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 border-0 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 group"
                            >
                              <span className='flex items-center justify-center text-white text-xl font-bold'>
                                <Lock className="mr-3 h-6 w-6 text-yellow-300 group-hover:animate-pulse" />
                                {t('tests.upgradeToStart')}
                                <ArrowRight className="ml-3 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                              </span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-6">
              {t('tests.features.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-blue-200 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
              {t('tests.stats.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`flex justify-center items-center space-x-2 mb-4 ${stat.color}`}>
                    {stat.icon}
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `
      }} />

      <PayOSModal
        isOpen={showPayOSModal}
        onClose={() => setShowPayOSModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        remainingTrials={remainingTrials}
      />
    </div>
  );
}

export default TestsPage;
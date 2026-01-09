import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { Globe, XCircle } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { default as Link } from "@/components/ui/CustomLink"
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loginUser } from '@/redux/thunks/authThunks'
import { clearError } from '@/redux/slices/authSlice'
import type { RootState } from '@/redux/store'
import { toast } from 'react-toastify'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state: RootState) => state.auth);
  
  // Load language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    }
  }, [i18n]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    localStorage.setItem('language', newLang);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resultAction = await dispatch(loginUser({ username: email, password }));
      
      // Check if login was successful
      if (loginUser.fulfilled.match(resultAction)) {
        // Show success toast notification
        toast.success('Login successful! You have been logged in successfully.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Get user data and check role
        const user = resultAction.payload.user;
        
        // Redirect based on role
        if (user.role === 'ADMIN' || user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      // For unexpected errors not caught by the Redux flow
      console.error('Login failed:', err);
    }
  };
  
  // Show toast notification when error state changes
  useEffect(() => {
    if (error) {
      toast.error(`Login failed: ${error}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100 transition-colors"
          >
            <Globe size={16} />
            <span>{currentLang === 'en' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.login.welcome')}</CardTitle>
          <CardDescription>
            {t('auth.login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">               
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('auth.login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.login.emailPlaceholder')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t('auth.login.password')}</Label>
                    <Link
                      to="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : t('auth.login.loginButton')}
                </Button>
              </div>
              <div className="text-center text-sm">
                {t('auth.login.noAccount')}{" "}
                <Link to="/auth/register" className="underline underline-offset-4 text-blue-600 hover:text-blue-800">
                  {t('auth.login.signUp')}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        {t('auth.login.termsPrefix')}{" "}
        <a href="#">{t('auth.login.termsOfService')}</a>{" "}
        {t('auth.login.termsAnd')}{" "}
        <a href="#">{t('auth.login.privacyPolicy')}</a>.
      </div>
    </div>
  )
}

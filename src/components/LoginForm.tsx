import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { default as Link } from "@/components/ui/CustomLink"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser } from '@/redux/thunks/authThunks';
import { clearError } from '@/redux/slices/authSlice';
import type { RootState } from '@/redux/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { InteractiveHoverButton } from './ui/magic/InteractiveHoverButton';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { isLoading, error } = useAppSelector((state: RootState) => state.auth);

    // Clear any existing errors when component mounts
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Clear errors when user starts typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) {
            dispatch(clearError());
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Clear any previous errors
        dispatch(clearError());

        try {
            const resultAction = await dispatch(loginUser({ username: email, password }));

            // Check if login was successful
            if (loginUser.fulfilled.match(resultAction)) {
                const user = resultAction.payload.user;

                // Show success toast notification
                toast.success(t('auth.login.loginSuccess') || 'Login successful!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Handle role-based navigation
                const role = user.role?.toUpperCase();
                
                console.log('Login successful - user:', user);
                console.log('Login successful - role:', role);
                
                // Set admin flag in localStorage if user is admin
                if (role === 'ADMIN') {
                    localStorage.setItem('isAdmin', 'true');
                    console.log('Admin flag set in localStorage');
                } else {
                    localStorage.removeItem('isAdmin');
                    console.log('Admin flag removed from localStorage');
                }
                
                switch (role) {
                    case 'ADMIN':
                        console.log('Navigating to admin dashboard...');
                        // Add a small delay to ensure Redux state is persisted
                        setTimeout(() => {
                            navigate('/admin/dashboard');
                        }, 100);
                        break;
                    case 'STAFF':
                        console.log('Navigating to staff dashboard...');
                        navigate('/staff/dashboard');
                        break;
                    case 'STUDENT':
                        navigate('/');
                    default:
                        // Log unexpected role for debugging
                        console.warn(`Unexpected user role: ${role}`);
                        // Default to home page
                        navigate('/');
                        break;
                }
            } else if (loginUser.rejected.match(resultAction)) {
                // Handle rejected login - error is already in Redux state
                // Don't show toast here as the error will be displayed in the form
                console.error('Login rejected:', resultAction.payload || resultAction.error);
            }
        } catch (err: any) {
            // This catch block should rarely be hit with proper Redux handling
            console.error('Unexpected login error:', err);
            
            // Only show toast for unexpected errors
            toast.error(t('auth.login.loginError') || 'An unexpected error occurred. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };


    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700/20">
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
                                        onChange={handleEmailChange}
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
                                    <div className="relative">
                                        <Input 
                                            id="password" 
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-9 px-0 focus:ring-0 focus:ring-offset-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-800">
                                        <div className="flex items-start gap-2">
                                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    </div>
                                )}
                                <InteractiveHoverButton 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? t('auth.login.signingIn') : t('auth.login.loginButton')}
                                </InteractiveHoverButton>
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
    );
} 
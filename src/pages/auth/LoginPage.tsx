import { LoginForm } from '@/components/LoginForm';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher className="transition-all duration-200 hover:scale-105 active:scale-95" />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Link 
            to="/"
            className="inline-block transition-transform duration-200 hover:scale-105"
          >
            <img
              src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
              alt="FutureMe Logo"
              className="h-12 w-auto mx-auto object-contain cursor-pointer"
            />
          </Link>
        </div>
        
        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;

import { useTranslation } from 'react-i18next';
import { default as Link } from "@/components/ui/CustomLink"
import { Home, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 403 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse">
            403
          </h1>
          <div className="absolute inset-0 text-9xl font-bold text-red-600/10 animate-ping">
            403
          </div>
        </div>

        {/* Warning shield icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t('unauthorized.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {t('unauthorized.message')}
        </p>

        {/* Action buttons */}
        <div className="flex justify-center">
          <Button asChild className="group">
            <Link to="/">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('unauthorized.backHome')}
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          {t('unauthorized.helpText')}
        </p>
      </div>
      
      </div>
    );
}

export default UnauthorizedPage; 
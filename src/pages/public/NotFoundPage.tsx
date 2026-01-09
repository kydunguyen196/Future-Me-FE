import { useTranslation } from 'react-i18next';
import { default as Link } from "@/components/ui/CustomLink"
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-9xl font-bold text-blue-600/10 animate-ping">
            404
          </div>
        </div>

        {/* Floating search icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-bounce">
            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t('notFound.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {t('notFound.message')}
        </p>

        {/* Action buttons */}
        <div className="flex justify-center">
          <Button asChild className="group">
            <Link to="/">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('notFound.backHome')}
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          {t('notFound.helpText')}
        </p>
      </div>
      
    </div>
  );
}

export default NotFoundPage; 
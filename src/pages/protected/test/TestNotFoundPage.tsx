import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { default as Link } from "@/components/ui/CustomLink"
import { Button } from '@/components/ui/button';
import { FileX, Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';

export function TestNotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: examId } = useParams<{ id: string }>();
  
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/tests');
    }
  };

  const handleRetry = () => {
    if (examId) {
      // Refresh the current page to retry loading the test
      window.location.reload();
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="text-center max-w-lg mx-auto bg-white p-10 rounded-lg shadow-lg">
        {/* Error Icon and Title */}
        <div className="mb-8">
          <FileX className="w-20 h-20 mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            {t('tests.testNotFound.title')}
          </h1>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            {examId ? `Test ID: ${examId}` : 'Invalid Test ID'}
          </h2>
        </div>
        
        {/* Description */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-4">
            {t('tests.testNotFound.message')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {t('tests.testNotFound.suggestion')}
          </p>
          
          {/* Possible reasons */}
          <div className="bg-gray-50 p-4 rounded-md text-left">
            <h3 className="font-medium text-gray-700 mb-2">
              {t('tests.testNotFound.possibleReasons')}:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('tests.testNotFound.reason1')}</li>
              <li>• {t('tests.testNotFound.reason2')}</li>
              <li>• {t('tests.testNotFound.reason3')}</li>
              <li>• {t('tests.testNotFound.reason4')}</li>
            </ul>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tests.testNotFound.goBack')}
          </Button>
          
          {examId && (
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('tests.testNotFound.retry')}
            </Button>
          )}
          
          <Link to="/tests">
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              {t('tests.testNotFound.backToTests')}
            </Button>
          </Link>
          
          <Link to="/">
            <Button 
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              {t('notFound.backHome')}
            </Button>
          </Link>
        </div>
        
        {/* Help Text */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t('tests.testNotFound.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestNotFoundPage; 
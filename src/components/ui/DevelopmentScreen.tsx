import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench,
  CheckCircle, 
  Circle,
  Lightbulb,
  Rocket,
  Calendar
} from 'lucide-react';

interface DevelopmentScreenProps {
  /** Translation key prefix for the feature being developed (e.g., 'development.courses') */
  translationKey: string;
  /** Color theme for the component */
  theme?: 'blue' | 'purple' | 'green' | 'orange';
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Custom back URL */
  backUrl?: string;
  /** Whether this is enabled (if false, shows nothing) */
  enabled?: boolean;
  /** Children to render instead when not in development mode */
  children?: React.ReactNode;
}

const DevelopmentScreen: React.FC<DevelopmentScreenProps> = ({
  translationKey,
  theme = 'blue',
  //@ts-ignore:showBackButton is not defined
  showBackButton = true,
  backUrl = '/',
  enabled = true,
  children
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // If not enabled, render children or nothing
  if (!enabled) {
    return children ? <>{children}</> : null;
  }

  // Theme configuration
  const themeConfig = {
    blue: {
      gradient: 'from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950 dark:via-indigo-950 dark:to-blue-900',
      banner: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      titleGradient: 'from-blue-600 to-indigo-600',
      primaryButton: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      progressActive: 'bg-blue-600 dark:bg-blue-400'
    },
    purple: {
      gradient: 'from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950 dark:via-violet-950 dark:to-purple-900',
      banner: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      titleGradient: 'from-purple-600 to-violet-600',
      primaryButton: 'bg-purple-600 hover:bg-purple-700',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      progressActive: 'bg-purple-600 dark:bg-purple-400'
    },
    green: {
      gradient: 'from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900',
      banner: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      titleGradient: 'from-green-600 to-emerald-600',
      primaryButton: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      progressActive: 'bg-green-600 dark:bg-green-400'
    },
    orange: {
      gradient: 'from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900',
      banner: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      titleGradient: 'from-orange-600 to-amber-600',
      primaryButton: 'bg-orange-600 hover:bg-orange-700',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      progressActive: 'bg-orange-600 dark:bg-orange-400'
    }
  };

  const currentTheme = themeConfig[theme];

  const handleBack = () => {
    navigate(backUrl);
  };

  // Get translated content
  const title = t(`${translationKey}.title`);
  const description = t(`${translationKey}.description`);
  
  // Get features array
  const featuresKeys = [
    'interactiveLessons', 'expertInstructors', 'adaptiveLearning',
    'videoTutorials', 'personalizedPaths', 'progressTracking',
    'targetedExercises', 'instantFeedback', 'adaptiveDifficulty',
    'spacedRepetition', 'performanceAnalytics', 'gamification'
  ];
  
  const features = featuresKeys
    .map(key => {
      const translation = t(`${translationKey}.features.${key}`, { defaultValue: '' });
      return translation || null;
    })
    .filter(Boolean);

  // Get phases
  const phasesKeys = [
    'courseStructure', 'interactiveFeatures', 'launchBeta',
    'questionBank', 'adaptiveAlgorithm', 'gamificationFeatures'
  ];
  
  const phases = phasesKeys
    .map(key => {
      const name = t(`${translationKey}.phases.${key}.name`, { defaultValue: '' });
      const phaseDescription = t(`${translationKey}.phases.${key}.description`, { defaultValue: '' });
      if (!name || !phaseDescription) return null;
      
      return {
        name,
        description: phaseDescription,
        status: key === 'courseStructure' || key === 'questionBank' ? 'in-progress' as const : 'planned' as const
      };
    })
    .filter((phase): phase is NonNullable<typeof phase> => phase !== null);

  // Get CTA buttons
  const ctaButtonsKeys = ['takePracticeTests', 'getNotified', 'takeFullTests', 'exploreFeatures'];
  const ctaButtons = ctaButtonsKeys
    .map(key => {
      const label = t(`${translationKey}.ctaButtons.${key}`, { defaultValue: '' });
      if (!label) return null;
      
      let url = '/';
      let variant: 'primary' | 'secondary' = 'secondary';
      
      if (key === 'takePracticeTests' || key === 'takeFullTests') {
        url = '/tests';
        variant = 'primary';
      }
      
      return { label, url, variant };
    })
    .filter((button): button is NonNullable<typeof button> => button !== null);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient}`}>
      <div className="container mx-auto py-8 px-4 max-w-6xl">

        {/* Development Banner */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-3 ${currentTheme.banner} px-6 py-3 rounded-full text-sm font-medium mb-6`}>
            <Wrench className="w-4 h-4" />
            {t('development.banner')}
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${currentTheme.titleGradient} bg-clip-text text-transparent`}>
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Features Preview */}
        {features.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              {t('development.whatsComingTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${currentTheme.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <Lightbulb className={`w-6 h-6 ${currentTheme.iconColor}`} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Timeline */}
        {phases.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Rocket className="w-6 h-6" />
              {t('development.developmentTimelineTitle')}
            </h2>
            
            <div className="space-y-6">
              {phases.map((phase, index) => {
                const isCompleted = false; // No phases are completed yet
                const isInProgress = phase.status === 'in-progress';
                const isPlanned = phase.status === 'planned';
                
                return (
                  <div key={index} className={`flex items-center gap-4 ${isPlanned ? 'opacity-50' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? `${currentTheme.iconBg} ${currentTheme.iconColor}` 
                        : isInProgress 
                        ? `${currentTheme.iconBg}` 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className={`w-6 h-6 ${currentTheme.iconColor}`} />
                      ) : isInProgress ? (
                        <div className={`w-6 h-6 ${currentTheme.progressActive} rounded-full animate-pulse`}></div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {phase.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {phase.description}
                      </p>
                      <span className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-green-600 dark:text-green-400' 
                          : isInProgress 
                          ? `${currentTheme.iconColor}`
                          : 'text-gray-500'
                      }`}>
                        {isCompleted 
                          ? t('development.phases.completed') 
                          : isInProgress 
                          ? t('development.phases.inProgress')
                          : t('development.phases.planned')
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Calendar className="w-6 h-6" />
            {t('development.stayTuned')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('development.stayTunedDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => navigate(button.url)}
                className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  button.variant === 'primary'
                    ? `${currentTheme.primaryButton} text-white`
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {button.label}
              </button>
            ))}
            
            {/* Default back button if no custom CTAs */}
            {ctaButtons.length === 0 && (
              <button
                onClick={handleBack}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {t('development.goBackButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentScreen; 
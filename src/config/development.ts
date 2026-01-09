/**
 * Development configuration
 * Set features to development mode here
 */

export const DEVELOPMENT_CONFIG = {
  // Feature flags - set to true to show development screen
  COURSES_IN_DEVELOPMENT: true,
  PRACTICE_IN_DEVELOPMENT: true,
  SUPPORT_IN_DEVELOPMENT: false,
  
  // Safe Exam Browser configuration
  SEB_ENFORCEMENT_ENABLED: false, // Set to true to enforce SEB only in development
  SEB_STRICT_MODE: false, // Set to true for stricter validation
  SEB_SHOW_FLOATING_CONTROLS: false, // Set to true to show floating dev controls
  
  // Environment check
  IS_PRODUCTION: import.meta.env.IS_PRODUCTION,
  
  // Helper function to check if a feature should show development screen
  shouldShowDevelopmentScreen: (featureFlag: boolean) => {
    // In production, respect the feature flag
    // In development, you can override by setting the flag to false
    return featureFlag;
  },
  
  // Helper function to check if SEB enforcement should be enabled
  shouldEnforceSEB: () => {
    // In production, always enforce SEB for exam-related routes
    if (DEVELOPMENT_CONFIG.IS_PRODUCTION) {
      return true;
    }
    // In development, only enforce if explicitly enabled
    return DEVELOPMENT_CONFIG.SEB_ENFORCEMENT_ENABLED;
  }
};

// Translation key mappings for different features
export const DEVELOPMENT_TRANSLATION_KEYS = {
  COURSES: 'development.courses',
  PRACTICE: 'development.practice',
  SUPPORT: 'development.support',
} as const;

// Theme configurations for different features
export const DEVELOPMENT_THEMES = {
  COURSES: 'blue' as const,
  PRACTICE: 'purple' as const,
  SUPPORT: 'green' as const,
} as const; 
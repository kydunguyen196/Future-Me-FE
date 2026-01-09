import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from './button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'flag-icons/css/flag-icons.min.css';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('language') || i18n.language || 'en'; // Default to English
  });

  // Update currentLang when i18n language changes
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en'; // Default to English
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    setCurrentLang(savedLang);
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    
    // Update i18n language
    i18n.changeLanguage(newLang);
    // Save to localStorage
    localStorage.setItem('language', newLang);
    // Update local state
    setCurrentLang(newLang);
  };

  const languages = {
    en: { flagClass: 'fi fi-us', color: 'from-blue-500 to-purple-600' },
    vi: { flagClass: 'fi fi-vn', color: 'from-red-500 to-yellow-500' }
  };

  const currentLanguage = languages[currentLang as keyof typeof languages];

  return (
    <div className={cn("relative", className)}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Current Language */}
        <motion.div 
          className="flex items-center gap-1"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <span className={`${currentLanguage.flagClass} text-base`}></span>
        </motion.div>

      </Button>
    </div>
  );
}

export default LanguageSwitcher; 
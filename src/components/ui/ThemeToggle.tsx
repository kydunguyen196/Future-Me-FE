import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  // State to track if we're in dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // On component mount, check if dark mode is active
  useEffect(() => {
    // Check if the document has the 'dark' class
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only apply if we don't have a stored preference
      if (!localStorage.getItem('theme')) {
        const newIsDark = mediaQuery.matches;
        setIsDarkMode(newIsDark);
        
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Set up event listener for system preference
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    // Toggle the dark mode state
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    // Add or remove the 'dark' class based on the new state
    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Force a re-render of the entire application to update styling
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
    }, 5); // Very short timeout to force repaint
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-md transition-all duration-200",
        "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900", 
        "dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200",
        className
      )}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-blue-600" />
      )}
    </button>
  );
} 
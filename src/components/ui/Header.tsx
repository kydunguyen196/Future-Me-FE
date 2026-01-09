import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, User, ChevronDown, Settings, LogOut, LogIn, UserCircle, UserPlus, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { default as Link } from "@/components/ui/CustomLink"
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { LogoutButton } from './LogoutButton';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { loginSuccess } from '@/redux/slices/authSlice';

interface HeaderProps {
  className?: string;
  onSidebarToggle?: () => void;
}

export function Header({ className, onSidebarToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  // Get authentication state from Redux - this will be persisted by redux-persist
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  // Get fallback user data from localStorage
  const localStorageFullName = localStorage.getItem('userFullName');
  const localStorageEmail = localStorage.getItem('userEmail');
  const localStorageToken = localStorage.getItem('token');
  const localStorageAvatar = localStorage.getItem('userAvatar');

  // If we have a token but no user data, attempt to restore from localStorage
  useEffect(() => {
    if (localStorageToken && isAuthenticated && (!user || Object.keys(user).length === 0)) {
      // Create a minimal user object from localStorage data
      if (localStorageFullName && localStorageEmail) {
        const restoredUser = {
          fullName: localStorageFullName,
          email: localStorageEmail,
          accountId: '',
          username: localStorageEmail,
          role: localStorage.getItem('isAdmin') ? 'ADMIN' : 'USER',
          status: 'ACTIVE',
          avatar: localStorageAvatar
        };

        // Update Redux store with restored user data
        dispatch(loginSuccess({
          user: restoredUser,
          token: localStorageToken
        }));
      }
    }
  }, [isAuthenticated, user, localStorageToken, dispatch]);

  useEffect(() => {
    // Add click outside listener for user dropdown
    const handleClickOutside = (event: MouseEvent) => {
      // Handle user dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    // If we have a sidebar toggle handler and we're on mobile, use it
    if (onSidebarToggle && window.innerWidth < 1024) {
      onSidebarToggle();
    }
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Check if we're on an admin page
  const isAdminPage = location.pathname.includes('/admin');

  // Helper function to check if nav item is active
  const isActiveTab = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Determine if user is authenticated (either through Redux or localStorage)
  const userIsAuthenticated = isAuthenticated || !!localStorageToken;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const nameToUse = user?.fullName || localStorageFullName;
    if (nameToUse) {
      const nameParts = nameToUse.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameToUse.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get user data with fallback to localStorage
  const fullName = user?.fullName || localStorageFullName || 'User';
  const email = user?.email || localStorageEmail || '';
  const avatar = user?.avatar || localStorageAvatar || null;
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || localStorage.getItem('isAdmin') === 'true';

  // Create avatar URL with stable cache-busting
  const avatarUrl = avatar ? `${avatar}?v=${avatar.split('/').pop()?.split('.')[0] || 'default'}` : "user";

  return (
    <>
      
      <header className={cn("w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 dark:bg-gray-950/95 dark:border-gray-800/50 sticky top-0 z-40 shadow-lg shadow-black/5", className)}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
              onClick={handleMenuClick}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center">
              <img
                src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
                alt="FutureMe Logo"
                className="h-8 w-auto object-contain ml-2 lg:ml-0"
              />
            </Link>
          </div>

          {/* Main Container for Navigation and Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Desktop Navigation Menu - Show different nav based on admin page */}
            {!isAdminPage && (
              <nav className="flex items-center space-x-1">
                <Button
                  asChild
                  variant={isActiveTab('/') ? "light-blue" : "ghost"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Link to="/">
                    {t('header.home')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActiveTab('/courses') ? "light-blue" : "ghost"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Link to="/courses">
                    {t('header.courses')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActiveTab('/tests') ? "light-blue" : "ghost"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Link to="/tests">
                    {t('header.tests')}
                  </Link>
                </Button>
                {user?.role == "STUDENT" &&
                  <Button
                    asChild
                    variant={isActiveTab('/tutors') ? "light-blue" : "ghost"}
                    size="sm"
                    className="transition-all duration-200"
                  >
                    <Link
                      to="/tutors"
                      className="px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                    >
                      {"Tutors"}
                    </Link>
                  </Button>
                }
                <Button
                  asChild
                  variant={isActiveTab('/practice') ? "light-blue" : "ghost"}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Link to="/practice">
                    {t('header.practice')}
                  </Link>
                </Button>
              </nav>
            )}

            {/* Admin Navigation - Show when on admin pages */}
            {isAdminPage && (
              <nav className="flex items-center space-x-1">
                <Button
                  asChild
                  variant={isActiveTab('/admin/dashboard') ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all duration-200",
                    isActiveTab('/admin/dashboard') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                  )}
                >
                  <Link to="/admin/dashboard">
                    {t('admin.common.dashboard')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActiveTab('/admin/users') ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all duration-200",
                    isActiveTab('/admin/users') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                  )}
                >
                  <Link to="/admin/users">
                    {t('admin.common.users')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActiveTab('/admin/questions') ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all duration-200",
                    isActiveTab('/admin/questions') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                  )}
                >
                  <Link to="/admin/questions">
                    {t('admin.common.questionBank')}
                  </Link>
                </Button>
              </nav>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg hover:scale-105 active:scale-95">
                <Search size={18} />
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher className="transition-all duration-200 hover:scale-105 active:scale-95" />

              {/* User dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  className={cn(
                    "flex items-center gap-2 h-9 text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors duration-200 rounded-md",
                    isUserDropdownOpen ? "bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400" : "",
                    userIsAuthenticated ? "pl-2 pr-3" : "px-2"
                  )}
                  onClick={toggleUserDropdown}
                  aria-haspopup="true"
                  aria-expanded={isUserDropdownOpen}
                >
                  {userIsAuthenticated ? (
                    <>
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={avatarUrl}
                          alt={fullName}
                        />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[120px] truncate">{fullName}</span>
                      <ChevronDown size={14} className={`transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <User size={18} />
                  )}
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {userIsAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={avatarUrl}
                                alt={fullName}
                              />
                              <AvatarFallback className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
                            </div>
                          </div>
                        </div>

                        {isAdminPage ? (
                          <Link
                            to="/"
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LogOut size={16} />
                            {t('header.backToSite')}
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                              <UserCircle size={16} />
                              {t('header.profile')}
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Settings size={16} />
                              {t('header.settings')}
                            </Link>
                            {isAdmin && (
                              <Link
                                to="/admin/dashboard"
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Shield size={16} />
                                {t('header.adminPanel')}
                              </Link>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <LogoutButton
                              className="w-full justify-start text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              variant="ghost"
                            >
                              {t('header.logout')}
                            </LogoutButton>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth/login"
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <LogIn size={16} />
                          {t('header.login')}
                        </Link>
                        <Link
                          to="/auth/register"
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                          <UserPlus size={16} />
                          {t('header.register')}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200/50 dark:bg-gray-950/95 dark:border-gray-800/50 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {!isAdminPage ? (
                <>
                  <Button
                    asChild
                    variant={isActiveTab('/') ? "light-blue" : "ghost"}
                    size="default"
                    className="w-full justify-start h-auto py-3 px-4 transition-all duration-200"
                  >
                    <Link to="/" className="w-full text-left">
                      {t('header.home')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={isActiveTab('/courses') ? "light-blue" : "ghost"}
                    size="default"
                    className="w-full justify-start h-auto py-3 px-4 transition-all duration-200"
                  >
                    <Link to="/courses" className="w-full text-left">
                      {t('header.courses')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={isActiveTab('/tests') ? "light-blue" : "ghost"}
                    size="default"
                    className="w-full justify-start h-auto py-3 px-4 transition-all duration-200"
                  >
                    <Link to="/tests" className="w-full text-left">
                      {t('header.tests')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={isActiveTab('/practice') ? "light-blue" : "ghost"}
                    size="default"
                    className="w-full justify-start h-auto py-3 px-4 transition-all duration-200"
                  >
                    <Link to="/practice" className="w-full text-left">
                      {t('header.practice')}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant={isActiveTab('/admin/dashboard') ? "secondary" : "ghost"}
                    size="default"
                    className={cn(
                      "w-full justify-start h-auto py-3 px-4 transition-all duration-200",
                      isActiveTab('/admin/dashboard') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                    )}
                  >
                    <Link to="/admin/dashboard" className="w-full text-left">
                      {t('admin.common.dashboard')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={isActiveTab('/admin/users') ? "secondary" : "ghost"}
                    size="default"
                    className={cn(
                      "w-full justify-start h-auto py-3 px-4 transition-all duration-200",
                      isActiveTab('/admin/users') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                    )}
                  >
                    <Link to="/admin/users" className="w-full text-left">
                      {t('admin.common.users')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={isActiveTab('/admin/questions') ? "secondary" : "ghost"}
                    size="default"
                    className={cn(
                      "w-full justify-start h-auto py-3 px-4 transition-all duration-200",
                      isActiveTab('/admin/questions') && "bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-100"
                    )}
                  >
                    <Link to="/admin/questions" className="w-full text-left">
                      {t('admin.common.questionBank')}
                    </Link>
                  </Button>
                </>
              )}

              {/* Mobile Language Switcher */}
              <div className="pt-2 pb-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('header.language')}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                {userIsAuthenticated ? (
                  <>
                    <div className="px-3 py-2.5 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={avatarUrl}
                            alt={fullName}
                          />
                          <AvatarFallback className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
                        </div>
                      </div>
                    </div>

                    {isAdminPage ? (
                      <Link
                        to="/"
                        className="flex items-center gap-3 py-2.5 px-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <LogOut size={18} />
                        {t('header.backToSite')}
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 py-2.5 px-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                          <UserCircle size={18} />
                          {t('header.profile')}
                        </Link>

                        <Link
                          to="/settings"
                          className="flex items-center gap-3 py-2.5 px-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Settings size={18} />
                          {t('header.settings')}
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 py-2.5 px-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Shield size={18} />
                            {t('header.adminPanel')}
                          </Link>
                        )}
                      </>
                    )}

                    <LogoutButton
                      className="flex items-center gap-3 py-2.5 px-3 mt-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full justify-start transition-colors"
                      variant="ghost"
                      showIcon={true}
                    >
                      {t('header.logout')}
                    </LogoutButton>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="flex items-center gap-3 py-2.5 px-3 rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <LogIn size={18} />
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/auth/register"
                      className="flex items-center gap-3 py-2.5 px-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserPlus size={18} />
                      {t('header.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
} 
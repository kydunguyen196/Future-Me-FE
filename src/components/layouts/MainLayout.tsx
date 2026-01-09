import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { FloatingButton } from '@/components/ui/floating-button';
import { NavigationSpinner } from '@/components/ui/NavigationSpinner';

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header component */}
      <Header />
      
      {/* Page content */}
      <main className="flex-1 w-full relative">
        <NavigationSpinner position="absolute" />
        {children || <Outlet />}
      </main>
      
      {/* Footer component */}
      <Footer />

      {/* Floating action buttons */}
      <FloatingButton />
    </div>
  );
} 
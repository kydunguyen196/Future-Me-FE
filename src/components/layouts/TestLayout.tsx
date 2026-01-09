import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationSpinner } from '@/components/ui/NavigationSpinner';

/**
 * Minimal layout for test screens without header/footer
 * Provides a clean, distraction-free environment with Y-axis scrolling
 */
export const TestLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto overflow-x-hidden">
      <main className="min-h-screen flex flex-col relative overflow-y-auto overflow-x-hidden">
        <NavigationSpinner position="absolute" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TestLayout; 
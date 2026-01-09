import { Outlet } from 'react-router-dom';
import { NavigationSpinner } from '@/components/ui/NavigationSpinner';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-1 relative w-full">
        <NavigationSpinner position="absolute" />
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout; 
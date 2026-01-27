import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { role } = useAuth();

  const getThemeClass = () => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'theme-admin';
      case 'provider':
        return 'theme-provider';
      case 'vendor':
        return 'theme-vendor';
      default:
        return 'theme-traveler';
    }
  };

  return (
    <div className={cn('flex min-h-screen w-full bg-background', getThemeClass())}>
      {/* Desktop Sidebar - hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header showNav={false} />
        <main className="flex-1 overflow-auto pb-0 md:pb-0">
          {children}
        </main>
        {/* Mobile Bottom Nav - shown on mobile and tablet */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { EnhancedSidebar } from './EnhancedSidebar';
import { EnhancedHeader } from './EnhancedHeader';
import { FloatingTabBar } from '@/components/app-shell';
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
        return 'theme-super-admin';
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
        <EnhancedSidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <EnhancedHeader showNav={false} />
        
        <main className="flex-1 overflow-auto pb-24 lg:pb-0">
          {children}
        </main>
        
        {/* Floating Tab Bar for mobile/tablet */}
        <FloatingTabBar />
      </div>
    </div>
  );
}

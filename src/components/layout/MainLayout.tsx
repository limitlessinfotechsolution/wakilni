import { ReactNode } from 'react';
import { EnhancedHeader } from './EnhancedHeader';
import { EnhancedFooter } from './EnhancedFooter';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background pattern-islamic">
      <EnhancedHeader />
      <main className="flex-1">{children}</main>
      {showFooter && <EnhancedFooter />}
    </div>
  );
}

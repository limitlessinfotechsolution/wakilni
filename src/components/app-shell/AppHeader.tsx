import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';

interface AppHeaderProps {
  title?: string;
  titleAr?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  showNotifications?: boolean;
  showActions?: boolean;
  transparent?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function AppHeader({
  title,
  titleAr,
  showBack = false,
  showAvatar = true,
  showNotifications = true,
  showActions = false,
  transparent = false,
  onBackClick,
  actions,
  children,
}: AppHeaderProps) {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    haptics.light();
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const displayTitle = isRTL && titleAr ? titleAr : title;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        transparent && !scrolled
          ? 'bg-transparent'
          : 'bg-background/80 backdrop-blur-xl border-b border-border/50',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="safe-area-top" />
      
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-xl -ml-2"
            >
              <ChevronLeft className={cn('h-5 w-5', isRTL && 'rotate-180')} />
              <span className="sr-only">Back</span>
            </Button>
          )}
          
          {showAvatar && !showBack && (
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          {displayTitle && (
            <h1 className={cn(
              'text-lg font-semibold truncate',
              isRTL && 'font-arabic'
            )}>
              {displayTitle}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl relative"
              onClick={() => {
                haptics.light();
                navigate('/notifications');
              }}
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="sr-only">Notifications</span>
            </Button>
          )}
          
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          )}
          
          {actions}
        </div>
      </div>
      
      {/* Optional large title area */}
      {children && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </header>
  );
}

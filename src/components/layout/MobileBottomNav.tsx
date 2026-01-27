import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, FileText, Star, Shield, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const travelerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/dashboard', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
  { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
  { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
];

const providerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/provider', icon: Home },
  { title: 'Services', titleAr: 'الخدمات', href: '/provider/services', icon: FileText },
  { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
  { title: 'KYC', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
];

const vendorNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/vendor', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
  { title: 'Plan', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
];

const adminNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/admin', icon: Home },
  { title: 'Users', titleAr: 'المستخدمون', href: '/admin/users', icon: Users },
  { title: 'KYC', titleAr: 'التحقق', href: '/admin/kyc', icon: Shield },
  { title: 'Stats', titleAr: 'الإحصائيات', href: '/admin/analytics', icon: BarChart3 },
];

export function MobileBottomNav() {
  const { isRTL } = useLanguage();
  const { role } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return adminNav;
      case 'provider':
        return providerNav;
      case 'vendor':
        return vendorNav;
      default:
        return travelerNav;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className={cn('text-xs', isRTL ? 'font-arabic' : '')}>
                {isRTL ? item.titleAr : item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

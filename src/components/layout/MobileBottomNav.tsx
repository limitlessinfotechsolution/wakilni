import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, FileText, Star, Shield, CreditCard, Settings, BarChart3, Bell, Heart, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const travelerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/dashboard', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
  { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
];

const travelerMoreItems: NavItem[] = [
  { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
  { title: 'Donate', titleAr: 'تبرع', href: '/donate', icon: Heart },
];

const providerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/provider', icon: Home },
  { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/provider/services', icon: FileText },
  { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
];

const providerMoreItems: NavItem[] = [
  { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
  { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
];

const vendorNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/vendor', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
  { title: 'Plan', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
];

const vendorMoreItems: NavItem[] = [
  { title: 'Verification', titleAr: 'التحقق', href: '/vendor/kyc', icon: Shield },
  { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
];

const adminNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/admin', icon: Home },
  { title: 'Users', titleAr: 'المستخدمون', href: '/admin/users', icon: Users },
  { title: 'KYC', titleAr: 'التحقق', href: '/admin/kyc', icon: Shield },
  { title: 'Stats', titleAr: 'الإحصائيات', href: '/super-admin/analytics', icon: BarChart3 },
];

const adminMoreItems: NavItem[] = [
  { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: Users },
  { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Users },
  { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
  { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
  { title: 'Settings', titleAr: 'الإعدادات', href: '/super-admin/settings', icon: Settings },
];

export function MobileBottomNav() {
  const { isRTL } = useLanguage();
  const { role } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const getNavItems = (): { main: NavItem[]; more: NavItem[] } => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return { main: adminNav, more: adminMoreItems };
      case 'provider':
        return { main: providerNav, more: providerMoreItems };
      case 'vendor':
        return { main: vendorNav, more: vendorMoreItems };
      default:
        return { main: travelerNav, more: travelerMoreItems };
    }
  };

  const { main: navItems, more: moreItems } = getNavItems();

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-w-0',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                <span className={cn('text-[10px] truncate', isRTL ? 'font-arabic' : '')}>
                  {isRTL ? item.titleAr : item.title}
                </span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-w-0 text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5 shrink-0" />
                <span className={cn('text-[10px]', isRTL ? 'font-arabic' : '')}>
                  {isRTL ? 'المزيد' : 'More'}
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
              <SheetHeader className="pb-4">
                <SheetTitle className={isRTL ? 'font-arabic' : ''}>
                  {isRTL ? 'المزيد من الخيارات' : 'More Options'}
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 pb-6">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className={cn('text-xs text-center', isRTL ? 'font-arabic' : '')}>
                        {isRTL ? item.titleAr : item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="md:hidden h-16 safe-area-inset-bottom" />
    </>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, FileText, Star, Shield, CreditCard, Settings, 
  BarChart3, Heart, Menu, CalendarClock, Building2, Clock, DollarSign, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  titleAr: string;
  items: NavItem[];
}

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[type]);
  }
};

const travelerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/dashboard', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
  { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
];

const travelerMoreSections: NavSection[] = [
  {
    title: 'Actions',
    titleAr: 'إجراءات',
    items: [
      { title: 'Donate', titleAr: 'تبرع', href: '/donate', icon: Heart },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const providerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/provider', icon: Home },
  { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/provider/services', icon: FileText },
  { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
];

const providerMoreSections: NavSection[] = [
  {
    title: 'Manage',
    titleAr: 'إدارة',
    items: [
      { title: 'Availability', titleAr: 'التوفر', href: '/provider/availability', icon: CalendarClock },
      { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const vendorNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/vendor', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
  { title: 'Plan', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
];

const vendorMoreSections: NavSection[] = [
  {
    title: 'Business',
    titleAr: 'الأعمال',
    items: [
      { title: 'Verification', titleAr: 'التحقق', href: '/vendor/kyc', icon: Shield },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const adminNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/admin', icon: Home },
  { title: 'Users', titleAr: 'المستخدمون', href: '/admin/users', icon: Users },
  { title: 'KYC', titleAr: 'التحقق', href: '/admin/kyc', icon: Shield },
  { title: 'Stats', titleAr: 'الإحصائيات', href: '/super-admin/analytics', icon: BarChart3 },
];

const adminMoreSections: NavSection[] = [
  {
    title: 'Management',
    titleAr: 'الإدارة',
    items: [
      { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: Users },
      { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Building2 },
      { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
    ],
  },
  {
    title: 'Finance',
    titleAr: 'المالية',
    items: [
      { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
      { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/super-admin/subscriptions', icon: DollarSign },
    ],
  },
  {
    title: 'System',
    titleAr: 'النظام',
    items: [
      { title: 'Audit Logs', titleAr: 'سجل التدقيق', href: '/super-admin/audit', icon: Clock },
      { title: 'Settings', titleAr: 'الإعدادات', href: '/super-admin/settings', icon: Settings },
    ],
  },
];

export function MobileBottomNav() {
  const { isRTL } = useLanguage();
  const { role, profile } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const getNavItems = (): { main: NavItem[]; moreSections: NavSection[] } => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return { main: adminNav, moreSections: adminMoreSections };
      case 'provider':
        return { main: providerNav, moreSections: providerMoreSections };
      case 'vendor':
        return { main: vendorNav, moreSections: vendorMoreSections };
      default:
        return { main: travelerNav, moreSections: travelerMoreSections };
    }
  };

  const { main: navItems, moreSections } = getNavItems();

  const handleNavPress = useCallback((href: string) => {
    triggerHaptic('light');
    setPressedItem(href);
    setTimeout(() => setPressedItem(null), 150);
  }, []);

  const handleSheetToggle = useCallback((open: boolean) => {
    triggerHaptic(open ? 'medium' : 'light');
    setSheetOpen(open);
  }, []);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const getRoleColor = () => {
    switch (role) {
      case 'super_admin': return 'from-red-500 to-rose-600';
      case 'admin': return 'from-purple-500 to-violet-600';
      case 'provider': return 'from-amber-500 to-orange-600';
      case 'vendor': return 'from-blue-500 to-indigo-600';
      default: return 'from-emerald-500 to-teal-600';
    }
  };

  const getRoleLabel = () => {
    const labels: Record<string, { en: string; ar: string }> = {
      super_admin: { en: 'Super Admin', ar: 'المشرف الرئيسي' },
      admin: { en: 'Admin', ar: 'مشرف' },
      provider: { en: 'Provider', ar: 'مقدم خدمة' },
      vendor: { en: 'Vendor', ar: 'شركة' },
      traveler: { en: 'Traveler', ar: 'مسافر' },
    };
    const config = labels[role || 'traveler'];
    return isRTL ? config.ar : config.en;
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || 
      (href !== '/dashboard' && href !== '/provider' && href !== '/vendor' && href !== '/admin' && location.pathname.startsWith(href));
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border/40 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around h-16 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {navItems.slice(0, 4).map((item) => {
            const isActive = isItemActive(item.href);
            const isPressed = pressedItem === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => handleNavPress(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 min-w-0 relative select-none',
                  'touch-manipulation',
                  isPressed && 'scale-90',
                  !isActive && 'active:scale-90'
                )}
              >
                {/* Active indicator pill */}
                <div className={cn(
                  'absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300 ease-out',
                  isActive ? 'w-6 bg-primary' : 'w-0 bg-transparent'
                )} />
                
                {/* Icon container with spring animation */}
                <div className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ease-out',
                  isActive 
                    ? 'bg-primary/12 scale-105' 
                    : 'hover:bg-muted/60 active:bg-muted'
                )}>
                  <Icon className={cn(
                    'h-[22px] w-[22px] transition-all duration-300',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                
                {/* Label with fade effect */}
                <span className={cn(
                  'text-[10px] font-medium truncate max-w-[56px] transition-all duration-300',
                  isRTL ? 'font-arabic' : '',
                  isActive ? 'text-primary opacity-100' : 'text-muted-foreground opacity-80'
                )}>
                  {isRTL ? item.titleAr : item.title}
                </span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <Sheet open={sheetOpen} onOpenChange={handleSheetToggle}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 min-w-0 select-none',
                  'touch-manipulation active:scale-90',
                  sheetOpen && 'scale-90'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ease-out',
                  sheetOpen ? 'bg-primary/12 rotate-90' : 'hover:bg-muted/60 active:bg-muted'
                )}>
                  <Menu className={cn(
                    'h-[22px] w-[22px] transition-all duration-300',
                    sheetOpen ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all duration-300',
                  isRTL ? 'font-arabic' : '',
                  sheetOpen ? 'text-primary' : 'text-muted-foreground opacity-80'
                )}>
                  {isRTL ? 'المزيد' : 'More'}
                </span>
              </button>
            </SheetTrigger>
            
            <SheetContent 
              side="bottom" 
              className="h-auto max-h-[80vh] rounded-t-[28px] px-0 border-0 bg-background/98 backdrop-blur-2xl"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/25 rounded-full" />
              </div>
              
              <SheetHeader className="px-6 pb-2">
                <div className="flex items-center justify-between">
                  <SheetTitle className={cn(
                    'text-sm font-semibold uppercase tracking-wider text-muted-foreground',
                    isRTL && 'font-arabic'
                  )}>
                    {isRTL ? 'القائمة' : 'Navigation'}
                  </SheetTitle>
                  <button 
                    onClick={() => handleSheetToggle(false)}
                    className="p-2 rounded-full hover:bg-muted/60 transition-colors active:scale-90"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </SheetHeader>
              
              {/* User Profile Card */}
              <div className="mx-5 mb-5 p-4 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 border border-border/30">
                <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                  <Avatar className="h-12 w-12 border-2 border-background shadow-lg ring-2 ring-primary/20">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className={cn('bg-gradient-to-br text-white font-bold text-sm', getRoleColor())}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                    <p className="font-semibold truncate text-foreground text-sm">
                      {profile?.full_name || 'User'}
                    </p>
                    <Badge 
                      className={cn(
                        'mt-1 text-[9px] px-2 py-0 font-medium border-0 bg-gradient-to-r text-white',
                        getRoleColor()
                      )}
                    >
                      {getRoleLabel()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Navigation Sections */}
              <div className="px-5 space-y-5 pb-6 overflow-y-auto max-h-[45vh]">
                {moreSections.map((section, idx) => (
                  <div key={section.title}>
                    {idx > 0 && <Separator className="mb-4 bg-border/40" />}
                    <h3 className={cn(
                      'text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 px-1',
                      isRTL && 'font-arabic text-right'
                    )}>
                      {isRTL ? section.titleAr : section.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => {
                              triggerHaptic('light');
                              setSheetOpen(false);
                            }}
                            className={cn(
                              'flex flex-col items-center gap-1.5 p-3.5 rounded-2xl transition-all duration-200 active:scale-95 select-none touch-manipulation',
                              isActive 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                                : 'bg-muted/40 hover:bg-muted/70 text-foreground active:bg-muted'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className={cn(
                              'text-[10px] font-medium text-center leading-tight',
                              isRTL ? 'font-arabic' : ''
                            )}>
                              {isRTL ? item.titleAr : item.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="lg:hidden h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Plus, 
  User, 
  Settings,
  LayoutDashboard,
  Briefcase,
  Users,
  Star,
  Package,
  ShieldCheck,
  BarChart3,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useHaptics } from '@/hooks/useHaptics';

interface TabItem {
  icon: LucideIcon;
  label: string;
  labelAr: string;
  path: string;
  isCenter?: boolean;
}

const TRAVELER_TABS: TabItem[] = [
  { icon: Home, label: 'Home', labelAr: 'الرئيسية', path: '/dashboard' },
  { icon: Calendar, label: 'Bookings', labelAr: 'الحجوزات', path: '/bookings' },
  { icon: Plus, label: 'Book', labelAr: 'حجز', path: '/bookings/new', isCenter: true },
  { icon: Users, label: 'Family', labelAr: 'العائلة', path: '/beneficiaries' },
  { icon: User, label: 'Profile', labelAr: 'الملف', path: '/settings' },
];

const PROVIDER_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/dashboard' },
  { icon: Calendar, label: 'Calendar', labelAr: 'التقويم', path: '/provider/calendar' },
  { icon: Package, label: 'Services', labelAr: 'الخدمات', path: '/provider/services' },
  { icon: Star, label: 'Reviews', labelAr: 'التقييمات', path: '/provider/reviews' },
  { icon: User, label: 'Profile', labelAr: 'الملف', path: '/settings' },
];

const VENDOR_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/dashboard' },
  { icon: Briefcase, label: 'Bookings', labelAr: 'الحجوزات', path: '/vendor/bookings' },
  { icon: Users, label: 'Providers', labelAr: 'مقدمي الخدمة', path: '/vendor/services' },
  { icon: Settings, label: 'Settings', labelAr: 'الإعدادات', path: '/settings' },
];

const ADMIN_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/dashboard' },
  { icon: ShieldCheck, label: 'KYC', labelAr: 'التحقق', path: '/admin/kyc-queue' },
  { icon: Users, label: 'Users', labelAr: 'المستخدمين', path: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', labelAr: 'التحليلات', path: '/super-admin/analytics' },
  { icon: Settings, label: 'Settings', labelAr: 'الإعدادات', path: '/settings' },
];

export function FloatingTabBar() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const haptics = useHaptics();

  const tabs = React.useMemo(() => {
    switch (role) {
      case 'provider':
        return PROVIDER_TABS;
      case 'vendor':
        return VENDOR_TABS;
      case 'admin':
      case 'super_admin':
        return ADMIN_TABS;
      default:
        return TRAVELER_TABS;
    }
  }, [role]);

  const handleTabClick = (path: string) => {
    haptics.selection();
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="floating-tab-bar lg:hidden">
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  'relative -mt-6 flex items-center justify-center',
                  'w-14 h-14 rounded-full',
                  'bg-gradient-to-br from-primary to-primary/80',
                  'text-white shadow-lg shadow-primary/30',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'touch-manipulation'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="sr-only">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'tab-item touch-manipulation',
                active && 'active'
              )}
            >
              <div className={cn('tab-icon', active && 'bg-primary/10')}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

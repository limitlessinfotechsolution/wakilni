import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Heart, Shield, Settings, FileText, Bell, TrendingUp, Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAuth } from '@/lib/auth';
import { 
  UserStatsWidget, 
  KycQueueWidget, 
  BookingsAnalyticsWidget, 
  RevenueStatsWidget,
  PlatformHealthWidget,
  CharityStatsWidget
} from '@/components/dashboard/AdminWidgets';

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const { stats, isLoading } = useAdminStats();
  const { isSuperAdmin } = useAuth();

  const adminLinks = [
    {
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL ? 'إدارة المسافرين والأدوار' : 'Manage travelers and roles',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'مقدمو الخدمات' : 'Providers',
      description: isRTL ? 'إدارة مقدمي الخدمات' : 'Manage service providers',
      href: '/admin/providers',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'الوكلاء' : 'Vendors',
      description: isRTL ? 'إدارة وكالات السفر' : 'Manage travel agencies',
      href: '/admin/vendors',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'طابور التحقق' : 'KYC Queue',
      description: isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests',
      href: '/admin/kyc',
      icon: <Shield className="h-5 w-5" />,
      badge: stats.pendingKyc,
    },
    {
      title: isRTL ? 'التبرعات' : 'Donations',
      description: isRTL ? 'إدارة التبرعات' : 'Manage donations',
      href: '/admin/donations',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'التخصيصات' : 'Allocations',
      description: isRTL ? 'تعيين الحجوزات' : 'Assign bookings',
      href: '/admin/allocations',
      icon: <Calendar className="h-5 w-5" />,
      badge: stats.pendingBookings,
    },
  ];

  const superAdminLinks = [
    {
      title: isRTL ? 'إعدادات النظام' : 'System Settings',
      href: '/super-admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'سجل التدقيق' : 'Audit Logs',
      href: '/super-admin/audit',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'إدارة المشرفين' : 'Admins',
      href: '/super-admin/admins',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isRTL ? 'font-arabic' : ''}`}>
            {isSuperAdmin 
              ? (isRTL ? 'لوحة التحكم الرئيسية' : 'Super Admin Dashboard')
              : (isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard')
            }
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'نظرة عامة على المنصة' : 'Platform overview'}
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UserStatsWidget 
            travelers={stats.totalTravelers} 
            providers={stats.totalProviders} 
            vendors={stats.totalVendors}
            newThisWeek={0}
          />
          <KycQueueWidget 
            pending={stats.pendingKyc} 
            underReview={0} 
            approvedToday={0}
            rejectedToday={0}
          />
          <BookingsAnalyticsWidget 
            total={stats.totalBookings} 
            pending={stats.pendingBookings} 
            inProgress={0}
            completed={stats.completedBookings}
            completionRate={stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}
          />
          <RevenueStatsWidget 
            totalDonations={stats.donationAmount} 
            platformFees={0}
            thisMonth={0}
            growth={0}
          />
          <CharityStatsWidget 
            totalRequests={0} 
            fulfilled={0}
            pendingApproval={0}
            totalDistributed={stats.donationAmount}
          />
          <PlatformHealthWidget 
            uptime={99.9} 
            activeUsers={stats.totalTravelers + stats.totalProviders + stats.totalVendors}
            errorRate={0}
            avgResponseTime={0}
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'الإدارة' : 'Management'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{link.title}</h3>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </div>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div>
            <h2 className={`text-lg font-semibold mb-4 text-destructive ${isRTL ? 'font-arabic' : ''}`}>
              <Shield className="inline-block h-5 w-5 me-2" />
              {isRTL ? 'تحكم المشرف الرئيسي' : 'Super Admin Controls'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {superAdminLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <Card className="h-full hover:border-destructive transition-colors cursor-pointer border-destructive/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                          {link.icon}
                        </div>
                        <h3 className="font-medium">{link.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
            <CardDescription>
              {isRTL ? 'آخر الأحداث على المنصة' : 'Latest platform events'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

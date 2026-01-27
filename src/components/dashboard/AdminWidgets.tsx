import { Users, UserCheck, Building2, Shield, Calendar, Heart, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

// User Stats Widget
export function UserStatsWidget({ 
  travelers = 0, 
  providers = 0, 
  vendors = 0,
  newThisWeek = 0 
}: { 
  travelers?: number; 
  providers?: number;
  vendors?: number;
  newThisWeek?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Users className="h-5 w-5 text-blue-500" />
          {isRTL ? 'المستخدمون' : 'Users'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'المسافرون' : 'Travelers'}</span>
            <span className="font-bold">{travelers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
            <span className="font-bold">{providers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'الوكلاء' : 'Vendors'}</span>
            <span className="font-bold">{vendors}</span>
          </div>
          <div className="pt-2 border-t">
            <Badge variant="secondary">
              +{newThisWeek} {isRTL ? 'هذا الأسبوع' : 'this week'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// KYC Queue Widget
export function KycQueueWidget({ 
  pending = 0, 
  underReview = 0, 
  approvedToday = 0,
  rejectedToday = 0 
}: { 
  pending?: number; 
  underReview?: number;
  approvedToday?: number;
  rejectedToday?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Shield className="h-5 w-5 text-yellow-600" />
          {isRTL ? 'طابور التحقق' : 'KYC Queue'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'قيد الانتظار' : 'Pending'}</span>
            <Badge variant="outline" className="font-bold">{pending}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'قيد المراجعة' : 'Under Review'}</span>
            <Badge variant="secondary">{underReview}</Badge>
          </div>
          <div className="pt-2 border-t flex justify-between">
            <div className="text-center">
              <p className="text-lg font-bold text-green-500">{approvedToday}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'موافق اليوم' : 'Approved'}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">{rejectedToday}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'مرفوض اليوم' : 'Rejected'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bookings Analytics Widget
export function BookingsAnalyticsWidget({ 
  total = 0, 
  pending = 0, 
  inProgress = 0,
  completed = 0,
  completionRate = 0 
}: { 
  total?: number; 
  pending?: number;
  inProgress?: number;
  completed?: number;
  completionRate?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Calendar className="h-5 w-5 text-primary" />
          {isRTL ? 'الحجوزات' : 'Bookings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-yellow-500">{pending}</p>
              <p className="text-muted-foreground">{isRTL ? 'معلق' : 'Pending'}</p>
            </div>
            <div>
              <p className="font-bold text-blue-500">{inProgress}</p>
              <p className="text-muted-foreground">{isRTL ? 'جارٍ' : 'In Progress'}</p>
            </div>
            <div>
              <p className="font-bold text-green-500">{completed}</p>
              <p className="text-muted-foreground">{isRTL ? 'مكتمل' : 'Completed'}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{isRTL ? 'معدل الإكمال' : 'Completion Rate'}</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Revenue Widget
export function RevenueStatsWidget({ 
  totalDonations = 0, 
  platformFees = 0,
  thisMonth = 0,
  growth = 0 
}: { 
  totalDonations?: number; 
  platformFees?: number;
  thisMonth?: number;
  growth?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <TrendingUp className="h-5 w-5 text-green-500" />
          {isRTL ? 'الإيرادات' : 'Revenue'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي التبرعات' : 'Total Donations'}</p>
            <p className="text-2xl font-bold text-green-500">SAR {totalDonations.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{isRTL ? 'هذا الشهر' : 'This Month'}</span>
            <span className="font-medium">SAR {thisMonth.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={growth >= 0 ? 'default' : 'destructive'}>
              {growth >= 0 ? '+' : ''}{growth}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Platform Health Widget
export function PlatformHealthWidget({ 
  uptime = 99.9, 
  activeUsers = 0,
  errorRate = 0,
  avgResponseTime = 0 
}: { 
  uptime?: number; 
  activeUsers?: number;
  errorRate?: number;
  avgResponseTime?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Activity className="h-5 w-5 text-purple-500" />
          {isRTL ? 'صحة النظام' : 'System Health'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'وقت التشغيل' : 'Uptime'}</span>
            <Badge className="bg-green-500">{uptime}%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'المستخدمون النشطون' : 'Active Users'}</span>
            <span className="font-bold">{activeUsers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">{isRTL ? 'معدل الخطأ' : 'Error Rate'}</span>
            <span className={`font-bold ${errorRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
              {errorRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Charity Stats Widget
export function CharityStatsWidget({ 
  totalRequests = 0, 
  fulfilled = 0,
  pendingApproval = 0,
  totalDistributed = 0 
}: { 
  totalRequests?: number; 
  fulfilled?: number;
  pendingApproval?: number;
  totalDistributed?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Heart className="h-5 w-5 text-red-500" />
          {isRTL ? 'الصدقات' : 'Charity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{totalRequests}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'الطلبات' : 'Requests'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{fulfilled}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'مُنجز' : 'Fulfilled'}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isRTL ? 'موزع' : 'Distributed'}</span>
              <span className="font-medium text-green-500">SAR {totalDistributed.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

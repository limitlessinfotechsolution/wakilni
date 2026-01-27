import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Shield, Activity, 
  AlertTriangle, Settings, Zap, Server, Database, Globe
} from 'lucide-react';
import { 
  BookingTrendsChart, 
  RevenuePieChart, 
  UserGrowthChart,
  ServiceDistributionChart,
  KycStatusChart 
} from '@/components/admin/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Mock data - in production, this would come from hooks
const mockBookingTrends = [
  { date: 'Jan', bookings: 45 },
  { date: 'Feb', bookings: 52 },
  { date: 'Mar', bookings: 61 },
  { date: 'Apr', bookings: 58 },
  { date: 'May', bookings: 71 },
  { date: 'Jun', bookings: 85 },
];

const mockRevenueData = [
  { name: 'Umrah', value: 45000 },
  { name: 'Hajj', value: 75000 },
  { name: 'Ziyarat', value: 15000 },
];

const mockUserGrowth = [
  { date: 'Jan', users: 120 },
  { date: 'Feb', users: 145 },
  { date: 'Mar', users: 178 },
  { date: 'Apr', users: 210 },
  { date: 'May', users: 256 },
  { date: 'Jun', users: 312 },
];

export default function SuperAdminAnalyticsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p>{isRTL ? 'غير مصرح لك بالوصول إلى هذه الصفحة' : 'You are not authorized to access this page'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
              <BarChart3 className="h-6 w-6 text-primary" />
              {isRTL ? 'التحليلات المتقدمة' : 'Advanced Analytics'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'نظرة شاملة على أداء المنصة' : 'Comprehensive platform performance overview'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 me-1" />
              {isRTL ? 'مباشر' : 'Live'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                  <p className="text-2xl font-bold">135,000 SAR</p>
                  <p className="text-xs text-green-600">+12.5% {isRTL ? 'من الشهر الماضي' : 'from last month'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'المستخدمون النشطون' : 'Active Users'}</p>
                  <p className="text-2xl font-bold">1,248</p>
                  <p className="text-xs text-green-600">+8.2% {isRTL ? 'من الأسبوع الماضي' : 'from last week'}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'معدل الإتمام' : 'Completion Rate'}</p>
                  <p className="text-2xl font-bold">94.7%</p>
                  <p className="text-xs text-green-600">+2.1% {isRTL ? 'تحسن' : 'improvement'}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'طلبات التحقق' : 'KYC Requests'}</p>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-xs text-yellow-600">{isRTL ? 'قيد الانتظار' : 'pending'}</p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="users">{isRTL ? 'المستخدمون' : 'Users'}</TabsTrigger>
            <TabsTrigger value="system">{isRTL ? 'النظام' : 'System'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BookingTrendsChart data={mockBookingTrends} />
              <RevenuePieChart data={mockRevenueData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ServiceDistributionChart umrah={156} hajj={89} ziyarat={45} />
              <KycStatusChart pending={23} underReview={8} approved={245} rejected={12} />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UserGrowthChart data={mockUserGrowth} />
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'توزيع المستخدمين' : 'User Distribution'}</CardTitle>
                  <CardDescription>{isRTL ? 'حسب نوع الحساب' : 'By account type'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>{isRTL ? 'المسافرون' : 'Travelers'}</span>
                      </div>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        <span>{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                      </div>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span>{isRTL ? 'الوكلاء' : 'Vendors'}</span>
                      </div>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>{isRTL ? 'المشرفون' : 'Admins'}</span>
                      </div>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    {isRTL ? 'وقت التشغيل' : 'Uptime'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">99.99%</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'خلال 30 يوم' : 'Last 30 days'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {isRTL ? 'سرعة الاستجابة' : 'Response Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">145ms</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط' : 'Average'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {isRTL ? 'استخدام قاعدة البيانات' : 'Database Usage'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">2.4 GB</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'من 10 GB' : 'of 10 GB'}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {isRTL ? 'التحكم السريع' : 'Quick Controls'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/settings')}>
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? 'إعدادات النظام' : 'System Settings'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/audit')}>
                    {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/admins')}>
                    {isRTL ? 'إدارة المشرفين' : 'Manage Admins'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

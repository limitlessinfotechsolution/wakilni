import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  bookings?: number;
  revenue?: number;
  users?: number;
}

const COLORS = ['hsl(158, 64%, 28%)', 'hsl(43, 74%, 49%)', 'hsl(220, 70%, 50%)', 'hsl(280, 65%, 50%)', 'hsl(0, 72%, 51%)'];

interface BookingTrendsChartProps {
  data: TimeSeriesData[];
}

export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'font-arabic' : ''}>
          {isRTL ? 'اتجاهات الحجوزات' : 'Booking Trends'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'نظرة على الحجوزات خلال الفترة الماضية' : 'Booking overview for the past period'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(158, 64%, 28%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(158, 64%, 28%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(158, 64%, 28%)"
                fillOpacity={1}
                fill="url(#colorBookings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface RevenuePieChartProps {
  data: ChartData[];
}

export function RevenuePieChart({ data }: RevenuePieChartProps) {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'font-arabic' : ''}>
          {isRTL ? 'توزيع الإيرادات' : 'Revenue Distribution'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'حسب نوع الخدمة' : 'By service type'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface UserGrowthChartProps {
  data: TimeSeriesData[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'font-arabic' : ''}>
          {isRTL ? 'نمو المستخدمين' : 'User Growth'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'المستخدمون الجدد شهرياً' : 'New users monthly'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="users" fill="hsl(43, 74%, 49%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceDistributionChartProps {
  umrah: number;
  hajj: number;
  ziyarat: number;
}

export function ServiceDistributionChart({ umrah, hajj, ziyarat }: ServiceDistributionChartProps) {
  const { isRTL } = useLanguage();

  const data = useMemo(() => [
    { name: isRTL ? 'العمرة' : 'Umrah', value: umrah },
    { name: isRTL ? 'الحج' : 'Hajj', value: hajj },
    { name: isRTL ? 'الزيارة' : 'Ziyarat', value: ziyarat },
  ], [umrah, hajj, ziyarat, isRTL]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'font-arabic' : ''}>
          {isRTL ? 'توزيع الخدمات' : 'Service Distribution'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'عدد الحجوزات حسب نوع الخدمة' : 'Bookings by service type'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface KycStatusChartProps {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
}

export function KycStatusChart({ pending, underReview, approved, rejected }: KycStatusChartProps) {
  const { isRTL } = useLanguage();

  const data = useMemo(() => [
    { name: isRTL ? 'قيد الانتظار' : 'Pending', value: pending, fill: 'hsl(43, 74%, 49%)' },
    { name: isRTL ? 'قيد المراجعة' : 'Under Review', value: underReview, fill: 'hsl(220, 70%, 50%)' },
    { name: isRTL ? 'موافق عليه' : 'Approved', value: approved, fill: 'hsl(158, 64%, 28%)' },
    { name: isRTL ? 'مرفوض' : 'Rejected', value: rejected, fill: 'hsl(0, 72%, 51%)' },
  ], [pending, underReview, approved, rejected, isRTL]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'font-arabic' : ''}>
          {isRTL ? 'حالة التحقق' : 'KYC Status'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'توزيع طلبات التحقق' : 'Verification requests distribution'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

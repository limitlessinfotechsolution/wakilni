import { useState, useMemo } from 'react';
import { 
  FileText, User, Clock, Filter, Search, RefreshCw, Shield, 
  UserPlus, UserMinus, CheckCircle, XCircle, CreditCard,
  Building2, UserCheck, AlertTriangle, Activity, Download
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function AuditLogsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { logs, isLoading, refetch } = useAuditLogs({
    entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
    limit: 200,
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (!searchQuery) return true;
      const action = log.action.toLowerCase();
      const entityType = log.entity_type.toLowerCase();
      return action.includes(searchQuery.toLowerCase()) || 
             entityType.includes(searchQuery.toLowerCase());
    });
  }, [logs, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(l => new Date(l.created_at) >= today);
    const userActions = logs.filter(l => l.entity_type === 'user').length;
    const subscriptionActions = logs.filter(l => l.entity_type === 'subscription').length;
    const kycActions = logs.filter(l => 
      l.action.includes('kyc') || l.action.includes('approved') || l.action.includes('rejected')
    ).length;

    return { todayLogs: todayLogs.length, userActions, subscriptionActions, kycActions };
  }, [logs]);

  const getActionIcon = (action: string) => {
    if (action.includes('created') || action.includes('add')) return <UserPlus className="h-4 w-4" />;
    if (action.includes('deleted') || action.includes('remove')) return <UserMinus className="h-4 w-4" />;
    if (action.includes('approved')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('rejected') || action.includes('suspended')) return <XCircle className="h-4 w-4" />;
    if (action.includes('subscription')) return <CreditCard className="h-4 w-4" />;
    if (action.includes('role')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('add') || action.includes('approved') || action.includes('activated')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    if (action.includes('deleted') || action.includes('remove') || action.includes('rejected') || action.includes('suspended')) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    if (action.includes('update') || action.includes('change') || action.includes('extended')) {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        {getActionIcon(action)}
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'super_admin': 
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin': 
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default: 
        return <Badge variant="outline">{role || 'Unknown'}</Badge>;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'provider': return <UserCheck className="h-4 w-4" />;
      case 'vendor': return <Building2 className="h-4 w-4" />;
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const openDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="container py-8 px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? 'غير مصرح' : 'Unauthorized'}</AlertTitle>
            <AlertDescription>
              {isRTL 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
                : 'You do not have permission to access this page.'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Islamic Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground font-arabic mb-2">
            إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', isRTL && 'font-arabic')}>
              <FileText className="h-6 w-6 text-primary" />
              {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL ? 'تتبع جميع الإجراءات الإدارية على المنصة' : 'Track all administrative actions on the platform'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'اليوم' : 'Today'}
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.todayLogs}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-200 dark:bg-blue-800">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المستخدمين' : 'User Actions'}
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.userActions}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-200 dark:bg-purple-800">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'التحقق' : 'KYC Reviews'}
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.kycActions}</p>
                </div>
                <div className="p-2 rounded-full bg-green-200 dark:bg-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'الاشتراكات' : 'Subscriptions'}
                  </p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.subscriptionActions}</p>
                </div>
                <div className="p-2 rounded-full bg-amber-200 dark:bg-amber-800">
                  <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={isRTL ? 'البحث في السجلات...' : 'Search logs...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={isRTL ? 'نوع الكيان' : 'Entity Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="user">{isRTL ? 'المستخدمين' : 'Users'}</SelectItem>
                  <SelectItem value="provider">{isRTL ? 'مقدمي الخدمات' : 'Providers'}</SelectItem>
                  <SelectItem value="vendor">{isRTL ? 'الوكلاء' : 'Vendors'}</SelectItem>
                  <SelectItem value="subscription">{isRTL ? 'الاشتراكات' : 'Subscriptions'}</SelectItem>
                  <SelectItem value="booking">{isRTL ? 'الحجوزات' : 'Bookings'}</SelectItem>
                  <SelectItem value="system">{isRTL ? 'النظام' : 'System'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {isRTL ? 'سجلات النشاط' : 'Activity Logs'}
            </CardTitle>
            <CardDescription>
              {isRTL ? `إجمالي: ${filteredLogs.length} سجل` : `Total: ${filteredLogs.length} logs`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground animate-pulse">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">
                  {isRTL ? 'لا توجد سجلات' : 'No logs found'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'ستظهر السجلات عند إجراء عمليات إدارية' : 'Logs will appear when administrative actions are performed'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">{isRTL ? 'الوقت' : 'Time'}</TableHead>
                      <TableHead>{isRTL ? 'المنفذ' : 'Actor'}</TableHead>
                      <TableHead>{isRTL ? 'الإجراء' : 'Action'}</TableHead>
                      <TableHead>{isRTL ? 'نوع الكيان' : 'Entity'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'التفاصيل' : 'Details'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="group">
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <div>
                              <p>{format(new Date(log.created_at), 'MMM d, yyyy', { locale: isRTL ? ar : undefined })}</p>
                              <p className="text-xs">{format(new Date(log.created_at), 'HH:mm:ss')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(log.actor_role)}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {getEntityIcon(log.entity_type)}
                            {log.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openDetails(log)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isRTL ? 'عرض' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {isRTL ? 'تفاصيل السجل' : 'Log Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedLog?.created_at && format(new Date(selectedLog.created_at), 'PPpp', { locale: isRTL ? ar : undefined })}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isRTL ? 'الإجراء' : 'Action'}
                    </p>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isRTL ? 'نوع الكيان' : 'Entity Type'}
                    </p>
                    <Badge variant="outline" className="gap-1">
                      {getEntityIcon(selectedLog.entity_type)}
                      {selectedLog.entity_type}
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isRTL ? 'معرف الكيان' : 'Entity ID'}
                    </p>
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {selectedLog.entity_id || 'N/A'}
                    </code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {isRTL ? 'دور المنفذ' : 'Actor Role'}
                    </p>
                    {getRoleBadge(selectedLog.actor_role)}
                  </div>
                </div>
                
                {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {isRTL ? 'القيم السابقة' : 'Previous Values'}
                    </p>
                    <pre className="text-xs bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 p-3 rounded-lg overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {isRTL ? 'القيم الجديدة' : 'New Values'}
                    </p>
                    <pre className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 p-3 rounded-lg overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {isRTL ? 'بيانات إضافية' : 'Metadata'}
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

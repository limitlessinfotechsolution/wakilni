import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera, Bell, Globe, Shield, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  full_name_ar: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface NotificationPreferences {
  email_bookings: boolean;
  email_marketing: boolean;
  push_bookings: boolean;
  push_messages: boolean;
}

export default function ProfileSettingsPage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_bookings: true,
    email_marketing: false,
    push_bookings: true,
    push_messages: true,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      full_name_ar: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        full_name_ar: profile.full_name_ar || '',
        phone: profile.phone || '',
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          full_name_ar: data.full_name_ar || null,
          phone: data.phone || null,
          preferred_language: language,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, just store a placeholder
        console.error('Upload error:', uploadError);
        toast({
          title: isRTL ? 'تنبيه' : 'Notice',
          description: isRTL ? 'تخزين الصور غير متاح حالياً' : 'Avatar storage is not available yet.',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      setAvatarUrl(publicUrl);
      await refreshProfile();

      toast({
        title: isRTL ? 'تم التحميل' : 'Uploaded',
        description: isRTL ? 'تم تحديث صورتك الشخصية' : 'Your avatar has been updated.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل الصورة' : 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
            {isRTL ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة معلوماتك الشخصية وتفضيلاتك' : 'Manage your personal information and preferences'}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'التفضيلات' : 'Preferences'}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'صورة الملف الشخصي' : 'Profile Picture'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'صورتك ستظهر للمستخدمين الآخرين' : 'Your photo will be visible to other users'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className={cn(
                        'absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer',
                        'hover:bg-primary/90 transition-colors',
                        isUploadingAvatar && 'pointer-events-none opacity-50'
                      )}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'يُفضل استخدام صورة مربعة بحجم 256×256 بكسل على الأقل'
                        : 'A square image of at least 256x256 pixels is recommended'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'قم بتحديث معلومات حسابك' : 'Update your account information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="full_name_ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'الاسم الكامل (بالعربية)' : 'Full Name (Arabic)'}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="أحمد محمد" 
                              dir="rtl" 
                              className="font-arabic" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {isRTL ? 'اختياري - للعرض باللغة العربية' : 'Optional - for Arabic display'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+966 5X XXX XXXX" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Email Section (read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL 
                    ? 'البريد الإلكتروني مرتبط بحسابك ولا يمكن تغييره'
                    : 'Your email is linked to your account and cannot be changed'
                  }
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اختر ما تريد استلامه عبر البريد الإلكتروني' : 'Choose what you want to receive via email'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'استلم إشعارات حول حالة حجوزاتك' : 'Receive updates about your booking status'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_bookings}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_bookings: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? 'العروض والأخبار' : 'Promotions & News'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'استلم عروض خاصة ومستجدات المنصة' : 'Receive special offers and platform updates'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.email_marketing}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, email_marketing: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'إشعارات التطبيق' : 'Push Notifications'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'إشعارات فورية داخل التطبيق' : 'Real-time in-app notifications'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? 'تحديثات الحجوزات' : 'Booking Updates'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إشعارات فورية عند تغيير حالة الحجز' : 'Instant alerts when booking status changes'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_bookings}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_bookings: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{isRTL ? 'الرسائل' : 'Messages'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إشعارات عند استلام رسائل جديدة' : 'Alerts when you receive new messages'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.push_messages}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs(prev => ({ ...prev, push_messages: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'اللغة والمنطقة' : 'Language & Region'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'لغة العرض' : 'Display Language'}</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ar')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

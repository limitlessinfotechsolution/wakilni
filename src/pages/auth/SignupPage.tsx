import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight, 
  Phone, MapPin, Building2, CheckCircle2, FileText, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

type RoleType = 'traveler' | 'provider' | 'vendor';
type StepType = 'role' | 'account' | 'profile' | 'complete';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  fullNameAr: string;
  phone: string;
  // Provider specific
  companyName: string;
  companyNameAr: string;
  bio: string;
  bioAr: string;
  // Vendor specific
  commercialReg: string;
  taxNumber: string;
  address: string;
  addressAr: string;
}

const ROLE_STEPS: Record<RoleType, StepType[]> = {
  traveler: ['role', 'account', 'complete'],
  provider: ['role', 'account', 'profile', 'complete'],
  vendor: ['role', 'account', 'profile', 'complete'],
};

export default function SignupPage() {
  const { t, isRTL } = useLanguage();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<StepType>('role');
  const [selectedRole, setSelectedRole] = useState<RoleType>('traveler');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    fullNameAr: '',
    phone: '',
    companyName: '',
    companyNameAr: '',
    bio: '',
    bioAr: '',
    commercialReg: '',
    taxNumber: '',
    address: '',
    addressAr: '',
  });

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = ROLE_STEPS[selectedRole];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setCurrentStep('account');
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 'account') {
      if (!formData.email || !formData.password || !formData.fullName) {
        toast({
          title: t.common.error,
          description: t.auth.emailRequired,
          variant: 'destructive',
        });
        return;
      }
      if (formData.password.length < 8) {
        toast({
          title: t.common.error,
          description: t.auth.passwordTooShort,
          variant: 'destructive',
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t.common.error,
          description: t.auth.passwordMismatch,
          variant: 'destructive',
        });
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName, selectedRole);

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: t.common.success,
      description: t.auth.signupSuccess,
    });

    setCurrentStep('complete');
    setIsLoading(false);

    // Navigate after delay
    setTimeout(() => {
      navigate(selectedRole === 'provider' ? '/provider' : selectedRole === 'vendor' ? '/vendor' : '/dashboard');
    }, 2000);
  };

  const getStepLabel = (step: StepType): string => {
    const labels: Record<StepType, { en: string; ar: string }> = {
      role: { en: 'Select Role', ar: 'اختر الدور' },
      account: { en: 'Account', ar: 'الحساب' },
      profile: { en: 'Profile', ar: 'الملف الشخصي' },
      complete: { en: 'Complete', ar: 'مكتمل' },
    };
    return isRTL ? labels[step].ar : labels[step].en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pattern-islamic">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className={`text-lg font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
          </div>
          <span className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>{t.brand}</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          {/* Progress Indicator */}
          {currentStep !== 'role' && (
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        index < currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : index === currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-12 sm:w-20 h-1 mx-1',
                          index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {getStepLabel(currentStep)}
              </p>
            </div>
          )}

          {/* Step: Role Selection */}
          {currentStep === 'role' && (
            <>
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
                  {t.auth.signupAs}
                </CardTitle>
                <CardDescription>{isRTL ? 'اختر نوع حسابك' : 'Choose your account type'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Traveler */}
                <button
                  onClick={() => handleRoleSelect('traveler')}
                  className="w-full p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-start group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{t.auth.traveler}</h3>
                      <p className="text-sm text-muted-foreground">{t.auth.travelerDesc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'حجز خدمات' : 'Book services'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'تتبع الحجوزات' : 'Track bookings'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Provider */}
                <button
                  onClick={() => handleRoleSelect('provider')}
                  className="w-full p-4 border border-border rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all text-start group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{t.auth.provider}</h3>
                      <p className="text-sm text-muted-foreground">{t.auth.providerDesc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'تقديم خدمات' : 'Offer services'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'كسب الأرباح' : 'Earn income'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Vendor */}
                <button
                  onClick={() => handleRoleSelect('vendor')}
                  className="w-full p-4 border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-start group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{isRTL ? 'شركة خدمات' : 'Service Vendor'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'إدارة وكالة السفر ومقدمي الخدمات' : 'Manage your travel agency and providers'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'إدارة فريق' : 'Manage team'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {isRTL ? 'اشتراكات' : 'Subscriptions'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  {t.auth.hasAccount}{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t.auth.login}
                  </Link>
                </p>
              </CardFooter>
            </>
          )}

          {/* Step: Account Details */}
          {currentStep === 'account' && (
            <>
              <CardHeader>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <BackArrow className="h-4 w-4" />
                  {t.common.back}
                </button>
                <CardTitle className={`text-xl ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'معلومات الحساب' : 'Account Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{isRTL ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}</Label>
                    <div className="relative">
                      <User className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateForm('fullName', e.target.value)}
                        className={isRTL ? 'pr-10' : 'pl-10'}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullNameAr">{isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}</Label>
                    <Input
                      id="fullNameAr"
                      value={formData.fullNameAr}
                      onChange={(e) => updateForm('fullNameAr', e.target.value)}
                      placeholder="الاسم الكامل"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <div className="relative">
                    <Phone className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      placeholder="+966 5XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t.auth.password}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className={isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-3 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'يجب أن تكون 8 أحرف على الأقل' : 'Must be at least 8 characters'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={selectedRole === 'traveler' ? handleSubmit : handleNext} className="w-full" disabled={isLoading}>
                  {isLoading ? t.common.loading : selectedRole === 'traveler' ? t.auth.signup : (isRTL ? 'التالي' : 'Next')}
                  {!isLoading && selectedRole !== 'traveler' && <ForwardArrow className="h-4 w-4 ms-2" />}
                </Button>
              </CardFooter>
            </>
          )}

          {/* Step: Profile (Provider) */}
          {currentStep === 'profile' && selectedRole === 'provider' && (
            <>
              <CardHeader>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <BackArrow className="h-4 w-4" />
                  {t.common.back}
                </button>
                <CardTitle className={`text-xl ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'معلومات المزود' : 'Provider Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => updateForm('companyName', e.target.value)}
                      placeholder="My Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                    <Input
                      value={formData.companyNameAr}
                      onChange={(e) => updateForm('companyNameAr', e.target.value)}
                      placeholder="اسم الشركة"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'نبذة عنك (إنجليزي)' : 'Bio (English)'}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    placeholder="Tell travelers about your experience..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'نبذة عنك (عربي)' : 'Bio (Arabic)'}</Label>
                  <Textarea
                    value={formData.bioAr}
                    onChange={(e) => updateForm('bioAr', e.target.value)}
                    placeholder="أخبر المسافرين عن خبرتك..."
                    rows={3}
                    dir="rtl"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 inline me-1" />
                    {isRTL 
                      ? 'سيُطلب منك إكمال التحقق (KYC) لاحقاً لبدء تقديم الخدمات'
                      : 'You will be asked to complete verification (KYC) later to start offering services'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                  {isLoading ? t.common.loading : t.auth.signup}
                </Button>
              </CardFooter>
            </>
          )}

          {/* Step: Profile (Vendor) */}
          {currentStep === 'profile' && selectedRole === 'vendor' && (
            <>
              <CardHeader>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <BackArrow className="h-4 w-4" />
                  {t.common.back}
                </button>
                <CardTitle className={`text-xl ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'معلومات الشركة' : 'Company Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => updateForm('companyName', e.target.value)}
                      placeholder="Travel Agency LLC"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                    <Input
                      value={formData.companyNameAr}
                      onChange={(e) => updateForm('companyNameAr', e.target.value)}
                      placeholder="وكالة السفر"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم السجل التجاري' : 'Commercial Registration'}</Label>
                    <Input
                      value={formData.commercialReg}
                      onChange={(e) => updateForm('commercialReg', e.target.value)}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الرقم الضريبي' : 'Tax/VAT Number'}</Label>
                    <Input
                      value={formData.taxNumber}
                      onChange={(e) => updateForm('taxNumber', e.target.value)}
                      placeholder="300000000000003"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان (إنجليزي)' : 'Address (English)'}</Label>
                  <div className="relative">
                    <MapPin className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      placeholder="123 Main St, Riyadh"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 inline me-1" />
                    {isRTL 
                      ? 'سيُطلب منك إكمال التحقق (KYC) وإرفاق المستندات لاحقاً'
                      : 'You will be asked to complete verification (KYC) and upload documents later'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                  {isLoading ? t.common.loading : t.auth.signup}
                </Button>
              </CardFooter>
            </>
          )}

          {/* Step: Complete */}
          {currentStep === 'complete' && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? '🎉 تهانينا!' : '🎉 Congratulations!'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تم إنشاء حسابك بنجاح' : 'Your account has been created successfully'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'جاري توجيهك إلى لوحة التحكم...' : 'Redirecting you to your dashboard...'}
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

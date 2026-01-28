import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, CheckCircle, Star, Users, Shield, Heart, 
  Sparkles, BadgeCheck, Globe, Play, ChevronDown, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { GlassCard } from '@/components/cards';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return { count, ref };
}

export default function LandingPage() {
  const { t, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const [heroVisible, setHeroVisible] = useState(false);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/signup';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'provider') return '/provider';
    if (role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const stats = [
    { value: 10, suffix: 'K+', label: isRTL ? 'عميل سعيد' : 'Happy Clients' },
    { value: 500, suffix: '+', label: isRTL ? 'مقدم خدمة معتمد' : 'Verified Providers' },
    { value: 25, suffix: 'K+', label: isRTL ? 'منسك مكتمل' : 'Completed Rites' },
    { value: 4.9, suffix: '', label: isRTL ? 'متوسط التقييم' : 'Average Rating', isDecimal: true },
  ];

  const steps = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: t.landing.step1Title,
      description: t.landing.step1Desc,
      tagline: isRTL ? 'مقدمون معتمدون وموثوقون' : 'Verified & Trusted Providers',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: t.landing.step2Title,
      description: t.landing.step2Desc,
      tagline: isRTL ? 'لأحبائك الذين لا يستطيعون السفر' : 'For loved ones who cannot travel',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: t.landing.step3Title,
      description: t.landing.step3Desc,
      tagline: isRTL ? 'إثبات بالصور والفيديو' : 'Photo & Video Proof',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const services = [
    {
      type: 'umrah',
      title: t.services.umrah,
      titleAr: 'عمرة',
      description: isRTL 
        ? 'أداء مناسك العمرة نيابة عمن لا يستطيع السفر'
        : 'Perform Umrah rites on behalf of those unable to travel',
      icon: '🕋',
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-teal-500/20',
      borderGradient: 'from-emerald-500 to-teal-500',
      tagline: isRTL ? 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ' : 'Complete Hajj and Umrah for Allah',
    },
    {
      type: 'hajj',
      title: t.services.hajj,
      titleAr: 'حج',
      description: isRTL
        ? 'أداء فريضة الحج نيابة عن المتوفين أو العاجزين'
        : 'Complete Hajj pilgrimage for the deceased or incapacitated',
      icon: '🕌',
      gradient: 'from-amber-500/20 via-amber-500/10 to-orange-500/20',
      borderGradient: 'from-amber-500 to-orange-500',
      tagline: isRTL ? 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ' : 'Hajj is a duty mankind owes to Allah',
    },
    {
      type: 'ziyarat',
      title: t.services.ziyarat,
      titleAr: 'زيارة',
      description: isRTL
        ? 'زيارة المسجد النبوي والمقدسات الأخرى'
        : "Visit the Prophet's Mosque and other sacred sites",
      icon: '🌙',
      gradient: 'from-violet-500/20 via-violet-500/10 to-purple-500/20',
      borderGradient: 'from-violet-500 to-purple-500',
      tagline: isRTL ? 'صَلاةٌ فِي مَسْجِدِي خَيْرٌ مِنْ أَلْفِ صَلاةٍ' : 'A prayer in my Masjid is worth a thousand',
    },
  ];

  const features = [
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      title: isRTL ? 'مقدمون معتمدون' : 'Verified Providers',
      description: isRTL ? 'جميع مقدمي الخدمات معتمدون ومعتمدون' : 'All providers are verified and certified',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: isRTL ? 'خدمة عالمية' : 'Global Service',
      description: isRTL ? 'متاح للعائلات في جميع أنحاء العالم' : 'Available for families worldwide',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: isRTL ? 'ضمان الجودة' : 'Quality Guaranteed',
      description: isRTL ? 'ضمان استرداد الأموال خلال 7 أيام' : '7-day money-back guarantee',
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: isRTL ? 'دعم متواصل' : '24/7 Support',
      description: isRTL ? 'فريق دعم على مدار الساعة' : 'Round-the-clock assistance',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section - Full Viewport with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
          
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 pattern-islamic opacity-40" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container px-4 py-20 md:py-32">
          <div className={cn(
            'mx-auto max-w-4xl text-center transition-all duration-1000',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}>
            {/* Bismillah Badge */}
            <div className={cn(
              'mb-8 transition-all duration-700 delay-200',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}>
              <span className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-full',
                'bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10',
                'border border-primary/20 backdrop-blur-sm',
                'text-primary text-sm font-medium shadow-lg shadow-primary/10',
                isRTL && 'font-arabic'
              )}>
                <Sparkles className="h-4 w-4 animate-pulse" />
                {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className={cn(
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6',
              'bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text',
              'transition-all duration-700 delay-400',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
              isRTL && 'font-arabic leading-relaxed'
            )}>
              {t.landing.heroTitle}
            </h1>
            
            {/* Subtitle */}
            <p className={cn(
              'text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed',
              'transition-all duration-700 delay-500',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
              isRTL && 'font-arabic'
            )}>
              {t.landing.heroSubtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className={cn(
              'flex flex-col sm:flex-row gap-4 justify-center mb-12',
              'transition-all duration-700 delay-600',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}>
              <Button 
                size="lg" 
                asChild 
                className={cn(
                  'text-lg px-8 h-14 rounded-2xl',
                  'bg-gradient-to-r from-primary to-primary/90',
                  'shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40',
                  'transition-all duration-300 hover:scale-105 active:scale-[0.98]'
                )}
              >
                <Link to={getDashboardLink()}>
                  {t.landing.cta}
                  <Arrow className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-8 h-14 rounded-2xl backdrop-blur-sm hover:bg-background/80"
              >
                <Link to="/services">
                  <Play className="me-2 h-5 w-5" />
                  {t.landing.learnMore}
                </Link>
              </Button>
            </div>

            {/* Trust Quote */}
            <div className={cn(
              'transition-all duration-700 delay-700',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}>
              <GlassCard className="max-w-xl mx-auto p-5">
                <p className={cn(
                  'text-sm text-muted-foreground',
                  isRTL ? 'font-arabic' : 'italic'
                )}>
                  {isRTL 
                    ? '"مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ"'
                    : '"Whoever performs Hajj for Allah and does not commit any obscenity or wrongdoing will return as pure as the day he was born"'}
                </p>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Stats Section - Floating Cards */}
      <section className="py-16 -mt-20 relative z-10">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const { count, ref } = useAnimatedCounter(stat.isDecimal ? stat.value * 10 : stat.value);
              return (
                <div
                  key={index}
                  ref={ref}
                  className={cn(
                    'glass-card p-5 text-center',
                    'hover:scale-105 transition-transform duration-300',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text-sacred mb-1">
                    {stat.isDecimal ? (count / 10).toFixed(1) : count}{stat.suffix}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section - Premium Cards */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {isRTL ? 'خدماتنا' : 'Our Services'}
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-bold mb-4',
              isRTL && 'font-arabic'
            )}>
              {t.services.allServices}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {isRTL 
                ? 'اختر من بين خدماتنا المتنوعة لأداء المناسك نيابة عن أحبائك'
                : 'Choose from our range of services to perform sacred rites on behalf of your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Link
                key={service.type}
                to={`/services?type=${service.type}`}
                className="group block"
              >
                <div 
                  className={cn(
                    'relative h-full rounded-3xl p-px overflow-hidden',
                    'transition-all duration-500 hover:scale-[1.02]',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Gradient Border */}
                  <div className={cn(
                    'absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    service.borderGradient
                  )} />
                  
                  {/* Card Content */}
                  <div className={cn(
                    'relative h-full rounded-[23px] bg-card p-6 lg:p-8',
                    'overflow-hidden transition-all duration-500'
                  )}>
                    {/* Background Gradient */}
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                      service.gradient
                    )} />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={cn(
                        'text-6xl mb-6 transform transition-all duration-500',
                        'group-hover:scale-110 group-hover:-translate-y-1'
                      )}>
                        {service.icon}
                      </div>
                      
                      {/* Title */}
                      <h3 className={cn(
                        'text-2xl font-bold mb-3 group-hover:text-primary transition-colors',
                        isRTL && 'font-arabic'
                      )}>
                        {service.title}
                      </h3>
                      
                      {/* Description */}
                      <p className={cn(
                        'text-muted-foreground mb-6 leading-relaxed',
                        isRTL && 'font-arabic'
                      )}>
                        {service.description}
                      </p>
                      
                      {/* Tagline */}
                      <div className={cn(
                        'pt-5 border-t border-border/50',
                        isRTL && 'font-arabic'
                      )}>
                        <p className="text-xs text-muted-foreground italic">
                          {service.tagline}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <div className={cn(
                        'absolute bottom-6 end-6 w-10 h-10 rounded-full',
                        'bg-primary/10 flex items-center justify-center',
                        'opacity-0 group-hover:opacity-100 transition-all duration-300',
                        'group-hover:translate-x-1'
                      )}>
                        <Arrow className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {isRTL ? 'سهل وبسيط' : 'Easy & Simple'}
              </span>
            </div>
            <h2 className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-bold mb-4',
              isRTL && 'font-arabic'
            )}>
              {t.landing.howItWorks}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {isRTL 
                ? 'ثلاث خطوات بسيطة لأداء المناسك نيابة عن أحبائك'
                : 'Three simple steps to perform rites on behalf of your loved ones'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={cn(
                  'relative text-center group animate-fade-in'
                )}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                
                {/* Icon Circle */}
                <div className="relative inline-block mb-6">
                  <div className={cn(
                    'w-24 h-24 rounded-full flex items-center justify-center',
                    'bg-gradient-to-br text-white shadow-xl',
                    'group-hover:scale-110 transition-transform duration-300',
                    step.gradient
                  )}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number */}
                  <div className={cn(
                    'absolute -top-2 -end-2 w-8 h-8 rounded-full',
                    'bg-background border-2 border-primary',
                    'flex items-center justify-center text-sm font-bold text-primary',
                    'shadow-lg'
                  )}>
                    {index + 1}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className={cn(
                  'text-xl font-bold mb-3',
                  isRTL && 'font-arabic'
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  'text-muted-foreground mb-3 leading-relaxed',
                  isRTL && 'font-arabic'
                )}>
                  {step.description}
                </p>
                <span className="text-xs text-primary font-medium">
                  {step.tagline}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <GlassCard 
                key={index} 
                className={cn(
                  'p-6 text-center hover:scale-105 transition-transform duration-300',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'w-12 h-12 rounded-2xl mx-auto mb-4',
                  'bg-gradient-to-br from-primary/20 to-primary/5',
                  'flex items-center justify-center text-primary'
                )}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 pattern-islamic opacity-10" />
        
        <div className="container px-4 relative z-10">
          <div className="text-center text-primary-foreground">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'h-7 w-7 fill-secondary text-secondary',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <p className={cn(
              'text-xl md:text-2xl lg:text-3xl font-medium mb-4',
              isRTL && 'font-arabic'
            )}>
              {t.landing.trustedBy}
            </p>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              {isRTL 
                ? 'انضم إلى الآلاف الذين وثقوا بنا لأداء المناسك'
                : 'Join thousands who have trusted us for their sacred rites'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Card with Gradient Border */}
            <div className="relative p-px rounded-3xl bg-gradient-to-br from-primary via-secondary to-primary overflow-hidden">
              <div className="relative rounded-[23px] bg-card p-8 md:p-14 text-center overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 pattern-islamic opacity-20" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 text-primary mb-6">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <h2 className={cn(
                    'text-2xl md:text-3xl lg:text-4xl font-bold mb-4',
                    isRTL && 'font-arabic'
                  )}>
                    {isRTL ? 'ابدأ رحلتك الروحانية اليوم' : 'Start Your Spiritual Journey Today'}
                  </h2>
                  <p className={cn(
                    'text-muted-foreground mb-8 max-w-xl mx-auto text-lg',
                    isRTL && 'font-arabic'
                  )}>
                    {isRTL 
                      ? 'انضم إلى آلاف العائلات التي وثقت بنا لأداء المناسك نيابة عن أحبائهم'
                      : 'Join thousands of families who have trusted us to perform sacred rites for their loved ones'}
                  </p>
                  <Button 
                    size="lg" 
                    asChild 
                    className={cn(
                      'text-lg px-10 h-14 rounded-2xl',
                      'shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40',
                      'transition-all duration-300 hover:scale-105'
                    )}
                  >
                    <Link to={getDashboardLink()}>
                      {t.landing.cta}
                      <Arrow className="ms-2 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  {/* Bottom Quote */}
                  <p className={cn(
                    'mt-10 text-sm text-muted-foreground',
                    isRTL ? 'font-arabic' : 'italic'
                  )}>
                    {isRTL 
                      ? '"إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ"'
                      : '"When a person dies, their deeds are cut off except for three..."'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

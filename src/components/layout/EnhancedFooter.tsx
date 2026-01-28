import { Link } from 'react-router-dom';
import { Heart, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function EnhancedFooter() {
  const { t, isRTL, language, setLanguage } = useLanguage();

  const serviceLinks = [
    { href: '/services?type=umrah', label: t.services.umrah, labelAr: 'العمرة' },
    { href: '/services?type=hajj', label: t.services.hajj, labelAr: 'الحج' },
    { href: '/services?type=ziyarat', label: t.services.ziyarat, labelAr: 'الزيارة' },
  ];

  const companyLinks = [
    { href: '/about', label: 'About Us', labelAr: 'عن وكّلني' },
    { href: '/contact', label: 'Contact', labelAr: 'اتصل بنا' },
    { href: '/faq', label: 'FAQ', labelAr: 'الأسئلة الشائعة' },
    { href: '/careers', label: 'Careers', labelAr: 'الوظائف' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
    { href: '/terms', label: 'Terms of Service', labelAr: 'شروط الخدمة' },
    { href: '/refund', label: 'Refund Policy', labelAr: 'سياسة الاسترداد' },
  ];

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Youtube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Main Footer */}
      <div className="container px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <span className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
              </div>
              <div>
                <span className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
                  {t.brand}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'خدمات العمرة والحج' : 'Umrah & Hajj Services'}
                </p>
              </div>
            </Link>
            <p className={cn('text-muted-foreground max-w-sm mb-6', isRTL && 'font-arabic')}>
              {t.tagline}
            </p>

            {/* Newsletter */}
            <div className="max-w-sm">
              <h4 className="font-semibold mb-3">
                {isRTL ? 'اشترك في النشرة الإخبارية' : 'Subscribe to Newsletter'}
              </h4>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1"
                />
                <Button>
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold mb-4">
              {isRTL ? 'خدماتنا' : 'Our Services'}
            </h4>
            <ul className="space-y-3 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/donate"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Heart className="h-3 w-3 text-red-500" />
                  {isRTL ? 'تبرع للمحتاجين' : 'Donate for Others'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4">
              {isRTL ? 'الشركة' : 'Company'}
            </h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold mb-4">
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{isRTL ? 'مكة المكرمة، السعودية' : 'Makkah, Saudi Arabia'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">+966 12 345 6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@wakilni.com</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/50">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
              {t.footer.copyright}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {legalLinks.map((link, index) => (
                <span key={link.href} className="flex items-center gap-4">
                  <Link 
                    to={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {isRTL ? link.labelAr : link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="hidden md:inline text-border">•</span>
                  )}
                </span>
              ))}
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, LogOut, LayoutDashboard, Settings, Heart, 
  Globe, Wifi, WifiOff, MapPin, Bell, Search, ChevronDown,
  Moon, Sun, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

interface EnhancedHeaderProps {
  showNav?: boolean;
}

export function EnhancedHeader({ showNav = true }: EnhancedHeaderProps) {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { location: geoLocation, currency, formatCurrency } = useGeolocation();
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return '/admin';
      case 'provider':
        return '/provider';
      case 'vendor':
        return '/vendor';
      default:
        return '/dashboard';
    }
  };

  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      super_admin: 'bg-red-500',
      admin: 'bg-purple-500',
      provider: 'bg-amber-500',
      vendor: 'bg-blue-500',
      traveler: 'bg-emerald-500',
    };
    
    const roleLabels: Record<string, { en: string; ar: string }> = {
      super_admin: { en: 'Super Admin', ar: 'المشرف الرئيسي' },
      admin: { en: 'Admin', ar: 'مشرف' },
      provider: { en: 'Provider', ar: 'مقدم خدمة' },
      vendor: { en: 'Vendor', ar: 'شركة' },
      traveler: { en: 'Traveler', ar: 'مسافر' },
    };

    if (!role) return null;
    
    return (
      <Badge className={cn('text-[10px] px-1.5', roleColors[role] || 'bg-muted')}>
        {isRTL ? roleLabels[role]?.ar : roleLabels[role]?.en}
      </Badge>
    );
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const navLinks = [
    { href: '/services', label: t.nav.services },
    { href: '/donate', label: isRTL ? 'تبرع' : 'Donate', icon: Heart },
  ];

  if (user) {
    navLinks.push(
      { href: getDashboardLink(), label: t.nav.dashboard },
      { href: '/bookings', label: t.nav.bookings }
    );
  }

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled 
          ? 'bg-background/95 backdrop-blur-lg shadow-sm border-b border-border' 
          : 'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="container">
        {/* Top Bar - Location & Status */}
        <div className="hidden lg:flex items-center justify-between py-1.5 text-xs border-b border-border/50">
          <div className="flex items-center gap-4">
            {/* Location */}
            {geoLocation && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{geoLocation.city}, {geoLocation.country_name}</span>
                <span className="font-medium">({currency.code})</span>
              </div>
            )}
            
            {/* Connection Status */}
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Wifi className="h-3 w-3" />
                  {isRTL ? 'متصل' : 'Online'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <WifiOff className="h-3 w-3" />
                  {isRTL ? 'غير متصل' : 'Offline'}
                </span>
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4">
                  {pendingCount} {isRTL ? 'معلق' : 'pending'}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              <span>{theme === 'dark' ? (isRTL ? 'فاتح' : 'Light') : (isRTL ? 'داكن' : 'Dark')}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex h-16 items-center justify-between px-4 lg:px-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md group-hover:shadow-lg transition-shadow">
              <span className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold text-foreground leading-tight ${isRTL ? 'font-arabic' : ''}`}>
                {t.brand}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {isRTL ? 'خدمات العمرة والحج' : 'Umrah & Hajj Services'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentLocation.pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Theme/Language */}
            <div className="lg:hidden flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 gap-2 px-2 hover:bg-muted/50">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium leading-tight">
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      {getRoleBadge()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align={isRTL ? 'start' : 'end'}>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg m-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{profile?.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <div className="mt-1">{getRoleBadge()}</div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        {t.nav.dashboard}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        {t.nav.profile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        {t.nav.settings}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Status Info */}
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {isOnline ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-amber-500" />}
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                      {geoLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {geoLocation.country_code}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">{t.nav.login}</Link>
                </Button>
                <Button asChild className="gap-1.5">
                  <Link to="/signup">
                    <Sparkles className="h-4 w-4" />
                    {t.nav.signup}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'left' : 'right'} className="w-80">
                <SheetHeader>
                  <SheetTitle className={isRTL ? 'font-arabic text-right' : ''}>
                    {isRTL ? 'القائمة' : 'Menu'}
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-6">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-2">
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <Wifi className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    {geoLocation && (
                      <Badge variant="secondary" className="text-xs">
                        {geoLocation.country_code} • {currency.code}
                      </Badge>
                    )}
                  </div>

                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                  
                  {!user && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          {t.nav.login}
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                          {t.nav.signup}
                        </Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

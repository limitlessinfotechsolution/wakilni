import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Platform = 'ios' | 'android' | 'web';

interface DeviceInfo {
  type: DeviceType;
  platform: Platform;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
  timezone: string;
  language: string;
  region: string;
}

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

export function useDeviceDetection(): DeviceInfo {
  const getDeviceType = (): DeviceType => {
    const width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  };

  const getPlatform = (): Platform => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'web';
  };

  const getOrientation = (): 'portrait' | 'landscape' => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  };

  const getLanguageAndRegion = () => {
    const navLang = navigator.language || 'en-US';
    const [lang, region] = navLang.split('-');
    return { language: lang.toLowerCase(), region: region?.toUpperCase() || 'US' };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const { language, region } = getLanguageAndRegion();
    return {
      type: getDeviceType(),
      platform: getPlatform(),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation: getOrientation(),
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language,
      region,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const { language, region } = getLanguageAndRegion();
      setDeviceInfo(prev => ({
        ...prev,
        type: getDeviceType(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        orientation: getOrientation(),
        language,
        region,
      }));
    };

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setDeviceInfo(prev => ({ ...prev, prefersDarkMode: e.matches }));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  return deviceInfo;
}

export function useAutoLanguageSync() {
  const device = useDeviceDetection();
  
  useEffect(() => {
    // Check if language preference is already stored
    const storedLang = localStorage.getItem('wakilni-language');
    if (storedLang) return;

    // Auto-set language based on device
    if (device.language === 'ar') {
      localStorage.setItem('wakilni-language', 'ar');
      window.location.reload();
    }
  }, [device.language]);

  return device;
}

export function useAutoThemeSync() {
  const device = useDeviceDetection();
  
  useEffect(() => {
    // Check if theme preference is already stored
    const storedTheme = localStorage.getItem('wakilni-theme');
    if (storedTheme) return;

    // Auto-set theme based on system preference
    const theme = device.prefersDarkMode ? 'dark' : 'light';
    localStorage.setItem('wakilni-theme', theme);
    document.documentElement.classList.toggle('dark', device.prefersDarkMode);
  }, [device.prefersDarkMode]);

  return device;
}

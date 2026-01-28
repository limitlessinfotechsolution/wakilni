import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface LocationData {
  country_code: string;
  country_name: string;
  currency_code: string;
  timezone: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  SA: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  KW: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  QA: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  BH: { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
  OM: { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial' },
  EG: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  JO: { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar' },
  LB: { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  TR: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro' },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', name: 'US Dollar' };

const STORAGE_KEY = 'wakilni_user_location';

export function useGeolocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage first
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocation(parsed);
        const currencyInfo = COUNTRY_CURRENCY_MAP[parsed.country_code] || DEFAULT_CURRENCY;
        setCurrency(currencyInfo);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading location from storage:', e);
    }
    return null;
  }, []);

  // Save to local storage
  const saveToStorage = useCallback((data: LocationData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving location to storage:', e);
    }
  }, []);

  // Fetch location from browser API
  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use free geocoding API
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();

            const locationData: LocationData = {
              country_code: data.countryCode || 'US',
              country_name: data.countryName || 'United States',
              currency_code: COUNTRY_CURRENCY_MAP[data.countryCode]?.code || 'USD',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              city: data.city || data.locality || '',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            resolve(locationData);
          } catch (e) {
            console.error('Geocoding error:', e);
            resolve(null);
          }
        },
        () => {
          // Fallback: detect from timezone
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const fallbackData: LocationData = {
            country_code: 'US',
            country_name: 'United States',
            currency_code: 'USD',
            timezone,
            city: '',
            latitude: 0,
            longitude: 0,
          };
          resolve(fallbackData);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    });
  }, []);

  // Sync to database
  const syncToDatabase = useCallback(async (data: LocationData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          country_code: data.country_code,
          country_name: data.country_name,
          currency_code: data.currency_code,
          timezone: data.timezone,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) console.error('Error syncing location:', error);
    } catch (e) {
      console.error('Error syncing location:', e);
    }
  }, [user]);

  // Load from database
  const loadFromDatabase = useCallback(async (): Promise<LocationData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        country_code: data.country_code || 'US',
        country_name: data.country_name || 'United States',
        currency_code: data.currency_code || 'USD',
        timezone: data.timezone || 'UTC',
        city: data.city || '',
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
      };
    } catch (e) {
      console.error('Error loading from database:', e);
      return null;
    }
  }, [user]);

  // Update location manually
  const updateLocation = useCallback(async (newLocation: Partial<LocationData>) => {
    const updated = { ...location, ...newLocation } as LocationData;
    setLocation(updated);
    
    const currencyInfo = COUNTRY_CURRENCY_MAP[updated.country_code] || DEFAULT_CURRENCY;
    setCurrency(currencyInfo);
    
    saveToStorage(updated);
    await syncToDatabase(updated);
  }, [location, saveToStorage, syncToDatabase]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [currency.code]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      // Try local storage first (fastest)
      const stored = loadFromStorage();
      
      if (!stored) {
        // Try database if logged in
        const dbLocation = await loadFromDatabase();
        
        if (dbLocation) {
          setLocation(dbLocation);
          setCurrency(COUNTRY_CURRENCY_MAP[dbLocation.country_code] || DEFAULT_CURRENCY);
          saveToStorage(dbLocation);
        } else {
          // Detect from browser
          const detected = await detectLocation();
          if (detected) {
            setLocation(detected);
            setCurrency(COUNTRY_CURRENCY_MAP[detected.country_code] || DEFAULT_CURRENCY);
            saveToStorage(detected);
            await syncToDatabase(detected);
          }
        }
      }
      
      setIsLoading(false);
    };

    init();
  }, [user, loadFromStorage, loadFromDatabase, detectLocation, saveToStorage, syncToDatabase]);

  return {
    location,
    currency,
    isLoading,
    error,
    updateLocation,
    formatCurrency,
    detectLocation: async () => {
      const detected = await detectLocation();
      if (detected) {
        await updateLocation(detected);
      }
    },
  };
}

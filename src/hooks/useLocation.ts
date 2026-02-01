import { useState, useEffect, useCallback } from 'react';
import * as ExpoLocation from 'expo-location';
import { useSettingsStore } from '../store/settingsStore';
import type { Location } from '../types';

interface UseLocationResult {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const { location: savedLocation, setLocation: saveLocation, locationMode } = useSettingsStore();

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Konum izni iste
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Konum izni verilmedi');
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      setHasPermission(true);

      // Konum al
      const currentLocation = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      // Şehir ve ülke bilgisini al (reverse geocoding)
      let city = '';
      let country = '';

      try {
        const geocode = await ExpoLocation.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode.length > 0) {
          city = geocode[0].city || geocode[0].subregion || '';
          country = geocode[0].country || '';
        }
      } catch (geocodeError) {
        console.warn('Geocoding hatası:', geocodeError);
      }

      const newLocation: Location = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        city,
        country,
      };

      setLocation(newLocation);
      saveLocation(newLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Konum alınamadı';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [saveLocation]);

  // İlk yüklemede kayıtlı konumu kullan veya yeni konum iste
  useEffect(() => {
    if (savedLocation && locationMode === 'auto') {
      setLocation(savedLocation);
    } else if (locationMode === 'auto') {
      requestLocation();
    } else if (savedLocation) {
      setLocation(savedLocation);
    }
  }, [savedLocation, locationMode]);

  // İzin durumunu kontrol et
  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    checkPermission();
  }, []);

  return {
    location: location || savedLocation,
    isLoading,
    error,
    requestLocation,
    hasPermission,
  };
}

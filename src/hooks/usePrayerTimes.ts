import { useState, useEffect, useCallback } from 'react';
import { usePrayerStore, calculateCurrentAndNextPrayer } from '../store/prayerStore';
import { useSettingsStore } from '../store/settingsStore';
import { getDiyanetPrayerTimes, formatAllPrayerTimes } from '../api/diyanet';
import type { PrayerTimes, Location } from '../types';

interface UsePrayerTimesResult {
  prayerTimes: PrayerTimes | null;
  currentPrayer: keyof PrayerTimes | null;
  nextPrayer: keyof PrayerTimes | null;
  timeToNextPrayer: number;
  hijriDate: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePrayerTimes(location: Location | null): UsePrayerTimesResult {
  const {
    prayerTimes,
    hijriDate,
    currentPrayer,
    nextPrayer,
    timeToNextPrayer,
    isLoading,
    error,
    setPrayerTimes,
    setHijriDate,
    setCurrentPrayer,
    setNextPrayer,
    setTimeToNextPrayer,
    setLoading,
    setError,
    updateLastUpdated,
    lastUpdated,
  } = usePrayerStore();

  const fetchPrayerTimes = useCallback(async () => {
    if (!location) return;

    setLoading(true);

    try {
      // Diyanet API'sini kullan
      const response = await getDiyanetPrayerTimes(
        location.latitude,
        location.longitude
      );

      if (response.code === 200) {
        // Vakitleri formatla (saat:dakika formatına çevir)
        const formattedTimes = formatAllPrayerTimes(response.data.timings);
        setPrayerTimes(formattedTimes);
        setHijriDate(response.data.date.hijri);
        updateLastUpdated();
      } else {
        setError('Namaz vakitleri alınamadı');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [location, setPrayerTimes, setHijriDate, updateLastUpdated, setLoading, setError]);

  // Konum değiştiğinde veya cache eskimişse yenile
  useEffect(() => {
    if (!location) return;

    // Cache kontrolü (3 saat - daha sık güncelleme)
    const shouldRefresh = !lastUpdated ||
      (Date.now() - new Date(lastUpdated).getTime() > 3 * 60 * 60 * 1000);

    if (shouldRefresh || !prayerTimes) {
      fetchPrayerTimes();
    }
  }, [location]);

  // Gece yarısında otomatik yenile (yeni gün için vakitler)
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      if (location) {
        fetchPrayerTimes();
      }
    }, timeUntilMidnight + 1000); // Gece yarısından 1 saniye sonra

    return () => clearTimeout(midnightTimer);
  }, [location, fetchPrayerTimes]);

  // Mevcut ve sonraki namazı hesapla
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCurrentPrayer = () => {
      const { current, next, timeToNext } = calculateCurrentAndNextPrayer(prayerTimes);
      setCurrentPrayer(current);
      setNextPrayer(next);
      setTimeToNextPrayer(timeToNext);
    };

    // İlk hesaplama
    updateCurrentPrayer();

    // Her saniye güncelle
    const interval = setInterval(updateCurrentPrayer, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, setCurrentPrayer, setNextPrayer, setTimeToNextPrayer]);

  return {
    prayerTimes,
    currentPrayer,
    nextPrayer,
    timeToNextPrayer,
    hijriDate,
    isLoading,
    error,
    refresh: fetchPrayerTimes,
  };
}

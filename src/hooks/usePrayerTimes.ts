import { useState, useEffect, useCallback } from 'react';
import { usePrayerStore, calculateCurrentAndNextPrayer } from '../store/prayerStore';
import { useSettingsStore } from '../store/settingsStore';
import { getPrayerTimesByCoordinates } from '../api/aladhan';
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

  const { calculationMethod } = useSettingsStore();

  const fetchPrayerTimes = useCallback(async () => {
    if (!location) return;

    setLoading(true);

    try {
      const response = await getPrayerTimesByCoordinates(
        location.latitude,
        location.longitude,
        calculationMethod
      );

      if (response.code === 200) {
        setPrayerTimes(response.data.timings);
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
  }, [location, calculationMethod, setPrayerTimes, setHijriDate, updateLastUpdated, setLoading, setError]);

  // Konum değiştiğinde veya cache eskimişse yenile
  useEffect(() => {
    if (!location) return;

    // Cache kontrolü (6 saat)
    const shouldRefresh = !lastUpdated ||
      (Date.now() - new Date(lastUpdated).getTime() > 6 * 60 * 60 * 1000);

    if (shouldRefresh || !prayerTimes) {
      fetchPrayerTimes();
    }
  }, [location, calculationMethod]);

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

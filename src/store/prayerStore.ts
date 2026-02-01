import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerTimes, HijriDate, Location } from '../types';

interface PrayerState {
  // State
  prayerTimes: PrayerTimes | null;
  hijriDate: HijriDate | null;
  currentPrayer: keyof PrayerTimes | null;
  nextPrayer: keyof PrayerTimes | null;
  timeToNextPrayer: number; // saniye cinsinden
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPrayerTimes: (times: PrayerTimes) => void;
  setHijriDate: (date: HijriDate) => void;
  setCurrentPrayer: (prayer: keyof PrayerTimes | null) => void;
  setNextPrayer: (prayer: keyof PrayerTimes | null) => void;
  setTimeToNextPrayer: (seconds: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdated: () => void;
  clearCache: () => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      prayerTimes: null,
      hijriDate: null,
      currentPrayer: null,
      nextPrayer: null,
      timeToNextPrayer: 0,
      lastUpdated: null,
      isLoading: false,
      error: null,

      setPrayerTimes: (times) =>
        set({ prayerTimes: times, error: null }),

      setHijriDate: (date) =>
        set({ hijriDate: date }),

      setCurrentPrayer: (prayer) =>
        set({ currentPrayer: prayer }),

      setNextPrayer: (prayer) =>
        set({ nextPrayer: prayer }),

      setTimeToNextPrayer: (seconds) =>
        set({ timeToNextPrayer: seconds }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      updateLastUpdated: () =>
        set({ lastUpdated: new Date().toISOString() }),

      clearCache: () =>
        set({
          prayerTimes: null,
          hijriDate: null,
          currentPrayer: null,
          nextPrayer: null,
          timeToNextPrayer: 0,
          lastUpdated: null,
        }),
    }),
    {
      name: 'islamic-app-prayer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        prayerTimes: state.prayerTimes,
        hijriDate: state.hijriDate,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Namaz vakti hesaplama yardımcı fonksiyonları
export function parseTimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

export function calculateCurrentAndNextPrayer(
  prayerTimes: PrayerTimes
): { current: keyof PrayerTimes | null; next: keyof PrayerTimes; timeToNext: number } {
  const now = new Date();
  const currentTime = now.getTime();

  const prayerOrder: (keyof PrayerTimes)[] = [
    'Fajr',
    'Sunrise',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha',
  ];

  const prayerTimesMs = prayerOrder.map((prayer) => ({
    name: prayer,
    time: parseTimeString(prayerTimes[prayer]).getTime(),
  }));

  // Şu anki ve sonraki namazı bul
  let current: keyof PrayerTimes | null = null;
  let next: keyof PrayerTimes = 'Fajr';
  let timeToNext = 0;

  for (let i = 0; i < prayerTimesMs.length; i++) {
    const prayer = prayerTimesMs[i];
    const nextPrayer = prayerTimesMs[i + 1];

    if (currentTime < prayer.time) {
      // Henüz bu vaktin öncesindeyiz
      next = prayer.name;
      timeToNext = Math.floor((prayer.time - currentTime) / 1000);
      current = i > 0 ? prayerTimesMs[i - 1].name : 'Isha'; // Gece yarısından sonra
      break;
    } else if (nextPrayer && currentTime < nextPrayer.time) {
      // Bu vakit ile sonraki vakit arasındayız
      current = prayer.name;
      next = nextPrayer.name;
      timeToNext = Math.floor((nextPrayer.time - currentTime) / 1000);
      break;
    } else if (!nextPrayer) {
      // Son vakit (Yatsı) geçmiş, yarının imsağına kadar
      current = prayer.name;
      next = 'Fajr';
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFajr = parseTimeString(prayerTimes.Fajr);
      tomorrowFajr.setDate(tomorrow.getDate());
      timeToNext = Math.floor((tomorrowFajr.getTime() - currentTime) / 1000);
    }
  }

  return { current, next, timeToNext };
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds < 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

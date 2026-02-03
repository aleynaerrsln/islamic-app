import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings, Location, BackgroundSettings, BackgroundType } from '../types';
import { DEFAULT_BACKGROUND, DEFAULT_OPACITY } from '../data/backgroundImages';

interface SettingsState extends Settings {
  // Actions
  setCalculationMethod: (method: number) => void;
  setLanguage: (language: 'tr' | 'en' | 'ar') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEzanSoundEnabled: (enabled: boolean) => void;
  setSelectedMeal: (meal: 'tr.diyanet' | 'tr.ates' | 'tr.yazir') => void;
  setLocation: (location: Location | null) => void;
  setLocationMode: (mode: 'auto' | 'manual') => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundColor: (colorId: string) => void;
  setBackgroundImage: (imageId: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
  setCardOpacity: (opacity: number) => void;
  resetSettings: () => void;
}

const defaultBackground: BackgroundSettings = {
  type: 'image',
  colorId: null,
  imageId: DEFAULT_BACKGROUND,
  opacity: DEFAULT_OPACITY,
};

const defaultSettings: Settings = {
  calculationMethod: 13, // Diyanet
  language: 'tr',
  theme: 'dark', // Varsayılan olarak koyu mod
  notificationsEnabled: true,
  ezanSoundEnabled: true, // Varsayılan olarak ezan sesi açık
  selectedMeal: 'tr.diyanet',
  location: null,
  locationMode: 'auto',
  background: defaultBackground,
  cardOpacity: 0.4, // Kartların varsayılan arka plan opaklığı
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setCalculationMethod: (method) =>
        set({ calculationMethod: method }),

      setLanguage: (language) =>
        set({ language }),

      setTheme: (theme) =>
        set({ theme }),

      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      setEzanSoundEnabled: (enabled) =>
        set({ ezanSoundEnabled: enabled }),

      setSelectedMeal: (meal) =>
        set({ selectedMeal: meal }),

      setLocation: (location) =>
        set({ location }),

      setLocationMode: (mode) =>
        set({ locationMode: mode }),

      setBackgroundType: (type) =>
        set((state) => ({
          background: { ...state.background, type },
        })),

      setBackgroundColor: (colorId) =>
        set((state) => ({
          background: { ...state.background, type: 'color', colorId, imageId: null },
        })),

      setBackgroundImage: (imageId) =>
        set((state) => ({
          background: { ...state.background, type: 'image', imageId, colorId: null },
        })),

      setBackgroundOpacity: (opacity) =>
        set((state) => ({
          background: { ...state.background, opacity },
        })),

      setCardOpacity: (opacity) =>
        set({ cardOpacity: opacity }),

      resetSettings: () =>
        set(defaultSettings),
    }),
    {
      name: 'islamic-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

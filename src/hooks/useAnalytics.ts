// Firebase modülleri için lazy loading - crash önleme
let analytics: any = null;
let crashlytics: any = null;
let firebaseLoaded = false;

// Firebase modüllerini güvenli yükle
async function loadFirebase() {
  if (firebaseLoaded) return;

  try {
    const analyticsModule = await import('@react-native-firebase/analytics');
    const crashlyticsModule = await import('@react-native-firebase/crashlytics');
    analytics = analyticsModule.default;
    crashlytics = crashlyticsModule.default;
    firebaseLoaded = true;
    console.log('Firebase modules loaded successfully');
  } catch (error) {
    console.log('Firebase modules not available:', error);
    firebaseLoaded = false;
  }
}

// Uygulama başlangıcında yükle (arka planda)
loadFirebase();

// Analytics event isimleri
export const AnalyticsEvents = {
  // Ekran görüntüleme
  SCREEN_VIEW: 'screen_view',

  // Namaz vakitleri
  PRAYER_TIME_VIEWED: 'prayer_time_viewed',
  PRAYER_NOTIFICATION_ENABLED: 'prayer_notification_enabled',
  PRAYER_NOTIFICATION_DISABLED: 'prayer_notification_disabled',
  EZAN_SOUND_ENABLED: 'ezan_sound_enabled',
  EZAN_SOUND_DISABLED: 'ezan_sound_disabled',

  // Kur'an
  SURAH_OPENED: 'surah_opened',
  SURAH_COMPLETED: 'surah_completed',
  QURAN_AUDIO_PLAYED: 'quran_audio_played',

  // Kıble
  QIBLA_VIEWED: 'qibla_viewed',
  QIBLA_CALIBRATED: 'qibla_calibrated',

  // Tesbih
  TASBIH_COUNTER_USED: 'tasbih_counter_used',
  TASBIH_COMPLETED: 'tasbih_completed',
  TASBIH_RESET: 'tasbih_reset',

  // Ramazan
  RAMADAN_SCREEN_VIEWED: 'ramadan_screen_viewed',
  IMSAKIYE_VIEWED: 'imsakiye_viewed',
  FASTING_TRACKED: 'fasting_tracked',

  // Ayarlar
  LOCATION_CHANGED: 'location_changed',
  THEME_CHANGED: 'theme_changed',
  BACKGROUND_CHANGED: 'background_changed',
  CALCULATION_METHOD_CHANGED: 'calculation_method_changed',

  // Cami bulucu
  MOSQUE_FINDER_USED: 'mosque_finder_used',
  MOSQUE_DIRECTIONS_OPENED: 'mosque_directions_opened',

  // Genel
  APP_OPENED: 'app_opened',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SHARE_USED: 'share_used',
};

// Analytics servisi
class AnalyticsService {
  private isEnabled: boolean = true;

  // Analytics'i etkinleştir/devre dışı bırak
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (analytics) {
      try {
        analytics().setAnalyticsCollectionEnabled(enabled);
      } catch (error) {
        console.log('Analytics setEnabled error:', error);
      }
    }
  }

  // Ekran görüntüleme
  async logScreenView(screenName: string, screenClass?: string) {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.log('Analytics screen view error:', error);
    }
  }

  // Genel event loglama
  async logEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.log('Analytics event error:', error);
    }
  }

  // Kullanıcı özelliği ayarlama
  async setUserProperty(name: string, value: string | null) {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.log('Analytics user property error:', error);
    }
  }

  // Kullanıcı ID'si ayarlama (anonim)
  async setUserId(userId: string | null) {
    if (!this.isEnabled || !analytics) return;

    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.log('Analytics user ID error:', error);
    }
  }

  // Namaz vakti görüntüleme
  async logPrayerTimeViewed(prayer: string, city: string) {
    await this.logEvent(AnalyticsEvents.PRAYER_TIME_VIEWED, {
      prayer_name: prayer,
      city: city,
    });
  }

  // Sure açma
  async logSurahOpened(surahNumber: number, surahName: string) {
    await this.logEvent(AnalyticsEvents.SURAH_OPENED, {
      surah_number: surahNumber,
      surah_name: surahName,
    });
  }

  // Tesbih kullanımı
  async logTasbihUsed(count: number, dhikrName: string) {
    await this.logEvent(AnalyticsEvents.TASBIH_COUNTER_USED, {
      count: count,
      dhikr_name: dhikrName,
    });
  }

  // Konum değişikliği
  async logLocationChanged(city: string, isAuto: boolean) {
    await this.logEvent(AnalyticsEvents.LOCATION_CHANGED, {
      city: city,
      location_mode: isAuto ? 'auto' : 'manual',
    });
  }

  // Tema değişikliği
  async logThemeChanged(theme: string) {
    await this.logEvent(AnalyticsEvents.THEME_CHANGED, {
      theme: theme,
    });
  }

  // Onboarding tamamlama
  async logOnboardingCompleted(city: string) {
    await this.logEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
      city: city,
    });
  }
}

// Crashlytics servisi
class CrashlyticsService {
  private isEnabled: boolean = true;

  // Crashlytics'i etkinleştir/devre dışı bırak
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (crashlytics) {
      try {
        crashlytics().setCrashlyticsCollectionEnabled(enabled);
      } catch (error) {
        console.log('Crashlytics setEnabled error:', error);
      }
    }
  }

  // Hata loglama
  async logError(error: Error, context?: string) {
    if (!this.isEnabled || !crashlytics) return;

    try {
      if (context) {
        await crashlytics().log(context);
      }
      await crashlytics().recordError(error);
    } catch (e) {
      console.log('Crashlytics error:', e);
    }
  }

  // Log mesajı
  async log(message: string) {
    if (!this.isEnabled || !crashlytics) return;

    try {
      await crashlytics().log(message);
    } catch (error) {
      console.log('Crashlytics log error:', error);
    }
  }

  // Kullanıcı bilgisi ayarlama (anonim)
  async setUserId(userId: string) {
    if (!this.isEnabled || !crashlytics) return;

    try {
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.log('Crashlytics user ID error:', error);
    }
  }

  // Özel anahtar-değer çifti ayarlama
  async setAttribute(key: string, value: string) {
    if (!this.isEnabled || !crashlytics) return;

    try {
      await crashlytics().setAttribute(key, value);
    } catch (error) {
      console.log('Crashlytics attribute error:', error);
    }
  }

  // Birden fazla özellik ayarlama
  async setAttributes(attributes: Record<string, string>) {
    if (!this.isEnabled || !crashlytics) return;

    try {
      await crashlytics().setAttributes(attributes);
    } catch (error) {
      console.log('Crashlytics attributes error:', error);
    }
  }
}

// Singleton instances
export const analyticsService = new AnalyticsService();
export const crashlyticsService = new CrashlyticsService();

// React hook for easy usage
export function useAnalytics() {
  return {
    logScreenView: analyticsService.logScreenView.bind(analyticsService),
    logEvent: analyticsService.logEvent.bind(analyticsService),
    logPrayerTimeViewed: analyticsService.logPrayerTimeViewed.bind(analyticsService),
    logSurahOpened: analyticsService.logSurahOpened.bind(analyticsService),
    logTasbihUsed: analyticsService.logTasbihUsed.bind(analyticsService),
    logLocationChanged: analyticsService.logLocationChanged.bind(analyticsService),
    logThemeChanged: analyticsService.logThemeChanged.bind(analyticsService),
    logOnboardingCompleted: analyticsService.logOnboardingCompleted.bind(analyticsService),
    setEnabled: analyticsService.setEnabled.bind(analyticsService),
    AnalyticsEvents,
  };
}

export function useCrashlytics() {
  return {
    logError: crashlyticsService.logError.bind(crashlyticsService),
    log: crashlyticsService.log.bind(crashlyticsService),
    setUserId: crashlyticsService.setUserId.bind(crashlyticsService),
    setAttribute: crashlyticsService.setAttribute.bind(crashlyticsService),
    setAttributes: crashlyticsService.setAttributes.bind(crashlyticsService),
    setEnabled: crashlyticsService.setEnabled.bind(crashlyticsService),
  };
}

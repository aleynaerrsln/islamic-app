import { AppState, AppStateStatus } from 'react-native';

// AdMob Uygulama ID'leri (PRODUCTION için kendi ID'lerinizi girin)
// Test modunda otomatik olarak test ID'leri kullanılır
export const AD_UNIT_IDS = {
  // Banner reklamlar
  BANNER_HOME: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-4083708100535757/6607994429',
  BANNER_QURAN: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-4083708100535757/2041628680',
  BANNER_SETTINGS: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-4083708100535757/4129278541',

  // Geçiş (Interstitial) reklamları
  INTERSTITIAL: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-4083708100535757/6196496116',

  // Ödüllü (Rewarded) reklamlar
  REWARDED: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-4083708100535757/4883414448',
};

// Reklam ayarları - kullanıcıyı rahatsız etmemek için sınırlar
const AD_CONFIG = {
  FIRST_AD_INTERVAL_MS: 60000,         // İlk reklam için minimum 60 saniye (1 dakika)
  MIN_INTERVAL_MS: 90000,              // Sonraki reklamlar arası minimum 90 saniye (1.5 dakika)
  MAX_ADS_PER_SESSION: 5,              // Oturum başına maksimum 5 interstitial
  TIME_TRIGGER_MS: 60000,              // 1 dakika kullanım sonrası ilk reklam tetiklenebilir
  SESSION_RESET_TIMEOUT_MS: 1800000,   // 30 dakika inaktiflik sonrası oturum sıfırla
};

// Native modül referansları (lazy loaded)
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let adsModuleLoaded = false;

// Native modülü yükle
async function loadAdsModule(): Promise<boolean> {
  if (adsModuleLoaded) return true;

  try {
    const adsModule = await import('react-native-google-mobile-ads');
    InterstitialAd = adsModule.InterstitialAd;
    RewardedAd = adsModule.RewardedAd;
    AdEventType = adsModule.AdEventType;
    RewardedAdEventType = adsModule.RewardedAdEventType;
    adsModuleLoaded = true;
    console.log('Ads module loaded successfully');
    return true;
  } catch (error) {
    console.log('Ads module not available:', error);
    return false;
  }
}

// Geçiş reklamı servisi
class InterstitialAdService {
  private ad: any = null;
  private isLoaded: boolean = false;
  private lastShownTime: number = 0;
  private sessionAdCount: number = 0;
  private appStartTime: number = Date.now();
  private hasShownTimeTriggerAd: boolean = false;
  private lastActivityTime: number = Date.now();
  private appStateSubscription: any = null;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) return;

    const moduleLoaded = await loadAdsModule();
    if (!moduleLoaded) {
      console.log('InterstitialAdService: Module not available, skipping initialization');
      return;
    }

    this.initialized = true;
    this.loadAd();
    this.setupAppStateListener();
  }

  // Uygulama durumu değişikliklerini dinle (arka plan / ön plan)
  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Uygulama ön plana geldi - oturumu kontrol et
        this.checkAndResetSession();
      } else if (nextAppState === 'background') {
        // Uygulama arka plana gitti - son aktivite zamanını kaydet
        this.lastActivityTime = Date.now();
      }
    });
  }

  // Oturumun sıfırlanması gerekip gerekmediğini kontrol et
  private checkAndResetSession() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // 30 dakikadan fazla inaktiflik varsa oturumu sıfırla
    if (timeSinceLastActivity >= AD_CONFIG.SESSION_RESET_TIMEOUT_MS) {
      console.log(`Session reset after ${Math.round(timeSinceLastActivity / 60000)} minutes of inactivity`);
      this.resetSession();
    }

    // Aktivite zamanını güncelle
    this.lastActivityTime = now;
  }

  private loadAd() {
    if (!InterstitialAd) {
      console.log('InterstitialAd not available');
      return;
    }

    try {
      this.ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.ad.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        console.log('Interstitial ad loaded');
      });

      this.ad.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        // Kapandıktan sonra yeni reklam yükle
        setTimeout(() => this.loadAd(), 1000);
      });

      this.ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('Interstitial ad error:', error);
        this.isLoaded = false;
        // Hata durumunda 30 saniye sonra tekrar dene
        setTimeout(() => this.loadAd(), 30000);
      });

      this.ad.load();
    } catch (error) {
      console.error('Failed to create interstitial ad:', error);
    }
  }

  // Reklam gösterilip gösterilemeyeceğini kontrol et
  canShowAd(): boolean {
    if (!this.initialized) return false;

    const now = Date.now();

    // Önce oturum sıfırlanması gerekiyor mu kontrol et
    this.checkAndResetSession();

    // Oturum limiti kontrolü
    if (this.sessionAdCount >= AD_CONFIG.MAX_ADS_PER_SESSION) {
      console.log('Interstitial ad: Session limit reached');
      return false;
    }

    // Zamanlama kontrolü - ilk reklam için 60 saniye, sonrakiler için 90 saniye
    if (this.sessionAdCount === 0) {
      // İlk reklam: Uygulama açılışından itibaren en az 60 saniye geçmeli
      const timeSinceAppStart = now - this.appStartTime;
      if (timeSinceAppStart < AD_CONFIG.FIRST_AD_INTERVAL_MS) {
        console.log(`Interstitial ad: First ad requires ${Math.ceil((AD_CONFIG.FIRST_AD_INTERVAL_MS - timeSinceAppStart) / 1000)}s more`);
        return false;
      }
    } else {
      // Sonraki reklamlar: Son reklamdan itibaren en az 90 saniye geçmeli
      if (this.lastShownTime > 0 && now - this.lastShownTime < AD_CONFIG.MIN_INTERVAL_MS) {
        console.log(`Interstitial ad: Need ${Math.ceil((AD_CONFIG.MIN_INTERVAL_MS - (now - this.lastShownTime)) / 1000)}s more between ads`);
        return false;
      }
    }

    // Reklam yüklü mü kontrolü
    if (!this.isLoaded || !this.ad) {
      console.log('Interstitial ad not loaded');
      return false;
    }

    return true;
  }

  // Belirli bir eylem için reklam göster (sure açma, namaz detayı vs.)
  async showForAction(actionName: string): Promise<boolean> {
    // Lazy initialization
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`Attempting to show ad for action: ${actionName}`);

    // Aktivite zamanını güncelle
    this.lastActivityTime = Date.now();

    if (!this.canShowAd()) {
      return false;
    }

    try {
      await this.ad!.show();
      this.lastShownTime = Date.now();
      this.sessionAdCount++;
      console.log(`Interstitial ad shown for: ${actionName} (Session count: ${this.sessionAdCount}/${AD_CONFIG.MAX_ADS_PER_SESSION})`);
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  // Zaman bazlı tetikleme (1 dakika kullanım sonrası)
  async showTimeTrigger(): Promise<boolean> {
    // Lazy initialization
    if (!this.initialized) {
      await this.initialize();
    }

    const now = Date.now();
    const appUsageTime = now - this.appStartTime;

    // Henüz 1 dakika geçmemişse gösterme
    if (appUsageTime < AD_CONFIG.TIME_TRIGGER_MS) {
      return false;
    }

    // Zaman tetiklemesi zaten kullanıldıysa gösterme
    if (this.hasShownTimeTriggerAd) {
      return false;
    }

    if (!this.canShowAd()) {
      return false;
    }

    try {
      await this.ad!.show();
      this.lastShownTime = now;
      this.sessionAdCount++;
      this.hasShownTimeTriggerAd = true;
      console.log('Time-triggered interstitial ad shown');
      return true;
    } catch (error) {
      console.error('Error showing time-triggered ad:', error);
      return false;
    }
  }

  // Eski show metodu - geriye uyumluluk için
  async show(): Promise<boolean> {
    return this.showForAction('generic');
  }

  isReady(): boolean {
    return this.initialized && this.isLoaded && this.canShowAd();
  }

  // Oturum sıfırlama
  resetSession() {
    this.sessionAdCount = 0;
    this.appStartTime = Date.now();
    this.hasShownTimeTriggerAd = false;
    this.lastShownTime = 0;
    console.log('Ad session reset');
  }

  // İstatistikler
  getStats() {
    const now = Date.now();
    return {
      sessionAdCount: this.sessionAdCount,
      maxAdsPerSession: AD_CONFIG.MAX_ADS_PER_SESSION,
      isLoaded: this.isLoaded,
      canShowMore: this.sessionAdCount < AD_CONFIG.MAX_ADS_PER_SESSION,
      timeSinceLastAd: this.lastShownTime > 0 ? now - this.lastShownTime : 0,
      appUsageTime: now - this.appStartTime,
      timeSinceLastActivity: now - this.lastActivityTime,
      // Zamanlama bilgileri
      firstAdIntervalMs: AD_CONFIG.FIRST_AD_INTERVAL_MS,
      subsequentAdIntervalMs: AD_CONFIG.MIN_INTERVAL_MS,
      isFirstAd: this.sessionAdCount === 0,
      initialized: this.initialized,
    };
  }

  // Temizlik (uygulama kapatılırken)
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

// Ödüllü reklam servisi
class RewardedAdService {
  private ad: any = null;
  private isLoaded: boolean = false;
  private onRewardEarned: (() => void) | null = null;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) return;

    const moduleLoaded = await loadAdsModule();
    if (!moduleLoaded) {
      console.log('RewardedAdService: Module not available, skipping initialization');
      return;
    }

    this.initialized = true;
    this.loadAd();
  }

  private loadAd() {
    if (!RewardedAd) {
      console.log('RewardedAd not available');
      return;
    }

    try {
      this.ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isLoaded = true;
        console.log('Rewarded ad loaded');
      });

      this.ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
        console.log('User earned reward:', reward);
        if (this.onRewardEarned) {
          this.onRewardEarned();
        }
      });

      this.ad.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        this.onRewardEarned = null;
        // Kapandıktan sonra yeni reklam yükle
        setTimeout(() => this.loadAd(), 1000);
      });

      this.ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('Rewarded ad error:', error);
        this.isLoaded = false;
        // Hata durumunda 30 saniye sonra tekrar dene
        setTimeout(() => this.loadAd(), 30000);
      });

      this.ad.load();
    } catch (error) {
      console.error('Failed to create rewarded ad:', error);
    }
  }

  async show(onReward?: () => void): Promise<boolean> {
    // Lazy initialization
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isLoaded || !this.ad) {
      console.log('Rewarded ad not loaded');
      return false;
    }

    this.onRewardEarned = onReward || null;

    try {
      await this.ad.show();
      return true;
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.initialized && this.isLoaded;
  }
}

// Singleton instances (lazy initialized)
export const interstitialAdService = new InterstitialAdService();
export const rewardedAdService = new RewardedAdService();

// Hook for easy access
export function useAds() {
  return {
    // Eylem bazlı reklam gösterimi
    showInterstitialForAction: (action: string) => interstitialAdService.showForAction(action),
    // Zaman bazlı reklam gösterimi
    showTimeTriggerAd: () => interstitialAdService.showTimeTrigger(),
    // Eski metod (geriye uyumluluk)
    showInterstitial: () => interstitialAdService.show(),
    // Ödüllü reklam
    showRewarded: (onReward?: () => void) => rewardedAdService.show(onReward),
    // Durum kontrolleri
    isInterstitialReady: () => interstitialAdService.isReady(),
    isRewardedReady: () => rewardedAdService.isReady(),
    canShowInterstitial: () => interstitialAdService.canShowAd(),
    // İstatistikler
    getAdStats: () => interstitialAdService.getStats(),
    // Oturum sıfırlama (manuel)
    resetAdSession: () => interstitialAdService.resetSession(),
    // Sabitler
    AD_UNIT_IDS,
    AD_CONFIG,
  };
}

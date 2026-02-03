// Namaz Vakitleri Tipleri
export interface PrayerTimes {
  Fajr: string;      // İmsak
  Sunrise: string;   // Güneş
  Dhuhr: string;     // Öğle
  Asr: string;       // İkindi
  Maghrib: string;   // Akşam
  Isha: string;      // Yatsı
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      gregorian: GregorianDate;
      hijri: HijriDate;
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: MethodInfo;
    };
  };
}

export interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  holidays: string[];
}

export interface MethodInfo {
  id: number;
  name: string;
  params: {
    Fajr: number;
    Isha: number;
  };
}

// Konum Tipleri
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Kur'an API Tipleri
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  };
}

export interface AyahEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  type: string;
}

export interface AyahResponse {
  code: number;
  status: string;
  data: Ayah | Ayah[];
}

export interface MultiEditionAyahResponse {
  code: number;
  status: string;
  data: Array<Ayah & { edition: AyahEdition }>;
}

// Hadis Tipleri
export interface Hadith {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation?: string;
  hints?: string[];
  categories?: string[];
  translations?: {
    [key: string]: string;
  };
}

export interface HadithListResponse {
  data: Hadith[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

// Kıble Tipleri
export interface QiblaDirection {
  latitude: number;
  longitude: number;
  direction: number; // Derece cinsinden
}

// Hicri Takvim Tipleri
export interface HijriCalendarDay {
  gregorian: GregorianDate;
  hijri: HijriDate;
}

// Kandil Günleri
export interface KandilGunu {
  hicriAy: number;
  hicriGun: number | string;
  isim: string;
  aciklama: string;
}

export interface DiniBayram {
  hicriAy: number;
  hicriGun: number;
  sure: number;
  isim: string;
}

// Arka Plan Ayarları
export type BackgroundType = 'color' | 'image';

export interface BackgroundSettings {
  type: BackgroundType;
  colorId: string | null;      // Düz renk seçiliyse
  imageId: string | null;      // Resim seçiliyse
  opacity: number;             // 0-1 arası saydamlık
}

// Ayarlar
export interface Settings {
  calculationMethod: number;
  language: 'tr' | 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  ezanSoundEnabled: boolean; // Bildirimde ezan sesi çalsın mı
  selectedMeal: 'tr.diyanet' | 'tr.ates' | 'tr.yazir';
  location: Location | null;
  locationMode: 'auto' | 'manual';
  background: BackgroundSettings;
  cardOpacity: number; // 0-1 arası kart arka plan saydamlığı
}

// Hesaplama Metodları
export interface CalculationMethod {
  id: number;
  name: string;
  nameEn: string;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 13, name: 'Diyanet İşleri Başkanlığı', nameEn: 'Diyanet' },
  { id: 3, name: 'Müslüman Dünya Birliği', nameEn: 'Muslim World League' },
  { id: 2, name: 'ISNA (Kuzey Amerika)', nameEn: 'ISNA' },
  { id: 4, name: 'Umm Al-Qura (Mekke)', nameEn: 'Umm Al-Qura' },
  { id: 5, name: 'Mısır Genel Fetva Kurumu', nameEn: 'Egyptian General Authority' },
  { id: 1, name: 'Karachi Üniversitesi', nameEn: 'University of Islamic Sciences, Karachi' },
];

// Meal Seçenekleri
export interface MealOption {
  id: string;
  name: string;
  author: string;
}

export const MEAL_OPTIONS: MealOption[] = [
  { id: 'tr.diyanet', name: 'Diyanet İşleri', author: 'Diyanet İşleri Başkanlığı' },
  { id: 'tr.ates', name: 'Süleyman Ateş', author: 'Prof. Dr. Süleyman Ateş' },
  { id: 'tr.yazir', name: 'Elmalılı Hamdi Yazır', author: 'Elmalılı Muhammed Hamdi Yazır' },
];

// Namaz İsimleri (Türkçe)
export const PRAYER_NAMES: { [key in keyof PrayerTimes]: string } = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

// Hicri Ay İsimleri
export const HIJRI_MONTHS: { [key: number]: string } = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebiülevvel',
  4: 'Rebiülahir',
  5: 'Cemaziyelevvel',
  6: 'Cemaziyelahir',
  7: 'Recep',
  8: 'Şaban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce',
};

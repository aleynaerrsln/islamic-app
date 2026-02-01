import axios from 'axios';
import type { AyahResponse, MultiEditionAyahResponse } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Türkçe meal seçenekleri
export const TURKISH_EDITIONS = {
  DIYANET: 'tr.diyanet',
  ATES: 'tr.ates',
  YAZIR: 'tr.yazir',
};

// Arapça editions
export const ARABIC_EDITIONS = {
  UTHMANI: 'quran-uthmani',        // Osmanlı hattı
  SIMPLE: 'quran-simple',          // Basit yazım
  ALAFASY: 'ar.alafasy',           // Mishary Rashid Alafasy (Sesli)
  ABDULBASIT: 'ar.abdulbasit',     // Abdulbasit Abdussamad (Sesli)
};

// Okunuş (Transliteration) editions
export const TRANSLITERATION_EDITIONS = {
  EN: 'en.transliteration',        // Latin harflerle okunuş
};

/**
 * Tek bir ayet getirir
 * @param surah Sure numarası
 * @param ayah Ayet numarası
 * @param edition Edition (varsayılan: Osmanlı hattı)
 */
export async function getAyah(
  surah: number,
  ayah: number,
  edition: string = ARABIC_EDITIONS.UTHMANI
): Promise<AyahResponse> {
  const response = await api.get(`/ayah/${surah}:${ayah}/${edition}`);
  return response.data;
}

/**
 * Çoklu edition ile ayet getirir (Arapça + Türkçe meal)
 * @param surah Sure numarası
 * @param ayah Ayet numarası
 * @param editions Edition listesi
 */
export async function getAyahMultiEdition(
  surah: number,
  ayah: number,
  editions: string[] = [ARABIC_EDITIONS.UTHMANI, TURKISH_EDITIONS.DIYANET]
): Promise<MultiEditionAyahResponse> {
  const editionsStr = editions.join(',');
  const response = await api.get(`/ayah/${surah}:${ayah}/editions/${editionsStr}`);
  return response.data;
}

/**
 * Rastgele ayet getirir (1-6236 arası)
 * @param editions Edition listesi
 */
export async function getRandomAyah(
  editions: string[] = [ARABIC_EDITIONS.UTHMANI, TURKISH_EDITIONS.DIYANET]
): Promise<MultiEditionAyahResponse> {
  const randomAyahNumber = Math.floor(Math.random() * 6236) + 1;
  const editionsStr = editions.join(',');
  const response = await api.get(`/ayah/${randomAyahNumber}/editions/${editionsStr}`);
  return response.data;
}

/**
 * Belirli bir sure getirir
 * @param surahNumber Sure numarası (1-114)
 * @param edition Edition
 */
export async function getSurah(
  surahNumber: number,
  edition: string = ARABIC_EDITIONS.UTHMANI
): Promise<{
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: any[];
  };
}> {
  const response = await api.get(`/surah/${surahNumber}/${edition}`);
  return response.data;
}

/**
 * Sure'yi Arapça, Türkçe okunuş ve Türkçe meal ile birlikte getirir
 * @param surahNumber Sure numarası (1-114)
 * @param turkishEdition Türkçe meal edition
 */
export async function getSurahWithTranslation(
  surahNumber: number,
  turkishEdition: string = TURKISH_EDITIONS.DIYANET
): Promise<{
  surahInfo: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    arabic: string;
    transliteration: string;
    turkish: string;
    juz: number;
    page: number;
  }>;
}> {
  // Arapça, okunuş ve Türkçe'yi paralel olarak çek
  const [arabicResponse, transliterationResponse, turkishResponse] = await Promise.all([
    api.get(`/surah/${surahNumber}/${ARABIC_EDITIONS.UTHMANI}`),
    api.get(`/surah/${surahNumber}/${TRANSLITERATION_EDITIONS.EN}`),
    api.get(`/surah/${surahNumber}/${turkishEdition}`),
  ]);

  const arabicData = arabicResponse.data.data;
  const transliterationData = transliterationResponse.data.data;
  const turkishData = turkishResponse.data.data;

  // Ayetleri birleştir
  const ayahs = arabicData.ayahs.map((arabicAyah: any, index: number) => ({
    number: arabicAyah.number,
    numberInSurah: arabicAyah.numberInSurah,
    arabic: arabicAyah.text,
    transliteration: transliterationData.ayahs[index]?.text || '',
    turkish: turkishData.ayahs[index]?.text || '',
    juz: arabicAyah.juz,
    page: arabicAyah.page,
  }));

  return {
    surahInfo: {
      number: arabicData.number,
      name: arabicData.name,
      englishName: arabicData.englishName,
      englishNameTranslation: arabicData.englishNameTranslation,
      revelationType: arabicData.revelationType,
      numberOfAyahs: arabicData.numberOfAyahs,
    },
    ayahs,
  };
}

/**
 * Tüm surelerin listesini getirir
 */
export async function getAllSurahs(): Promise<{
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}> {
  const response = await api.get('/surah');
  return response.data;
}

/**
 * Belirli bir cüz getirir
 * @param juzNumber Cüz numarası (1-30)
 * @param edition Edition
 */
export async function getJuz(
  juzNumber: number,
  edition: string = ARABIC_EDITIONS.UTHMANI
): Promise<any> {
  const response = await api.get(`/juz/${juzNumber}/${edition}`);
  return response.data;
}

/**
 * Ayet arar
 * @param keyword Aranacak kelime
 * @param surah Sure numarası (0 = tüm sureler)
 * @param language Dil kodu
 */
export async function searchAyahs(
  keyword: string,
  surah: number = 0,
  language: string = 'tr'
): Promise<any> {
  const response = await api.get(`/search/${encodeURIComponent(keyword)}/${surah}/${language}`);
  return response.data;
}

/**
 * Ses dosyası URL'i döndürür
 * @param surah Sure numarası
 * @param ayah Ayet numarası
 * @param reciter Okuyucu
 */
export function getAudioUrl(
  surah: number,
  ayah: number,
  reciter: string = 'ar.alafasy'
): string {
  // Sure ve ayet numarasını formatlama (örn: 002001 = 2. sure, 1. ayet)
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  return `https://cdn.alquran.cloud/media/audio/ayah/${reciter}/${surahStr}${ayahStr}`;
}

// Ayet kategori tipleri
export type AyahCategory =
  | 'comfort'     // Teselli, gönül ferahlığı
  | 'patience'    // Sabır
  | 'mercy'       // Merhamet, rahmet
  | 'prayer'      // Dua
  | 'fasting'     // Oruç, Ramazan
  | 'trust'       // Tevekkül
  | 'protection'  // Koruma
  | 'forgiveness' // Af, bağışlama
  | 'general';    // Genel

/**
 * Popüler ayetler (günlük ayet için kullanılabilir)
 */
export const POPULAR_AYAHS: Array<{
  surah: number;
  ayah: number;
  name: string;
  categories?: AyahCategory[];
}> = [
  { surah: 2, ayah: 255, name: 'Ayetel Kürsi', categories: ['protection', 'trust'] },
  { surah: 2, ayah: 286, name: 'Amenerrasulü', categories: ['prayer', 'comfort', 'trust'] },
  { surah: 36, ayah: 1, name: 'Yasin Suresi Başlangıç', categories: ['general'] },
  { surah: 67, ayah: 1, name: 'Mülk Suresi Başlangıç', categories: ['general'] },
  { surah: 112, ayah: 1, name: 'İhlas Suresi', categories: ['trust', 'general'] },
  { surah: 113, ayah: 1, name: 'Felak Suresi', categories: ['protection'] },
  { surah: 114, ayah: 1, name: 'Nas Suresi', categories: ['protection'] },
  { surah: 1, ayah: 1, name: 'Fatiha Suresi', categories: ['prayer', 'general'] },
  { surah: 2, ayah: 152, name: 'Beni anın...', categories: ['prayer'] },
  { surah: 2, ayah: 186, name: 'Dua ayeti', categories: ['prayer', 'comfort'] },
  { surah: 3, ayah: 26, name: 'Mülkün sahibi...', categories: ['trust'] },
  { surah: 3, ayah: 173, name: 'Hasbunallahu...', categories: ['trust', 'comfort', 'protection'] },
  { surah: 9, ayah: 51, name: 'Kader ayeti', categories: ['trust', 'comfort'] },
  { surah: 13, ayah: 28, name: 'Kalpler ancak...', categories: ['comfort'] },
  { surah: 21, ayah: 87, name: 'Yunus duası', categories: ['prayer', 'comfort'] },
  { surah: 23, ayah: 118, name: 'Rabbim affet...', categories: ['prayer', 'forgiveness'] },
  { surah: 40, ayah: 60, name: 'Bana dua edin...', categories: ['prayer'] },
  { surah: 94, ayah: 5, name: 'Güçlükle beraber...', categories: ['comfort', 'patience'] },
  // Ramazan ve oruç ayetleri
  { surah: 2, ayah: 183, name: 'Oruç farz kılındı', categories: ['fasting'] },
  { surah: 2, ayah: 185, name: 'Ramazan ayı', categories: ['fasting'] },
  // Sabır ayetleri
  { surah: 2, ayah: 153, name: 'Sabredenlerle...', categories: ['patience', 'comfort'] },
  { surah: 3, ayah: 200, name: 'Sabırlı olun', categories: ['patience'] },
  // Merhamet ve af ayetleri
  { surah: 39, ayah: 53, name: 'Rahmetinden ümit kesmeyin', categories: ['mercy', 'comfort', 'forgiveness'] },
  { surah: 4, ayah: 110, name: 'Günahtan tövbe', categories: ['forgiveness'] },
];

// Kategoriye göre ayet listesi getir
export function getAyahsByCategory(category: AyahCategory) {
  return POPULAR_AYAHS.filter(ayah => ayah.categories?.includes(category));
}

/**
 * Günün ayetini getirir (her gün farklı)
 * @param editions Edition listesi
 * @param category Opsiyonel kategori filtresi
 */
export async function getDailyAyah(
  editions: string[] = [ARABIC_EDITIONS.UTHMANI, TURKISH_EDITIONS.DIYANET],
  category?: AyahCategory
): Promise<MultiEditionAyahResponse> {
  // Günün index'ini hesapla (yılın kaçıncı günü)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Kategori belirtilmişse o kategoriden seç
  let ayahList = POPULAR_AYAHS;
  if (category) {
    const categoryAyahs = getAyahsByCategory(category);
    if (categoryAyahs.length > 0) {
      ayahList = categoryAyahs;
    }
  }

  // Popüler ayetlerden birini seç
  const index = dayOfYear % ayahList.length;
  const selectedAyah = ayahList[index];

  return getAyahMultiEdition(selectedAyah.surah, selectedAyah.ayah, editions);
}

// Teselli/ferahlık veren ayetler
export function getComfortingAyahs() {
  return getAyahsByCategory('comfort');
}

// Ramazan için özel ayetler
export function getRamadanAyahs() {
  return POPULAR_AYAHS.filter(ayah =>
    ayah.categories?.some(cat => ['fasting', 'patience'].includes(cat))
  );
}

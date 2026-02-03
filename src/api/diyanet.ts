import axios from 'axios';
import type { PrayerTimes, HijriDate } from '../types';

// Diyanet İşleri Başkanlığı namaz vakitleri için API wrapper
// AwqatSalat API kullanarak Diyanet verilerini çekiyoruz

const AWQAT_API = 'https://api.aladhan.com/v1';
const DIYANET_METHOD = 13; // Diyanet İşleri Başkanlığı hesaplama metodu

// Türkiye şehirleri için Diyanet ID'leri (il bazında)
const TURKEY_DIYANET_IDS: { [key: string]: number } = {
  'Adana': 9146,
  'Adıyaman': 9158,
  'Afyonkarahisar': 9167,
  'Ağrı': 9185,
  'Amasya': 9193,
  'Ankara': 9206,
  'Antalya': 9225,
  'Artvin': 9238,
  'Aydın': 9246,
  'Balıkesir': 9285,
  'Bilecik': 9297,
  'Bingöl': 9303,
  'Bitlis': 9311,
  'Bolu': 9315,
  'Burdur': 9327,
  'Bursa': 9335,
  'Çanakkale': 9352,
  'Çankırı': 9359,
  'Çorum': 9370,
  'Denizli': 9392,
  'Diyarbakır': 9402,
  'Edirne': 9419,
  'Elazığ': 9432,
  'Erzincan': 9440,
  'Erzurum': 9451,
  'Eskişehir': 9470,
  'Gaziantep': 9479,
  'Giresun': 9494,
  'Gümüşhane': 9501,
  'Hakkari': 9507,
  'Hatay': 9522,
  'Isparta': 9536,
  'Mersin': 9549,
  'İstanbul': 9541,
  'İzmir': 9560,
  'Kars': 9594,
  'Kastamonu': 9609,
  'Kayseri': 9620,
  'Kırklareli': 9629,
  'Kırşehir': 9635,
  'Kocaeli': 9638,
  'Konya': 9676,
  'Kütahya': 9689,
  'Malatya': 9703,
  'Manisa': 9716,
  'Kahramanmaraş': 9577,
  'Mardin': 9726,
  'Muğla': 9747,
  'Muş': 9755,
  'Nevşehir': 9760,
  'Niğde': 9766,
  'Ordu': 9782,
  'Rize': 9799,
  'Sakarya': 9807,
  'Samsun': 9819,
  'Siirt': 9828,
  'Sinop': 9839,
  'Sivas': 9854,
  'Tekirdağ': 9879,
  'Tokat': 9887,
  'Trabzon': 9905,
  'Tunceli': 9914,
  'Şanlıurfa': 9866,
  'Uşak': 9919,
  'Van': 9930,
  'Yozgat': 9949,
  'Zonguldak': 9955,
  'Aksaray': 17749,
  'Bayburt': 17750,
  'Karaman': 17752,
  'Kırıkkale': 17753,
  'Batman': 17754,
  'Şırnak': 17755,
  'Bartın': 17756,
  'Ardahan': 17757,
  'Iğdır': 17758,
  'Yalova': 17759,
  'Karabük': 17760,
  'Kilis': 17761,
  'Osmaniye': 17762,
  'Düzce': 17763,
};

interface DiyanetPrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      hijri: HijriDate;
      gregorian: any;
    };
    meta: any;
  };
}

/**
 * Koordinatlara göre Diyanet namaz vakitlerini getirir
 * Aladhan API'sini Diyanet hesaplama metoduyla kullanır
 */
export async function getDiyanetPrayerTimes(
  latitude: number,
  longitude: number
): Promise<DiyanetPrayerTimesResponse> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const response = await axios.get(`${AWQAT_API}/timings/${dateStr}`, {
      params: {
        latitude,
        longitude,
        method: DIYANET_METHOD,
        // Diyanet'in kullandığı ayarlar
        tune: '0,0,0,0,0,0,0,0,0', // Dakika ayarlamaları
        school: 1, // Hanefi mezhep (standart Asr hesaplaması)
        midnightMode: 0,
        latitudeAdjustmentMethod: 3, // Angle-based method
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error('Diyanet namaz vakitleri alınamadı:', error);
    throw error;
  }
}

/**
 * Aylık Diyanet namaz vakitlerini getirir
 */
export async function getDiyanetMonthlyCalendar(
  year: number,
  month: number,
  latitude: number,
  longitude: number
): Promise<{ data: any[] }> {
  try {
    const response = await axios.get(`${AWQAT_API}/calendar/${year}/${month}`, {
      params: {
        latitude,
        longitude,
        method: DIYANET_METHOD,
        school: 1,
        midnightMode: 0,
        latitudeAdjustmentMethod: 3,
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error('Aylık namaz takvimi alınamadı:', error);
    throw error;
  }
}

/**
 * Şehir adına göre Diyanet ID'sini bul
 */
export function getDiyanetCityId(cityName: string): number | null {
  // Şehir adını normalize et
  const normalizedName = cityName
    .split(' - ')[0] // "İstanbul - Kadıköy" -> "İstanbul"
    .split(',')[0]    // "İstanbul, Turkey" -> "İstanbul"
    .trim();

  return TURKEY_DIYANET_IDS[normalizedName] || null;
}

/**
 * Vakitleri saat:dakika formatına çevirir
 */
export function formatPrayerTime(time: string): string {
  if (!time) return '--:--';
  // "05:30 (EET)" gibi formatları sadece saat:dakika olarak döndür
  return time.split(' ')[0];
}

/**
 * Tüm vakitleri formatla
 */
export function formatAllPrayerTimes(timings: PrayerTimes): PrayerTimes {
  return {
    Fajr: formatPrayerTime(timings.Fajr),
    Sunrise: formatPrayerTime(timings.Sunrise),
    Dhuhr: formatPrayerTime(timings.Dhuhr),
    Asr: formatPrayerTime(timings.Asr),
    Maghrib: formatPrayerTime(timings.Maghrib),
    Isha: formatPrayerTime(timings.Isha),
  };
}

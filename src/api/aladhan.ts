import axios from 'axios';
import type {
  PrayerTimesResponse,
  QiblaDirection,
  HijriCalendarDay,
  Location
} from '../types';

const BASE_URL = 'https://api.aladhan.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 saniye timeout
});

/**
 * Koordinatlara göre namaz vakitlerini getirir
 * @param latitude Enlem
 * @param longitude Boylam
 * @param method Hesaplama metodu (varsayılan: 13 - Diyanet)
 */
export async function getPrayerTimesByCoordinates(
  latitude: number,
  longitude: number,
  method: number = 13
): Promise<PrayerTimesResponse> {
  const response = await api.get('/timings', {
    params: {
      latitude,
      longitude,
      method,
    },
  });
  return response.data;
}

/**
 * Şehir ve ülkeye göre namaz vakitlerini getirir
 * @param city Şehir adı
 * @param country Ülke adı
 * @param method Hesaplama metodu
 */
export async function getPrayerTimesByCity(
  city: string,
  country: string,
  method: number = 13
): Promise<PrayerTimesResponse> {
  const response = await api.get('/timingsByCity', {
    params: {
      city,
      country,
      method,
    },
  });
  return response.data;
}

/**
 * Belirli bir tarih için namaz vakitlerini getirir
 * @param date Tarih (timestamp)
 * @param latitude Enlem
 * @param longitude Boylam
 * @param method Hesaplama metodu
 */
export async function getPrayerTimesForDate(
  date: number,
  latitude: number,
  longitude: number,
  method: number = 13
): Promise<PrayerTimesResponse> {
  const response = await api.get(`/timings/${date}`, {
    params: {
      latitude,
      longitude,
      method,
    },
  });
  return response.data;
}

/**
 * Aylık namaz vakti takvimini getirir
 * @param year Yıl
 * @param month Ay (1-12)
 * @param latitude Enlem
 * @param longitude Boylam
 * @param method Hesaplama metodu
 */
export async function getMonthlyCalendar(
  year: number,
  month: number,
  latitude: number,
  longitude: number,
  method: number = 13
): Promise<{ data: HijriCalendarDay[] }> {
  const response = await api.get(`/calendar/${year}/${month}`, {
    params: {
      latitude,
      longitude,
      method,
    },
  });
  return response.data;
}

/**
 * Kıble yönünü hesaplar
 * @param latitude Enlem
 * @param longitude Boylam
 */
export async function getQiblaDirection(
  latitude: number,
  longitude: number
): Promise<{ data: QiblaDirection }> {
  const response = await api.get(`/qibla/${latitude}/${longitude}`);
  return response.data;
}

/**
 * Miladi tarihi Hicri tarihe çevirir
 * @param date Tarih (DD-MM-YYYY formatında)
 */
export async function gregorianToHijri(
  date: string
): Promise<{ data: { hijri: any; gregorian: any } }> {
  const response = await api.get('/gToH', {
    params: { date },
  });
  return response.data;
}

/**
 * Hicri tarihi Miladi tarihe çevirir
 * @param date Tarih (DD-MM-YYYY formatında)
 */
export async function hijriToGregorian(
  date: string
): Promise<{ data: { hijri: any; gregorian: any } }> {
  const response = await api.get('/hToG', {
    params: { date },
  });
  return response.data;
}

/**
 * Bugünün Hicri tarihini getirir
 */
export async function getCurrentHijriDate(): Promise<{ data: any }> {
  const response = await api.get('/currentDate');
  return response.data;
}

/**
 * Sonraki İslami tatili getirir
 */
export async function getNextHijriHoliday(): Promise<{ data: any }> {
  const response = await api.get('/nextHijriHoliday');
  return response.data;
}

/**
 * Mekke'ye olan mesafeyi hesaplar (km)
 * Kabe koordinatları: Google Qibla Finder resmi koordinatları
 */
export function calculateDistanceToMecca(location: Location): number {
  const kaaba = { latitude: 21.4224779, longitude: 39.8251832 };

  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = toRad(kaaba.latitude - location.latitude);
  const dLon = toRad(kaaba.longitude - location.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(location.latitude)) *
      Math.cos(toRad(kaaba.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function toDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Kıble yönünü yerel olarak hesaplar (Great Circle formülü)
 * Kabe koordinatları: Google Qibla Finder resmi koordinatları
 * @param latitude Kullanıcının enlemi
 * @param longitude Kullanıcının boylamı
 * @returns Kıble yönü (0-360 derece, kuzeye göre saat yönünde)
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const kaaba = { latitude: 21.4224779, longitude: 39.8251832 };

  const lat1 = toRad(latitude);
  const lat2 = toRad(kaaba.latitude);
  const deltaLon = toRad(kaaba.longitude - longitude);

  // Büyük daire (great circle) formülü
  const y = Math.sin(deltaLon);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLon);

  let qibla = toDeg(Math.atan2(y, x));

  // 0-360 aralığına normalize et
  if (qibla < 0) {
    qibla += 360;
  }

  return qibla;
}

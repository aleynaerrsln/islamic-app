// Diyanet İşleri Başkanlığı resmi takviminden alınan dini günler
// Kaynak: https://vakithesaplama.diyanet.gov.tr

export interface IslamicEvent {
  name: string;
  nameEn: string;
  date: string; // YYYY-MM-DD format
  type: 'kandil' | 'ramadan' | 'bayram' | 'other';
  icon: string;
  color: string;
}

export interface YearlyIslamicDates {
  [year: number]: IslamicEvent[];
}

// Diyanet'in resmi takviminden alınan tarihler
export const DIYANET_DATES: YearlyIslamicDates = {
  2025: [
    // Kandiller
    { name: 'Regaib Kandili', nameEn: 'Ragaib', date: '2025-01-02', type: 'kandil', icon: 'candle', color: '#00BCD4' },
    { name: 'Miraç Kandili', nameEn: 'Isra and Miraj', date: '2025-01-27', type: 'kandil', icon: 'stairs-up', color: '#3F51B5' },
    { name: 'Berat Kandili', nameEn: 'Mid-Shaban', date: '2025-02-13', type: 'kandil', icon: 'book-open-variant', color: '#009688' },
    { name: 'Kadir Gecesi', nameEn: 'Laylat al-Qadr', date: '2025-03-27', type: 'kandil', icon: 'weather-night', color: '#FFD700' },
    { name: 'Mevlid Kandili', nameEn: 'Mawlid', date: '2025-09-04', type: 'kandil', icon: 'star-crescent', color: '#E91E63' },
    // Ramazan
    { name: 'Ramazan Başlangıcı', nameEn: 'Ramadan Start', date: '2025-03-01', type: 'ramadan', icon: 'moon-waning-crescent', color: '#9C27B0' },
    // Bayramlar
    { name: 'Ramazan Bayramı', nameEn: 'Eid al-Fitr', date: '2025-03-30', type: 'bayram', icon: 'moon-new', color: '#4CAF50' },
    { name: 'Kurban Bayramı', nameEn: 'Eid al-Adha', date: '2025-06-06', type: 'bayram', icon: 'sheep', color: '#FF9800' },
  ],
  2026: [
    // Kandiller (Diyanet 2026 takvimi)
    { name: 'Regaib Kandili', nameEn: 'Ragaib', date: '2026-01-08', type: 'kandil', icon: 'candle', color: '#00BCD4' },
    { name: 'Miraç Kandili', nameEn: 'Isra and Miraj', date: '2026-01-15', type: 'kandil', icon: 'stairs-up', color: '#3F51B5' },
    { name: 'Berat Kandili', nameEn: 'Mid-Shaban', date: '2026-02-02', type: 'kandil', icon: 'book-open-variant', color: '#009688' },
    { name: 'Kadir Gecesi', nameEn: 'Laylat al-Qadr', date: '2026-03-16', type: 'kandil', icon: 'weather-night', color: '#FFD700' },
    { name: 'Mevlid Kandili', nameEn: 'Mawlid', date: '2026-08-24', type: 'kandil', icon: 'star-crescent', color: '#E91E63' },
    { name: 'Regaib Kandili', nameEn: 'Ragaib', date: '2026-12-10', type: 'kandil', icon: 'candle', color: '#00BCD4' },
    // Ramazan
    { name: 'Ramazan Başlangıcı', nameEn: 'Ramadan Start', date: '2026-02-19', type: 'ramadan', icon: 'moon-waning-crescent', color: '#9C27B0' },
    // Bayramlar
    { name: 'Ramazan Bayramı', nameEn: 'Eid al-Fitr', date: '2026-03-20', type: 'bayram', icon: 'moon-new', color: '#4CAF50' },
    { name: 'Kurban Bayramı', nameEn: 'Eid al-Adha', date: '2026-05-27', type: 'bayram', icon: 'sheep', color: '#FF9800' },
  ],
  2027: [
    // Kandiller
    { name: 'Miraç Kandili', nameEn: 'Isra and Miraj', date: '2027-01-04', type: 'kandil', icon: 'stairs-up', color: '#3F51B5' },
    { name: 'Berat Kandili', nameEn: 'Mid-Shaban', date: '2027-01-22', type: 'kandil', icon: 'book-open-variant', color: '#009688' },
    { name: 'Kadir Gecesi', nameEn: 'Laylat al-Qadr', date: '2027-03-06', type: 'kandil', icon: 'weather-night', color: '#FFD700' },
    { name: 'Mevlid Kandili', nameEn: 'Mawlid', date: '2027-08-14', type: 'kandil', icon: 'star-crescent', color: '#E91E63' },
    { name: 'Regaib Kandili', nameEn: 'Ragaib', date: '2027-11-30', type: 'kandil', icon: 'candle', color: '#00BCD4' },
    // Ramazan
    { name: 'Ramazan Başlangıcı', nameEn: 'Ramadan Start', date: '2027-02-08', type: 'ramadan', icon: 'moon-waning-crescent', color: '#9C27B0' },
    // Bayramlar
    { name: 'Ramazan Bayramı', nameEn: 'Eid al-Fitr', date: '2027-03-10', type: 'bayram', icon: 'moon-new', color: '#4CAF50' },
    { name: 'Kurban Bayramı', nameEn: 'Eid al-Adha', date: '2027-05-17', type: 'bayram', icon: 'sheep', color: '#FF9800' },
  ],
  2028: [
    // Kandiller
    { name: 'Miraç Kandili', nameEn: 'Isra and Miraj', date: '2027-12-24', type: 'kandil', icon: 'stairs-up', color: '#3F51B5' },
    { name: 'Berat Kandili', nameEn: 'Mid-Shaban', date: '2028-01-11', type: 'kandil', icon: 'book-open-variant', color: '#009688' },
    { name: 'Kadir Gecesi', nameEn: 'Laylat al-Qadr', date: '2028-02-23', type: 'kandil', icon: 'weather-night', color: '#FFD700' },
    { name: 'Mevlid Kandili', nameEn: 'Mawlid', date: '2028-08-02', type: 'kandil', icon: 'star-crescent', color: '#E91E63' },
    { name: 'Regaib Kandili', nameEn: 'Ragaib', date: '2028-11-18', type: 'kandil', icon: 'candle', color: '#00BCD4' },
    // Ramazan
    { name: 'Ramazan Başlangıcı', nameEn: 'Ramadan Start', date: '2028-01-28', type: 'ramadan', icon: 'moon-waning-crescent', color: '#9C27B0' },
    // Bayramlar
    { name: 'Ramazan Bayramı', nameEn: 'Eid al-Fitr', date: '2028-02-27', type: 'bayram', icon: 'moon-new', color: '#4CAF50' },
    { name: 'Kurban Bayramı', nameEn: 'Eid al-Adha', date: '2028-05-05', type: 'bayram', icon: 'sheep', color: '#FF9800' },
  ],
};

// Türkçe ay isimleri
const TURKISH_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// Tarihi Türkçe formata çevir (timezone-safe)
export function formatDateTurkish(dateStr: string): string {
  // YYYY-MM-DD formatından parse et (timezone sorununu önle)
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${TURKISH_MONTHS[month - 1]}`;
}

// Belirli bir yıl için tüm dini günleri getir
export function getIslamicDatesForYear(year: number): IslamicEvent[] | null {
  return DIYANET_DATES[year] || null;
}

// Yerel tarihi YYYY-MM-DD formatına çevir (timezone-safe)
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Bugünden sonraki en yakın etkinliği bul
export function getUpcomingEvents(today: Date = new Date()): {
  ramadan: IslamicEvent | null;
  bayram: IslamicEvent | null;
  kandil: IslamicEvent | null;
} {
  const currentYear = today.getFullYear();
  // Yerel tarih kullan (UTC değil)
  const todayStr = getLocalDateString(today);

  let ramadan: IslamicEvent | null = null;
  let bayram: IslamicEvent | null = null;
  let kandil: IslamicEvent | null = null;

  // Bu yıl ve gelecek yılı kontrol et
  const yearsToCheck = [currentYear, currentYear + 1];

  for (const year of yearsToCheck) {
    const events = DIYANET_DATES[year];
    if (!events) continue;

    for (const event of events) {
      // Geçmiş tarihleri atla (bugünü dahil et, bugün gösterilecek)
      if (event.date < todayStr) continue;

      if (event.type === 'ramadan' && !ramadan) {
        ramadan = event;
      } else if (event.type === 'bayram' && !bayram) {
        bayram = event;
      } else if (event.type === 'kandil' && !kandil) {
        kandil = event;
      }

      // Hepsini bulduysan çık
      if (ramadan && bayram && kandil) break;
    }

    if (ramadan && bayram && kandil) break;
  }

  return { ramadan, bayram, kandil };
}

// Gün farkını hesapla (timezone-safe)
export function calculateDaysUntil(targetDateStr: string, today: Date = new Date()): number {
  // Target date'i parse et (YYYY-MM-DD formatında)
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  // Bugünün yerel tarihini al
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  const diffTime = targetDate.getTime() - todayLocal.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Ramazan ayında mıyız kontrol et
export function isCurrentlyRamadan(today: Date = new Date()): boolean {
  const currentYear = today.getFullYear();
  const events = DIYANET_DATES[currentYear];
  if (!events) return false;

  const ramadanStart = events.find(e => e.type === 'ramadan');
  const ramadanBayram = events.find(e => e.type === 'bayram' && e.name === 'Ramazan Bayramı');

  if (!ramadanStart || !ramadanBayram) return false;

  // Yerel tarih kullan (UTC değil)
  const todayStr = getLocalDateString(today);
  return todayStr >= ramadanStart.date && todayStr < ramadanBayram.date;
}

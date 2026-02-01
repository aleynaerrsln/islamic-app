// Bağlam Farkında Günlük İçerik Yönetimi
// Ramazan, Cuma, kandil gibi özel günlerde uygun içerik seçimi

import { isCurrentlyRamadan, getUpcomingEvents, calculateDaysUntil } from '../data/islamicDates';
import { getDailyEsma, EsmaCategory } from '../data/esmaUlHusna';
import { getDailyHadis, HadisCategory } from '../data/hadisler';
import { getDailyAyah, AyahCategory, ARABIC_EDITIONS, TURKISH_EDITIONS } from '../api/quran';

// Bağlam tipi
export type ContentContext =
  | 'ramadan'    // Ramazan ayı
  | 'friday'     // Cuma günü
  | 'kandil'     // Kandil gecesi yaklaşıyor
  | 'comfort'    // Teselli/ferahlık (varsayılan)
  | 'general';   // Genel

// Mevcut bağlamı tespit et
export function getCurrentContext(): ContentContext {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Pazar, 5=Cuma

  // Ramazan kontrolü
  if (isCurrentlyRamadan(today)) {
    return 'ramadan';
  }

  // Cuma günü kontrolü
  if (dayOfWeek === 5) {
    return 'friday';
  }

  // Kandil yaklaşıyor mu? (3 gün içinde)
  const upcoming = getUpcomingEvents(today);
  if (upcoming.kandil) {
    const daysUntil = calculateDaysUntil(upcoming.kandil.date, today);
    if (daysUntil >= 0 && daysUntil <= 3) {
      return 'kandil';
    }
  }

  // Hafta içi - teselli/ferahlık veren içerikler
  // (İnsanlar genellikle hafta içi daha stresli oluyor)
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    return 'comfort';
  }

  return 'general';
}

// Bağlama göre esma kategorisi
function getEsmaCategoryForContext(context: ContentContext): EsmaCategory | undefined {
  switch (context) {
    case 'ramadan':
      // Ramazan'da merhamet, af ve sabır esmaları
      return 'mercy';
    case 'friday':
      // Cuma günü genel esmalar
      return undefined;
    case 'kandil':
      // Kandil gecelerinde af ve merhamet
      return 'forgiveness';
    case 'comfort':
      // Teselli veren esmalar
      return 'comfort';
    default:
      return undefined;
  }
}

// Bağlama göre hadis kategorisi
function getHadisCategoryForContext(context: ContentContext): HadisCategory | undefined {
  switch (context) {
    case 'ramadan':
      // Ramazan'da oruç ve sabır hadisleri
      return 'fasting';
    case 'friday':
      // Cuma günü namaz hadisleri
      return 'prayer';
    case 'kandil':
      // Kandil gecelerinde dua hadisleri
      return 'prayer';
    case 'comfort':
      // Teselli veren hadisler
      return 'comfort';
    default:
      return undefined;
  }
}

// Bağlama göre ayet kategorisi
function getAyahCategoryForContext(context: ContentContext): AyahCategory | undefined {
  switch (context) {
    case 'ramadan':
      // Ramazan'da oruç ayetleri
      return 'fasting';
    case 'friday':
      // Cuma günü dua ayetleri
      return 'prayer';
    case 'kandil':
      // Kandil gecelerinde af ve merhamet ayetleri
      return 'forgiveness';
    case 'comfort':
      // Teselli veren ayetler
      return 'comfort';
    default:
      return undefined;
  }
}

// Bağlam farkında günün esmasını getir
export function getContextAwareDailyEsma() {
  const context = getCurrentContext();
  const category = getEsmaCategoryForContext(context);
  return {
    esma: getDailyEsma(category),
    context,
  };
}

// Bağlam farkında günün hadisini getir
export function getContextAwareDailyHadis() {
  const context = getCurrentContext();
  const category = getHadisCategoryForContext(context);
  return {
    hadis: getDailyHadis(category),
    context,
  };
}

// Bağlam farkında günün ayetini getir
export async function getContextAwareDailyAyah() {
  const context = getCurrentContext();
  const category = getAyahCategoryForContext(context);
  const response = await getDailyAyah(
    [ARABIC_EDITIONS.UTHMANI, TURKISH_EDITIONS.DIYANET],
    category
  );
  return {
    response,
    context,
  };
}

// Bağlam açıklaması (kullanıcıya göstermek için)
export function getContextDescription(context: ContentContext): string {
  switch (context) {
    case 'ramadan':
      return 'Ramazan ayı için özel içerik';
    case 'friday':
      return 'Cuma günü için özel içerik';
    case 'kandil':
      return 'Kandil gecesi için özel içerik';
    case 'comfort':
      return 'Gönül ferahlığı veren içerik';
    default:
      return 'Günün içeriği';
  }
}

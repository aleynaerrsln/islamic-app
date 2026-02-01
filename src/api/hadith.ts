import axios from 'axios';
import type { Hadith, HadithListResponse } from '../types';

// HadeethEnc API (API key gerektirmez)
const BASE_URL = 'https://hadeethenc.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Hadis kategorileri
export const HADITH_CATEGORIES = {
  IMAN: 1,           // İman
  IBADET: 2,         // İbadet
  AHLAK: 3,          // Ahlak
  MUAMELAT: 4,       // Muamelat
  AILE: 5,           // Aile
  ADAB: 6,           // Adab
};

/**
 * Hadis listesi getirir
 * @param categoryId Kategori ID
 * @param page Sayfa numarası
 * @param language Dil kodu (tr, en, ar)
 */
export async function getHadithList(
  categoryId: number = 1,
  page: number = 1,
  language: string = 'tr'
): Promise<HadithListResponse> {
  const response = await api.get('/hadeeths/list/', {
    params: {
      language,
      category_id: categoryId,
      page,
      per_page: 20,
    },
  });
  return response.data;
}

/**
 * Tek hadis getirir
 * @param id Hadis ID
 * @param language Dil kodu
 */
export async function getHadith(
  id: string,
  language: string = 'tr'
): Promise<{ data: Hadith }> {
  const response = await api.get('/hadeeths/one/', {
    params: {
      language,
      id,
    },
  });
  return { data: response.data };
}

/**
 * Rastgele hadis getirir
 * @param language Dil kodu
 */
export async function getRandomHadith(
  language: string = 'tr'
): Promise<Hadith> {
  // Önce toplam hadis sayısını al
  const listResponse = await getHadithList(1, 1, language);
  const totalPages = listResponse.meta?.last_page || 10;

  // Rastgele bir sayfa seç
  const randomPage = Math.floor(Math.random() * totalPages) + 1;
  const pageResponse = await getHadithList(1, randomPage, language);

  // Sayfadan rastgele bir hadis seç
  const hadiths = pageResponse.data || [];
  if (hadiths.length === 0) {
    throw new Error('Hadis bulunamadı');
  }

  const randomIndex = Math.floor(Math.random() * hadiths.length);
  return hadiths[randomIndex];
}

/**
 * Tüm kategorileri getirir
 * @param language Dil kodu
 */
export async function getCategories(
  language: string = 'tr'
): Promise<any[]> {
  const response = await api.get('/categories/roots/', {
    params: { language },
  });
  return response.data;
}

// Önceden hazırlanmış popüler hadisler (offline kullanım için)
export const POPULAR_HADITHS: Hadith[] = [
  {
    id: '1',
    title: 'Niyet Hadisi',
    hadeeth: 'Ameller niyetlere göredir. Herkesin niyet ettiği ne ise eline geçecek odur.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '2',
    title: 'Kolaylaştırın',
    hadeeth: 'Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '3',
    title: 'Müslüman Kardeşlik',
    hadeeth: 'Müslüman, Müslümanın kardeşidir. Ona zulmetmez, onu düşmana teslim etmez.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '4',
    title: 'Temizlik',
    hadeeth: 'Temizlik imanın yarısıdır.',
    attribution: 'Müslim',
    grade: 'Sahih',
  },
  {
    id: '5',
    title: 'Güzel Söz',
    hadeeth: 'Güzel söz sadakadır.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '6',
    title: 'Merhamet',
    hadeeth: 'Merhamet etmeyene merhamet olunmaz.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '7',
    title: 'Sabır',
    hadeeth: 'Sabır, musibetin ilk anında gösterilendir.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '8',
    title: 'İlim',
    hadeeth: 'İlim öğrenmek her Müslümana farzdır.',
    attribution: 'İbn Mace',
    grade: 'Hasen',
  },
  {
    id: '9',
    title: 'Komşu Hakkı',
    hadeeth: 'Cebrail bana komşu hakkını o kadar tavsiye etti ki, komşuyu komşuya mirasçı kılacak sandım.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '10',
    title: 'Hayırlı İnsan',
    hadeeth: 'İnsanların en hayırlısı, insanlara en faydalı olandır.',
    attribution: 'Taberani',
    grade: 'Hasen',
  },
  {
    id: '11',
    title: 'Öfke',
    hadeeth: 'Güçlü olan güreşte yenen değil, öfkelendiği zaman kendine hakim olandır.',
    attribution: 'Buhari, Müslim',
    grade: 'Sahih',
  },
  {
    id: '12',
    title: 'Dua',
    hadeeth: 'Dua ibadetin özüdür.',
    attribution: 'Tirmizi',
    grade: 'Hasen',
  },
  {
    id: '13',
    title: 'Cömertlik',
    hadeeth: 'Cömert kişi Allah\'a yakındır, cennete yakındır, insanlara yakındır.',
    attribution: 'Tirmizi',
    grade: 'Hasen',
  },
  {
    id: '14',
    title: 'Zulüm',
    hadeeth: 'Zulümden sakının! Çünkü zulüm, kıyamet gününde karanlıklar olacaktır.',
    attribution: 'Müslim',
    grade: 'Sahih',
  },
  {
    id: '15',
    title: 'Şükür',
    hadeeth: 'İnsanlara teşekkür etmeyen, Allah\'a da şükretmez.',
    attribution: 'Ebu Davud, Tirmizi',
    grade: 'Sahih',
  },
];

/**
 * Günün hadisini getirir (önce API'den, olmazsa offline listeden)
 */
export async function getDailyHadith(): Promise<Hadith> {
  try {
    // Günün index'ini hesapla
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Önce offline listeden dene (daha hızlı)
    const index = dayOfYear % POPULAR_HADITHS.length;
    return POPULAR_HADITHS[index];
  } catch (error) {
    // Hata durumunda ilk hadisi döndür
    return POPULAR_HADITHS[0];
  }
}

/**
 * Hadis arama
 * @param query Arama sorgusu
 * @param language Dil kodu
 */
export async function searchHadiths(
  query: string,
  language: string = 'tr'
): Promise<Hadith[]> {
  // Önce offline listede ara
  const lowerQuery = query.toLowerCase();
  const results = POPULAR_HADITHS.filter(
    h =>
      h.title.toLowerCase().includes(lowerQuery) ||
      h.hadeeth.toLowerCase().includes(lowerQuery)
  );

  return results;
}

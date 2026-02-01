// Günlük Hadis-i Şerifler
// Kaynak: Kütüb-i Sitte (Buhari, Müslim, Tirmizi, Ebu Davud, Nesai, İbn Mace)

// Kategori tipleri
export type HadisCategory =
  | 'comfort'     // Teselli, gönül ferahlığı
  | 'patience'    // Sabır
  | 'mercy'       // Merhamet
  | 'prayer'      // Namaz, dua
  | 'fasting'     // Oruç, Ramazan
  | 'charity'     // Sadaka, zekat
  | 'family'      // Aile, anne-baba
  | 'morality'    // Ahlak
  | 'trust'       // Tevekkül
  | 'knowledge'   // İlim
  | 'general';    // Genel

export interface HadisItem {
  id: number;
  arabic?: string;
  turkish: string;
  source: string;
  topic: string;
  categories?: HadisCategory[];
}

export const HADISLER: HadisItem[] = [
  {
    id: 1,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    turkish: 'Ameller niyetlere göredir. Herkes için niyet ettiği vardır.',
    source: 'Buhari, Müslim',
    topic: 'Niyet',
    categories: ['general'],
  },
  {
    id: 2,
    arabic: 'الدِّينُ النَّصِيحَةُ',
    turkish: 'Din nasihattir.',
    source: 'Müslim',
    topic: 'Nasihat',
    categories: ['morality'],
  },
  {
    id: 3,
    turkish: 'Müslüman, elinden ve dilinden Müslümanların güvende olduğu kimsedir.',
    source: 'Buhari, Müslim',
    topic: 'Müslümanlık',
    categories: ['morality'],
  },
  {
    id: 4,
    turkish: 'Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe gerçek iman etmiş olmaz.',
    source: 'Buhari, Müslim',
    topic: 'İman',
    categories: ['morality', 'mercy'],
  },
  {
    id: 5,
    turkish: 'Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz.',
    source: 'Buhari, Müslim',
    topic: 'Kolaylık',
    categories: ['comfort', 'mercy'],
  },
  {
    id: 6,
    turkish: 'Güzel söz sadakadır.',
    source: 'Buhari, Müslim',
    topic: 'Güzel Söz',
    categories: ['charity', 'morality'],
  },
  {
    id: 7,
    turkish: 'Allah güzeldir, güzeli sever.',
    source: 'Müslim',
    topic: 'Güzellik',
    categories: ['general'],
  },
  {
    id: 8,
    turkish: 'Temizlik imanın yarısıdır.',
    source: 'Müslim',
    topic: 'Temizlik',
    categories: ['general'],
  },
  {
    id: 9,
    turkish: 'Kuvvetli mümin, zayıf müminden daha hayırlı ve Allah\'a daha sevimlidir.',
    source: 'Müslim',
    topic: 'Kuvvet',
    categories: ['comfort', 'patience'],
  },
  {
    id: 10,
    turkish: 'Kim Allah\'a ve ahiret gününe inanıyorsa ya hayır söylesin ya da sussun.',
    source: 'Buhari, Müslim',
    topic: 'Söz',
    categories: ['morality'],
  },
  {
    id: 11,
    turkish: 'Cennet annelerin ayakları altındadır.',
    source: 'Nesai',
    topic: 'Anne',
    categories: ['family'],
  },
  {
    id: 12,
    turkish: 'En hayırlınız ailesine hayırlı olandır.',
    source: 'Tirmizi',
    topic: 'Aile',
    categories: ['family'],
  },
  {
    id: 13,
    turkish: 'Güler yüzle kardeşini karşılaman sadakadır.',
    source: 'Tirmizi',
    topic: 'Güler Yüz',
    categories: ['charity', 'morality', 'comfort'],
  },
  {
    id: 14,
    turkish: 'İlim öğrenmek her Müslümana farzdır.',
    source: 'İbn Mace',
    topic: 'İlim',
    categories: ['knowledge'],
  },
  {
    id: 15,
    turkish: 'Hikmet müminin yitiğidir, nerede bulursa alır.',
    source: 'Tirmizi',
    topic: 'Hikmet',
    categories: ['knowledge'],
  },
  {
    id: 16,
    turkish: 'Allah\'ım! Senden hidayet, takva, iffet ve gönül zenginliği isterim.',
    source: 'Müslim',
    topic: 'Dua',
    categories: ['prayer', 'comfort'],
  },
  {
    id: 17,
    turkish: 'Sabır ve namaz ile Allah\'tan yardım isteyin.',
    source: 'Buhari',
    topic: 'Sabır',
    categories: ['patience', 'prayer', 'comfort'],
  },
  {
    id: 18,
    turkish: 'Dünya ahiretin tarlasıdır.',
    source: 'Deylemi',
    topic: 'Dünya-Ahiret',
    categories: ['general'],
  },
  {
    id: 19,
    turkish: 'İnsanlara teşekkür etmeyen, Allah\'a da şükretmez.',
    source: 'Ebu Davud, Tirmizi',
    topic: 'Şükür',
    categories: ['morality'],
  },
  {
    id: 20,
    turkish: 'Komşusu açken tok yatan bizden değildir.',
    source: 'Taberani',
    topic: 'Komşuluk',
    categories: ['charity', 'mercy'],
  },
  {
    id: 21,
    turkish: 'Merhamet etmeyene merhamet edilmez.',
    source: 'Buhari, Müslim',
    topic: 'Merhamet',
    categories: ['mercy'],
  },
  {
    id: 22,
    turkish: 'Utanmazsan dilediğini yap.',
    source: 'Buhari',
    topic: 'Hayâ',
    categories: ['morality'],
  },
  {
    id: 23,
    turkish: 'Kişi sevdiği ile beraberdir.',
    source: 'Buhari, Müslim',
    topic: 'Sevgi',
    categories: ['comfort'],
  },
  {
    id: 24,
    turkish: 'Öfkelendiğinde ayaktaysan otur, oturuyorsan yat.',
    source: 'Ahmed bin Hanbel',
    topic: 'Öfke',
    categories: ['patience', 'morality'],
  },
  {
    id: 25,
    turkish: 'Az da olsa devamlı yapılan amel, Allah\'a en sevimli olandır.',
    source: 'Buhari, Müslim',
    topic: 'Devamlılık',
    categories: ['general'],
  },
  {
    id: 26,
    turkish: 'Cömertlik cennete yaklaştırır.',
    source: 'Tirmizi',
    topic: 'Cömertlik',
    categories: ['charity'],
  },
  {
    id: 27,
    turkish: 'Vera (şüphelilerden sakınmak) dinin yarısıdır.',
    source: 'Taberani',
    topic: 'Vera',
    categories: ['morality'],
  },
  {
    id: 28,
    turkish: 'Allah yumuşak huylu olanı sever.',
    source: 'Buhari',
    topic: 'Yumuşaklık',
    categories: ['mercy', 'morality'],
  },
  {
    id: 29,
    turkish: 'Hesaba çekilmeden önce kendinizi hesaba çekin.',
    source: 'Tirmizi',
    topic: 'Muhasebe',
    categories: ['general'],
  },
  {
    id: 30,
    turkish: 'Dua ibadetin özüdür.',
    source: 'Tirmizi',
    topic: 'Dua',
    categories: ['prayer'],
  },
  {
    id: 31,
    turkish: 'Mazlumun bedduasından sakının, çünkü onunla Allah arasında perde yoktur.',
    source: 'Buhari, Müslim',
    topic: 'Zulüm',
    categories: ['morality'],
  },
  {
    id: 32,
    turkish: 'İyiliğe vesile olan onu yapan gibidir.',
    source: 'Tirmizi',
    topic: 'İyilik',
    categories: ['charity', 'morality'],
  },
  {
    id: 33,
    turkish: 'Bir kötülük gördüğünüzde elinizle düzeltin. Gücünüz yetmezse dilinizle. O da olmazsa kalbinizle buğz edin.',
    source: 'Müslim',
    topic: 'Emri Bil Maruf',
    categories: ['morality'],
  },
  {
    id: 34,
    turkish: 'Sana şüphe vereni bırak, şüphe vermeyene bak.',
    source: 'Tirmizi, Nesai',
    topic: 'Şüphe',
    categories: ['morality'],
  },
  {
    id: 35,
    turkish: 'Benim için sizi en çok korktuğum şey küçük şirktir: Riya.',
    source: 'Ahmed bin Hanbel',
    topic: 'Riya',
    categories: ['morality'],
  },
  {
    id: 36,
    turkish: 'Allah tevekkül edenleri sever.',
    source: 'Ali İmran 159',
    topic: 'Tevekkül',
    categories: ['trust', 'comfort'],
  },
  {
    id: 37,
    turkish: 'Beşiğinden mezarına kadar ilim öğren.',
    source: 'Rivayet',
    topic: 'İlim',
    categories: ['knowledge'],
  },
  {
    id: 38,
    turkish: 'İslam garip başladı, garip bitecek. Gariplere müjdeler olsun.',
    source: 'Müslim',
    topic: 'Gariplik',
    categories: ['comfort'],
  },
  {
    id: 39,
    turkish: 'Kim bir ağaç dikerse, o ağaçtan yenen meyve kadar sevap kazanır.',
    source: 'Ahmed bin Hanbel',
    topic: 'Ağaç',
    categories: ['charity'],
  },
  {
    id: 40,
    turkish: 'Utanmak imandandır.',
    source: 'Buhari, Müslim',
    topic: 'Hayâ',
    categories: ['morality'],
  },
  {
    id: 41,
    turkish: 'Güçlü olan pehlivan değildir. Asıl güçlü öfke anında nefsine hakim olandır.',
    source: 'Buhari, Müslim',
    topic: 'Öfke',
    categories: ['patience', 'morality'],
  },
  {
    id: 42,
    turkish: 'Kim bir müminin dünya sıkıntılarından birini giderirse, Allah da onun kıyamet sıkıntılarından birini giderir.',
    source: 'Müslim',
    topic: 'Yardım',
    categories: ['mercy', 'charity', 'comfort'],
  },
  {
    id: 43,
    turkish: 'Allah yolunda bir gün nöbet tutmak, dünyadan ve üzerindekilerden hayırlıdır.',
    source: 'Buhari',
    topic: 'Cihat',
    categories: ['general'],
  },
  {
    id: 44,
    turkish: 'En faziletli cihad, zalim sultana karşı hakkı söylemektir.',
    source: 'Ebu Davud, Tirmizi',
    topic: 'Hak',
    categories: ['morality'],
  },
  {
    id: 45,
    turkish: 'Cennette öyle köşkler var ki dışı içinden, içi dışından görülür.',
    source: 'Tirmizi',
    topic: 'Cennet',
    categories: ['comfort'],
  },
  {
    id: 46,
    turkish: 'Oruç kalkandır.',
    source: 'Buhari, Müslim',
    topic: 'Oruç',
    categories: ['fasting'],
  },
  {
    id: 47,
    turkish: 'Namaz müminin miracıdır.',
    source: 'Rivayet',
    topic: 'Namaz',
    categories: ['prayer'],
  },
  {
    id: 48,
    turkish: 'Kul ile küfür arasında namazı terk etmek vardır.',
    source: 'Müslim',
    topic: 'Namaz',
    categories: ['prayer'],
  },
  {
    id: 49,
    turkish: 'Zekat zenginlik eksiltmez.',
    source: 'Müslim',
    topic: 'Zekat',
    categories: ['charity'],
  },
  {
    id: 50,
    turkish: 'Sadaka verirken sağ elin verdiğini sol el bilmesin.',
    source: 'Buhari, Müslim',
    topic: 'Sadaka',
    categories: ['charity'],
  },
  {
    id: 51,
    turkish: 'İnsanların en hayırlısı insanlara faydalı olandır.',
    source: 'Taberani',
    topic: 'Fayda',
    categories: ['mercy', 'charity'],
  },
  {
    id: 52,
    turkish: 'Mümin bir delikten iki kez ısırılmaz.',
    source: 'Buhari, Müslim',
    topic: 'Akıl',
    categories: ['knowledge'],
  },
  {
    id: 53,
    turkish: 'Kim yolda eziyet veren bir şey görürse kaldırsın, bu sadakadır.',
    source: 'Müslim',
    topic: 'Eziyet',
    categories: ['charity'],
  },
  {
    id: 54,
    turkish: 'Allah\'ım! Acizlikten, tembellikten, korkaklıktan ve cimrilikten sana sığınırım.',
    source: 'Buhari',
    topic: 'Dua',
    categories: ['prayer', 'comfort'],
  },
  {
    id: 55,
    turkish: 'Haset ateşin odunu yediği gibi sevapları yer.',
    source: 'Ebu Davud',
    topic: 'Haset',
    categories: ['morality'],
  },
  {
    id: 56,
    turkish: 'Dünya sevgisi her hatanın başıdır.',
    source: 'Beyhaki',
    topic: 'Dünya',
    categories: ['general'],
  },
  {
    id: 57,
    turkish: 'Allah katında en sevimli amel, az da olsa devamlı olanıdır.',
    source: 'Müslim',
    topic: 'Amel',
    categories: ['general'],
  },
  {
    id: 58,
    turkish: 'Kıyamet günü insanların bana en yakını, bana en çok salavat getirendir.',
    source: 'Tirmizi',
    topic: 'Salavat',
    categories: ['prayer'],
  },
  {
    id: 59,
    turkish: 'Kim bir Müslümanın ayıbını örterse, Allah da onun ayıbını örter.',
    source: 'Buhari, Müslim',
    topic: 'Ayıp Örtme',
    categories: ['mercy', 'morality'],
  },
  {
    id: 60,
    turkish: 'İki nimet vardır, insanların çoğu bundan gafildir: Sağlık ve boş vakit.',
    source: 'Buhari',
    topic: 'Sağlık',
    categories: ['comfort'],
  },
];

// Kategoriye göre hadis listesi getir
export function getHadisByCategory(category: HadisCategory): HadisItem[] {
  return HADISLER.filter(hadis => hadis.categories?.includes(category));
}

// Günün hadisini getir (her gün farklı)
export function getDailyHadis(category?: HadisCategory): HadisItem {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Kategori belirtilmişse o kategoriden seç
  if (category) {
    const categoryHadisler = getHadisByCategory(category);
    if (categoryHadisler.length > 0) {
      const index = dayOfYear % categoryHadisler.length;
      return categoryHadisler[index];
    }
  }

  const index = dayOfYear % HADISLER.length;
  return HADISLER[index];
}

// Belirli bir hadis getir
export function getHadisById(id: number): HadisItem | undefined {
  return HADISLER.find(hadis => hadis.id === id);
}

// Konuya göre hadis getir
export function getHadislerByTopic(topic: string): HadisItem[] {
  return HADISLER.filter(hadis => hadis.topic.toLowerCase().includes(topic.toLowerCase()));
}

// Teselli/ferahlık veren hadisler
export function getComfortingHadisler(): HadisItem[] {
  return getHadisByCategory('comfort');
}

// Ramazan için özel hadisler (oruç, sabır, dua)
export function getRamadanHadisler(): HadisItem[] {
  return HADISLER.filter(hadis =>
    hadis.categories?.some(cat => ['fasting', 'patience', 'prayer'].includes(cat))
  );
}

// Esma-ül Hüsna - Allah'ın 99 Güzel İsmi
// Kaynak: Diyanet İşleri Başkanlığı

// Kategori tipleri
export type EsmaCategory =
  | 'comfort'     // Teselli, gönül ferahlığı
  | 'mercy'       // Merhamet, rahmet
  | 'forgiveness' // Af, bağışlama
  | 'strength'    // Güç, kuvvet
  | 'provision'   // Rızık, nimet
  | 'guidance'    // Hidayet, yol gösterme
  | 'protection'  // Koruma, güvenlik
  | 'patience'    // Sabır
  | 'trust'       // Tevekkül
  | 'general';    // Genel

export interface EsmaItem {
  number: number;
  arabic: string;
  turkish: string;
  meaning: string;
  color: string;
  categories?: EsmaCategory[];
}

export const ESMA_UL_HUSNA: EsmaItem[] = [
  { number: 1, arabic: 'الله', turkish: 'Allah', meaning: 'Tek ilah, bütün isimleri kendinde toplayan', color: '#FFD700', categories: ['general'] },
  { number: 2, arabic: 'الرَّحْمَنُ', turkish: 'Er-Rahman', meaning: 'Dünyada bütün yaratıklara merhamet eden', color: '#E91E63', categories: ['mercy', 'comfort'] },
  { number: 3, arabic: 'الرَّحِيمُ', turkish: 'Er-Rahim', meaning: 'Ahirette sadece müminlere merhamet eden', color: '#E91E63', categories: ['mercy', 'comfort', 'forgiveness'] },
  { number: 4, arabic: 'الْمَلِكُ', turkish: 'El-Melik', meaning: 'Bütün kainatın sahibi, mülkün gerçek sahibi', color: '#9C27B0', categories: ['trust', 'strength'] },
  { number: 5, arabic: 'الْقُدُّوسُ', turkish: 'El-Kuddüs', meaning: 'Her türlü eksiklikten uzak, mukaddes', color: '#673AB7', categories: ['general'] },
  { number: 6, arabic: 'السَّلَامُ', turkish: 'Es-Selam', meaning: 'Her türlü tehlikelerden selamete çıkaran', color: '#3F51B5', categories: ['comfort', 'protection'] },
  { number: 7, arabic: 'الْمُؤْمِنُ', turkish: 'El-Mümin', meaning: 'Güven veren, iman nurunu kalplere yerleştiren', color: '#2196F3', categories: ['comfort', 'trust', 'protection'] },
  { number: 8, arabic: 'الْمُهَيْمِنُ', turkish: 'El-Müheymin', meaning: 'Her şeyi görüp gözeten, koruyan', color: '#03A9F4', categories: ['protection', 'trust'] },
  { number: 9, arabic: 'الْعَزِيزُ', turkish: 'El-Aziz', meaning: 'Üstün, güçlü, yenilmez', color: '#00BCD4', categories: ['strength'] },
  { number: 10, arabic: 'الْجَبَّارُ', turkish: 'El-Cebbar', meaning: 'İstediğini zorla yaptıran, dilediğini yapan', color: '#009688', categories: ['strength', 'comfort'] },
  { number: 11, arabic: 'الْمُتَكَبِّرُ', turkish: 'El-Mütekebbir', meaning: 'Büyüklükte eşi olmayan', color: '#4CAF50', categories: ['strength'] },
  { number: 12, arabic: 'الْخَالِقُ', turkish: 'El-Halik', meaning: 'Yaratan, yoktan var eden', color: '#8BC34A', categories: ['general'] },
  { number: 13, arabic: 'الْبَارِئُ', turkish: 'El-Bari', meaning: 'Her şeyi kusursuz yaratan', color: '#CDDC39', categories: ['general'] },
  { number: 14, arabic: 'الْمُصَوِّرُ', turkish: 'El-Musavvir', meaning: 'Her şeye şekil veren', color: '#FFEB3B', categories: ['general'] },
  { number: 15, arabic: 'الْغَفَّارُ', turkish: 'El-Gaffar', meaning: 'Günahları örten, çok bağışlayan', color: '#FFC107', categories: ['forgiveness', 'mercy', 'comfort'] },
  { number: 16, arabic: 'الْقَهَّارُ', turkish: 'El-Kahhar', meaning: 'Her şeye galip gelen', color: '#FF9800', categories: ['strength'] },
  { number: 17, arabic: 'الْوَهَّابُ', turkish: 'El-Vehhab', meaning: 'Karşılıksız veren, çok bağışlayan', color: '#FF5722', categories: ['provision', 'mercy'] },
  { number: 18, arabic: 'الرَّزَّاقُ', turkish: 'Er-Rezzak', meaning: 'Rızık veren, bütün canlıları rızıklandıran', color: '#795548', categories: ['provision', 'trust'] },
  { number: 19, arabic: 'الْفَتَّاحُ', turkish: 'El-Fettah', meaning: 'Her türlü zorlukları açan', color: '#607D8B', categories: ['comfort', 'guidance'] },
  { number: 20, arabic: 'اَلْعَلِيمُ', turkish: 'El-Alim', meaning: 'Her şeyi bilen', color: '#9E9E9E', categories: ['trust', 'comfort'] },
  { number: 21, arabic: 'الْقَابِضُ', turkish: 'El-Kabid', meaning: 'Ruhları kabzeden, daraltıp sıkan', color: '#E91E63', categories: ['general'] },
  { number: 22, arabic: 'الْبَاسِطُ', turkish: 'El-Basit', meaning: 'Genişleten, açan, bolluk veren', color: '#9C27B0', categories: ['provision', 'comfort'] },
  { number: 23, arabic: 'الْخَافِضُ', turkish: 'El-Hafid', meaning: 'Alçaltan, değersiz kılan', color: '#673AB7', categories: ['general'] },
  { number: 24, arabic: 'الرَّافِعُ', turkish: 'Er-Rafi', meaning: 'Yükselten, değer veren', color: '#3F51B5', categories: ['comfort', 'strength'] },
  { number: 25, arabic: 'الْمُعِزُّ', turkish: 'El-Muiz', meaning: 'İzzet veren, şereflendiren', color: '#2196F3', categories: ['comfort', 'strength'] },
  { number: 26, arabic: 'المُذِلُّ', turkish: 'El-Müzil', meaning: 'Zillete düşüren, alçaltan', color: '#03A9F4', categories: ['general'] },
  { number: 27, arabic: 'السَّمِيعُ', turkish: 'Es-Semi', meaning: 'Her şeyi işiten', color: '#00BCD4', categories: ['comfort', 'trust'] },
  { number: 28, arabic: 'الْبَصِيرُ', turkish: 'El-Basir', meaning: 'Her şeyi gören', color: '#009688', categories: ['trust'] },
  { number: 29, arabic: 'الْحَكَمُ', turkish: 'El-Hakem', meaning: 'Hüküm veren, haklıyı haksızı ayıran', color: '#4CAF50', categories: ['trust'] },
  { number: 30, arabic: 'الْعَدْلُ', turkish: 'El-Adl', meaning: 'Adaletli, asla zulmetmeyen', color: '#8BC34A', categories: ['trust', 'comfort'] },
  { number: 31, arabic: 'اللَّطِيفُ', turkish: 'El-Latif', meaning: 'Lütuf sahibi, en ince işleri bilen', color: '#CDDC39', categories: ['comfort', 'mercy'] },
  { number: 32, arabic: 'الْخَبِيرُ', turkish: 'El-Habir', meaning: 'Her şeyden haberdar olan', color: '#FFEB3B', categories: ['trust'] },
  { number: 33, arabic: 'الْحَلِيمُ', turkish: 'El-Halim', meaning: 'Ceza vermede acele etmeyen', color: '#FFC107', categories: ['patience', 'mercy', 'forgiveness'] },
  { number: 34, arabic: 'الْعَظِيمُ', turkish: 'El-Azim', meaning: 'Büyüklüğü akılla kavranamayan', color: '#FF9800', categories: ['strength'] },
  { number: 35, arabic: 'الْغَفُورُ', turkish: 'El-Gafur', meaning: 'Affı çok, bağışlaması bol', color: '#FF5722', categories: ['forgiveness', 'mercy', 'comfort'] },
  { number: 36, arabic: 'الشَّكُورُ', turkish: 'Eş-Şekür', meaning: 'Az iyiliğe çok mükafat veren', color: '#795548', categories: ['mercy', 'provision'] },
  { number: 37, arabic: 'الْعَلِيُّ', turkish: 'El-Aliyy', meaning: 'Yüceliğin sahibi, en yüce', color: '#607D8B', categories: ['strength'] },
  { number: 38, arabic: 'الْكَبِيرُ', turkish: 'El-Kebir', meaning: 'Büyük, yüce', color: '#9E9E9E', categories: ['strength'] },
  { number: 39, arabic: 'الْحَفِيظُ', turkish: 'El-Hafiz', meaning: 'Koruyucu, yapılan işleri muhafaza eden', color: '#E91E63', categories: ['protection', 'trust'] },
  { number: 40, arabic: 'المُقيِت', turkish: 'El-Mukit', meaning: 'Bedenlere ve ruhlara azık veren', color: '#9C27B0', categories: ['provision'] },
  { number: 41, arabic: 'اَلْحسِيبُ', turkish: 'El-Hasib', meaning: 'Hesap soran, herkesin hesabını bilen', color: '#673AB7', categories: ['trust'] },
  { number: 42, arabic: 'الْجَلِيلُ', turkish: 'El-Celil', meaning: 'Celal sahibi, ululuk ve büyüklük sahibi', color: '#3F51B5', categories: ['strength'] },
  { number: 43, arabic: 'الْكَرِيمُ', turkish: 'El-Kerim', meaning: 'İkram ve ihsan sahibi, cömert', color: '#2196F3', categories: ['mercy', 'provision'] },
  { number: 44, arabic: 'الرَّقِيبُ', turkish: 'Er-Rakib', meaning: 'Gözetleyici, her an kontrol eden', color: '#03A9F4', categories: ['protection', 'trust'] },
  { number: 45, arabic: 'الْمُجِيبُ', turkish: 'El-Mücib', meaning: 'Duaları kabul eden, icabet eden', color: '#00BCD4', categories: ['comfort', 'trust'] },
  { number: 46, arabic: 'الْوَاسِعُ', turkish: 'El-Vasi', meaning: 'İlmi ve rahmeti geniş olan', color: '#009688', categories: ['mercy', 'provision'] },
  { number: 47, arabic: 'الْحَكِيمُ', turkish: 'El-Hakim', meaning: 'Her işi hikmetli, yerli yerinde yapan', color: '#4CAF50', categories: ['trust', 'guidance'] },
  { number: 48, arabic: 'الْوَدُودُ', turkish: 'El-Vedüd', meaning: 'Seven ve sevilen', color: '#8BC34A', categories: ['mercy', 'comfort'] },
  { number: 49, arabic: 'الْمَجِيدُ', turkish: 'El-Mecid', meaning: 'Şanı yüce ve büyük', color: '#CDDC39', categories: ['strength'] },
  { number: 50, arabic: 'الْبَاعِثُ', turkish: 'El-Bais', meaning: 'Ölüleri dirilten', color: '#FFEB3B', categories: ['general'] },
  { number: 51, arabic: 'الشَّهِيدُ', turkish: 'Eş-Şehid', meaning: 'Her yerde hazır olan, her şeye şahit', color: '#FFC107', categories: ['trust'] },
  { number: 52, arabic: 'الْحَقُّ', turkish: 'El-Hakk', meaning: 'Varlığı gerçek olan, hak olan', color: '#FF9800', categories: ['trust', 'guidance'] },
  { number: 53, arabic: 'الْوَكِيلُ', turkish: 'El-Vekil', meaning: 'Kulların işlerini üzerine alan', color: '#FF5722', categories: ['trust', 'comfort', 'protection'] },
  { number: 54, arabic: 'الْقَوِيُّ', turkish: 'El-Kaviyy', meaning: 'Güçlü, kuvvetli', color: '#795548', categories: ['strength'] },
  { number: 55, arabic: 'الْمَتِينُ', turkish: 'El-Metin', meaning: 'Çok sağlam, güç ve kudret sahibi', color: '#607D8B', categories: ['strength', 'trust'] },
  { number: 56, arabic: 'الْوَلِيُّ', turkish: 'El-Veliyy', meaning: 'Müminlerin dostu, yardımcısı', color: '#9E9E9E', categories: ['comfort', 'protection'] },
  { number: 57, arabic: 'الْحَمِيدُ', turkish: 'El-Hamid', meaning: 'Övülmeye layık, her türlü hamde layık', color: '#E91E63', categories: ['general'] },
  { number: 58, arabic: 'الْمُحْصِي', turkish: 'El-Muhsi', meaning: 'Her şeyi tek tek sayan', color: '#9C27B0', categories: ['general'] },
  { number: 59, arabic: 'الْمُبْدِئُ', turkish: 'El-Mübdi', meaning: 'İlk defa yaratan', color: '#673AB7', categories: ['general'] },
  { number: 60, arabic: 'الْمُعِيدُ', turkish: 'El-Muid', meaning: 'Öldükten sonra tekrar yaratan', color: '#3F51B5', categories: ['general'] },
  { number: 61, arabic: 'الْمُحْيِي', turkish: 'El-Muhyi', meaning: 'Dirilten, hayat veren', color: '#2196F3', categories: ['comfort'] },
  { number: 62, arabic: 'اَلْمُمِيتُ', turkish: 'El-Mümit', meaning: 'Öldüren, eceli gelince canlıların ruhunu alan', color: '#03A9F4', categories: ['general'] },
  { number: 63, arabic: 'الْحَيُّ', turkish: 'El-Hayy', meaning: 'Diri, ölümsüz hayat sahibi', color: '#00BCD4', categories: ['strength'] },
  { number: 64, arabic: 'الْقَيُّومُ', turkish: 'El-Kayyum', meaning: 'Her şeyi ayakta tutan, yöneten', color: '#009688', categories: ['trust', 'strength'] },
  { number: 65, arabic: 'الْوَاجِدُ', turkish: 'El-Vacid', meaning: 'Dilediğini bulan, zengin', color: '#4CAF50', categories: ['provision'] },
  { number: 66, arabic: 'الْمَاجِدُ', turkish: 'El-Macid', meaning: 'Şanı, kadri büyük', color: '#8BC34A', categories: ['strength'] },
  { number: 67, arabic: 'الْواحِدُ', turkish: 'El-Vahid', meaning: 'Tek, zatında ortağı olmayan', color: '#CDDC39', categories: ['trust'] },
  { number: 68, arabic: 'اَلصَّمَدُ', turkish: 'Es-Samed', meaning: 'Hiçbir şeye muhtaç olmayan', color: '#FFEB3B', categories: ['strength', 'trust'] },
  { number: 69, arabic: 'الْقَادِرُ', turkish: 'El-Kadir', meaning: 'Her şeye gücü yeten', color: '#FFC107', categories: ['strength'] },
  { number: 70, arabic: 'الْمُقْتَدِرُ', turkish: 'El-Muktedir', meaning: 'Kudret sahibi, gücü sınırsız', color: '#FF9800', categories: ['strength'] },
  { number: 71, arabic: 'الْمُقَدِّمُ', turkish: 'El-Mukaddim', meaning: 'Öne geçiren, ileri alan', color: '#FF5722', categories: ['general'] },
  { number: 72, arabic: 'الْمُؤَخِّرُ', turkish: 'El-Muahhir', meaning: 'Geri bırakan, tehir eden', color: '#795548', categories: ['general'] },
  { number: 73, arabic: 'الأوَّلُ', turkish: 'El-Evvel', meaning: 'Varlığının başlangıcı olmayan', color: '#607D8B', categories: ['trust'] },
  { number: 74, arabic: 'الآخِرُ', turkish: 'El-Ahir', meaning: 'Varlığının sonu olmayan', color: '#9E9E9E', categories: ['trust'] },
  { number: 75, arabic: 'الظَّاهِرُ', turkish: 'Ez-Zahir', meaning: 'Varlığı her şeyle açık', color: '#E91E63', categories: ['general'] },
  { number: 76, arabic: 'الْبَاطِنُ', turkish: 'El-Batın', meaning: 'Görünmeyen, gizli', color: '#9C27B0', categories: ['general'] },
  { number: 77, arabic: 'الْوَالِي', turkish: 'El-Vali', meaning: 'Her şeyi idare eden', color: '#673AB7', categories: ['trust'] },
  { number: 78, arabic: 'الْمُتَعَالِي', turkish: 'El-Müteali', meaning: 'İzzet ve şeref bakımından en yüce', color: '#3F51B5', categories: ['strength'] },
  { number: 79, arabic: 'الْبَرُّ', turkish: 'El-Berr', meaning: 'İyilik ve ihsanı bol', color: '#2196F3', categories: ['mercy', 'provision'] },
  { number: 80, arabic: 'التَّوَّابُ', turkish: 'Et-Tevvab', meaning: 'Tövbeleri kabul eden', color: '#03A9F4', categories: ['forgiveness', 'mercy', 'comfort'] },
  { number: 81, arabic: 'الْمُنْتَقِمُ', turkish: 'El-Müntekim', meaning: 'Suçluları cezalandıran', color: '#00BCD4', categories: ['general'] },
  { number: 82, arabic: 'العَفُوُّ', turkish: 'El-Afüvv', meaning: 'Affeden, günahları silen', color: '#009688', categories: ['forgiveness', 'mercy', 'comfort'] },
  { number: 83, arabic: 'الرَّؤُوفُ', turkish: 'Er-Raüf', meaning: 'Çok şefkatli, merhametli', color: '#4CAF50', categories: ['mercy', 'comfort'] },
  { number: 84, arabic: 'مَالِكُ الْمُلْكِ', turkish: 'Malikül Mülk', meaning: 'Mülkün sahibi', color: '#8BC34A', categories: ['strength', 'trust'] },
  { number: 85, arabic: 'ذُوالْجَلاَلِ وَالإكْرَامِ', turkish: 'Zül-Celali vel-İkram', meaning: 'Celal ve ikram sahibi', color: '#CDDC39', categories: ['strength', 'mercy'] },
  { number: 86, arabic: 'الْمُقْسِطُ', turkish: 'El-Muksit', meaning: 'Adaletli, hakkaniyetle hükmeden', color: '#FFEB3B', categories: ['trust'] },
  { number: 87, arabic: 'الْجَامِعُ', turkish: 'El-Cami', meaning: 'Toplayan, bir araya getiren', color: '#FFC107', categories: ['general'] },
  { number: 88, arabic: 'الْغَنِيُّ', turkish: 'El-Ganiyy', meaning: 'Zengin, hiçbir şeye muhtaç olmayan', color: '#FF9800', categories: ['provision', 'strength'] },
  { number: 89, arabic: 'الْمُغْنِي', turkish: 'El-Muğni', meaning: 'Zengin eden, ihtiyaçları gideren', color: '#FF5722', categories: ['provision', 'comfort'] },
  { number: 90, arabic: 'اَلْمَانِعُ', turkish: 'El-Mani', meaning: 'Dilemediği şeyi engelleyen', color: '#795548', categories: ['protection'] },
  { number: 91, arabic: 'الضَّارَّ', turkish: 'Ed-Darr', meaning: 'Zarar veren, elem verici şeyleri yaratan', color: '#607D8B', categories: ['general'] },
  { number: 92, arabic: 'النَّافِعُ', turkish: 'En-Nafi', meaning: 'Fayda veren', color: '#9E9E9E', categories: ['provision', 'comfort'] },
  { number: 93, arabic: 'النُّورُ', turkish: 'En-Nur', meaning: 'Nur, alemleri nurlandıran', color: '#E91E63', categories: ['guidance', 'comfort'] },
  { number: 94, arabic: 'الْهَادِي', turkish: 'El-Hadi', meaning: 'Hidayete erdiren, yol gösteren', color: '#9C27B0', categories: ['guidance'] },
  { number: 95, arabic: 'الْبَدِيعُ', turkish: 'El-Bedi', meaning: 'Eşsiz yaratan, örneği olmayan', color: '#673AB7', categories: ['general'] },
  { number: 96, arabic: 'اَلْبَاقِي', turkish: 'El-Baki', meaning: 'Varlığı ebedi, sonsuz', color: '#3F51B5', categories: ['trust', 'strength'] },
  { number: 97, arabic: 'الْوَارِثُ', turkish: 'El-Varis', meaning: 'Her şeyin asıl sahibi', color: '#2196F3', categories: ['trust'] },
  { number: 98, arabic: 'الرَّشِيدُ', turkish: 'Er-Reşid', meaning: 'Doğru yolu gösteren', color: '#03A9F4', categories: ['guidance'] },
  { number: 99, arabic: 'الصَّبُورُ', turkish: 'Es-Sabur', meaning: 'Çok sabırlı', color: '#00BCD4', categories: ['patience', 'comfort'] },
];

// Kategoriye göre esma listesi getir
export function getEsmaByCategory(category: EsmaCategory): EsmaItem[] {
  return ESMA_UL_HUSNA.filter(esma => esma.categories?.includes(category));
}

// Günün esmasını getir (her gün farklı bir esma)
export function getDailyEsma(category?: EsmaCategory): EsmaItem {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Kategori belirtilmişse o kategoriden seç
  if (category) {
    const categoryEsmas = getEsmaByCategory(category);
    if (categoryEsmas.length > 0) {
      const index = dayOfYear % categoryEsmas.length;
      return categoryEsmas[index];
    }
  }

  // 99 ismi döngüsel olarak kullan
  const index = dayOfYear % ESMA_UL_HUSNA.length;
  return ESMA_UL_HUSNA[index];
}

// Belirli bir esma getir
export function getEsmaByNumber(number: number): EsmaItem | undefined {
  return ESMA_UL_HUSNA.find(esma => esma.number === number);
}

// Teselli/ferahlık veren esmalar
export function getComfortingEsmas(): EsmaItem[] {
  return getEsmaByCategory('comfort');
}

// Ramazan için özel esmalar (rahmet, af, sabır)
export function getRamadanEsmas(): EsmaItem[] {
  return ESMA_UL_HUSNA.filter(esma =>
    esma.categories?.some(cat => ['mercy', 'forgiveness', 'patience'].includes(cat))
  );
}

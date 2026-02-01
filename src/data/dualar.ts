export interface Dua {
  id: string;
  isim: string;
  arapca: string;
  okunusu: string;
  anlami: string;
  kaynak?: string;
  kategori: 'sabah' | 'aksam' | 'namaz' | 'yemek' | 'genel' | 'koruma';
}

export const dualar: Dua[] = [
  // Sabah Akşam Duaları
  {
    id: '1',
    isim: 'Sabah Duası',
    arapca: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    okunusu: 'Asbahnâ ve asbahal mulku lillâh, vel hamdu lillâh',
    anlami: 'Sabaha erdik, mülk de Allah\'a ait olarak sabaha erdi. Hamd Allah\'a mahsustur.',
    kategori: 'sabah',
  },
  {
    id: '2',
    isim: 'Akşam Duası',
    arapca: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    okunusu: 'Emseynâ ve emsel mulku lillâh, vel hamdu lillâh',
    anlami: 'Akşama erdik, mülk de Allah\'a ait olarak akşama erdi. Hamd Allah\'a mahsustur.',
    kategori: 'aksam',
  },

  // Koruma Duaları
  {
    id: '3',
    isim: 'Ayetel Kürsi',
    arapca: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    okunusu: 'Allahu lâ ilâhe illâ huvel hayyul kayyûm',
    anlami: 'Allah, O\'ndan başka ilah yoktur. O, daima diri ve her şeyi ayakta tutandır.',
    kaynak: 'Bakara 255',
    kategori: 'koruma',
  },
  {
    id: '4',
    isim: 'Felak Suresi',
    arapca: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    okunusu: 'Kul eûzu bi rabbil felak',
    anlami: 'De ki: Sabahın Rabbine sığınırım.',
    kaynak: 'Felak 1',
    kategori: 'koruma',
  },
  {
    id: '5',
    isim: 'Nas Suresi',
    arapca: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    okunusu: 'Kul eûzu bi rabbin nâs',
    anlami: 'De ki: İnsanların Rabbine sığınırım.',
    kaynak: 'Nas 1',
    kategori: 'koruma',
  },

  // Yemek Duaları
  {
    id: '6',
    isim: 'Yemek Başı Duası',
    arapca: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    okunusu: 'Bismillâhi ve alâ berekâtillâh',
    anlami: 'Allah\'ın adıyla ve Allah\'ın bereketine güvenerek.',
    kategori: 'yemek',
  },
  {
    id: '7',
    isim: 'Yemek Sonu Duası',
    arapca: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    okunusu: 'Elhamdu lillâhillezî at\'amenâ ve sekânâ ve ce\'alenâ muslimîn',
    anlami: 'Bizi yediren, içiren ve Müslümanlardan kılan Allah\'a hamd olsun.',
    kategori: 'yemek',
  },

  // Genel Dualar
  {
    id: '8',
    isim: 'İstiğfar',
    arapca: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ',
    okunusu: 'Estağfirullâhel azîm',
    anlami: 'Yüce Allah\'tan bağışlanma dilerim.',
    kategori: 'genel',
  },
  {
    id: '9',
    isim: 'Salavat',
    arapca: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    okunusu: 'Allâhumme salli alâ Muhammedin ve alâ âli Muhammed',
    anlami: 'Allah\'ım! Muhammed\'e ve Muhammed\'in ailesine rahmet et.',
    kategori: 'genel',
  },
  {
    id: '10',
    isim: 'Kelime-i Tevhid',
    arapca: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    okunusu: 'Lâ ilâhe illallah Muhammedun Rasûlullah',
    anlami: 'Allah\'tan başka ilah yoktur, Muhammed Allah\'ın Resulüdür.',
    kategori: 'genel',
  },
  {
    id: '11',
    isim: 'Sübhanallah',
    arapca: 'سُبْحَانَ اللَّهِ',
    okunusu: 'Subhânallah',
    anlami: 'Allah\'ı tüm eksikliklerden tenzih ederim.',
    kategori: 'genel',
  },
  {
    id: '12',
    isim: 'Elhamdülillah',
    arapca: 'الْحَمْدُ لِلَّهِ',
    okunusu: 'Elhamdulillâh',
    anlami: 'Hamd Allah\'a mahsustur.',
    kategori: 'genel',
  },
  {
    id: '13',
    isim: 'Allahu Ekber',
    arapca: 'اللَّهُ أَكْبَرُ',
    okunusu: 'Allâhu Ekber',
    anlami: 'Allah en büyüktür.',
    kategori: 'genel',
  },

  // Namaz Duaları
  {
    id: '14',
    isim: 'Sübhaneke',
    arapca: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
    okunusu: 'Sübhânekallâhumme ve bi hamdik ve tebârekesmuk ve teâlâ cedduk ve lâ ilâhe gayruk',
    anlami: 'Allah\'ım! Seni hamdinle tesbih ederim. İsmin mübarektir. Şanın yücedir. Senden başka ilah yoktur.',
    kategori: 'namaz',
  },
  {
    id: '15',
    isim: 'Ettehiyyatü',
    arapca: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
    okunusu: 'Ettehiyyâtu lillâhi vessalevâtu vettayyibât',
    anlami: 'Bütün tahiyyeler, salatlar ve güzel övgüler Allah\'a mahsustur.',
    kategori: 'namaz',
  },
  {
    id: '16',
    isim: 'Rabbena Duası',
    arapca: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    okunusu: 'Rabbenâ âtinâ fid dunyâ haseneten ve fil âhireti haseneten ve kınâ azâben nâr',
    anlami: 'Rabbimiz! Bize dünyada iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.',
    kaynak: 'Bakara 201',
    kategori: 'namaz',
  },
];

// Kategorilere göre duaları getir
export function getDualarByKategori(kategori: Dua['kategori']): Dua[] {
  return dualar.filter((dua) => dua.kategori === kategori);
}

// Rastgele dua getir
export function getRandomDua(): Dua {
  const randomIndex = Math.floor(Math.random() * dualar.length);
  return dualar[randomIndex];
}

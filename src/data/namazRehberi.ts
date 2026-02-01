export interface NamazAdim {
  id: number;
  baslik: string;
  aciklama: string;
  arapca?: string;
  okunusu?: string;
}

export interface NamazBolumu {
  id: string;
  tur: 'sunnet' | 'farz' | 'vitir';
  isim: string;
  rekat: number;
  aciklama: string;
  adimlar: NamazAdim[];
}

export interface NamazVakti {
  id: string;
  isim: string;
  icon: string;
  renk: string;
  toplamRekat: number;
  bolumler: NamazBolumu[];
}

// Abdest alma adımları
export const abdestAdimlari: NamazAdim[] = [
  {
    id: 1,
    baslik: 'Niyet',
    aciklama: 'Abdest almaya niyet edilir. "Niyet ettim Allah rızası için abdest almaya" denir.',
  },
  {
    id: 2,
    baslik: 'Besmele',
    aciklama: 'Besmele çekilir.',
    arapca: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    okunusu: 'Bismillahirrahmanirrahim',
  },
  {
    id: 3,
    baslik: 'Elleri Yıkama',
    aciklama: 'Eller bileklere kadar üç kez yıkanır. Parmak araları hilallenir.',
  },
  {
    id: 4,
    baslik: 'Ağza Su Verme',
    aciklama: 'Sağ el ile ağza üç kez su verilir ve çalkalanır.',
  },
  {
    id: 5,
    baslik: 'Burna Su Verme',
    aciklama: 'Sağ el ile burna üç kez su verilir, sol el ile sümkürülür.',
  },
  {
    id: 6,
    baslik: 'Yüzü Yıkama',
    aciklama: 'Yüz, alından çene altına ve kulaktan kulağa kadar üç kez yıkanır.',
  },
  {
    id: 7,
    baslik: 'Kolları Yıkama',
    aciklama: 'Önce sağ kol, sonra sol kol dirseklerle birlikte üç kez yıkanır.',
  },
  {
    id: 8,
    baslik: 'Başı Meshetme',
    aciklama: 'Islak ellerle başın tamamı bir kez mesh edilir.',
  },
  {
    id: 9,
    baslik: 'Kulakları Meshetme',
    aciklama: 'İşaret parmakları ile kulak içleri, başparmaklar ile kulak arkası mesh edilir.',
  },
  {
    id: 10,
    baslik: 'Boynu Meshetme',
    aciklama: 'Ellerin dış kısmı ile boyun mesh edilir.',
  },
  {
    id: 11,
    baslik: 'Ayakları Yıkama',
    aciklama: 'Önce sağ ayak, sonra sol ayak topuklarla birlikte üç kez yıkanır. Parmak araları hilallenir.',
  },
  {
    id: 12,
    baslik: 'Dua',
    aciklama: 'Abdest duası okunur.',
    arapca: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    okunusu: 'Eşhedü en lâ ilâhe illallah ve eşhedü enne Muhammeden abdühû ve rasûlüh',
  },
];

// 2 Rekatlık namaz adımları (Sabah sünneti, Sabah farzı, Akşam sünneti vb.)
const ikiRekatAdimlar: NamazAdim[] = [
  {
    id: 1,
    baslik: 'Niyet ve İftitah Tekbiri',
    aciklama: 'Kıbleye dönülür, niyet edilir. Eller kulaklara kaldırılarak "Allahu Ekber" denir ve eller göbek altında bağlanır.',
    arapca: 'اللَّهُ أَكْبَرُ',
    okunusu: 'Allahu Ekber',
  },
  {
    id: 2,
    baslik: 'Sübhaneke',
    aciklama: 'Sübhaneke duası okunur.',
    arapca: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
    okunusu: 'Sübhânekallâhümme ve bi hamdike ve tebârekesmüke ve teâlâ ceddüke ve lâ ilâhe ğayruk',
  },
  {
    id: 3,
    baslik: 'Eûzü Besmele',
    aciklama: 'Eûzü ve Besmele çekilir.',
    arapca: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    okunusu: 'Eûzü billâhi mineşşeytânirracîm Bismillâhirrahmânirrahîm',
  },
  {
    id: 4,
    baslik: 'Fatiha Suresi',
    aciklama: 'Fatiha suresi okunur, sonunda "Amin" denir.',
    arapca: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَم۪ينَۙ اَلرَّحْمٰنِ الرَّح۪يمِۙ مَالِكِ يَوْمِ الدّ۪ينِۜ اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَع۪ينُۜ اِهْدِنَا الصِّرَاطَ الْمُسْتَق۪يمَۙ صِرَاطَ الَّذ۪ينَ اَنْعَمْتَ عَلَيْهِمْۙ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّٓالّ۪ينَ',
    okunusu: 'Elhamdü lillâhi rabbil âlemîn. Errahmânir rahîm. Mâliki yevmid dîn. İyyâke na\'büdü ve iyyâke nestaîn. İhdinas sırâtal müstakîm. Sırâtallezîne en\'amte aleyhim ğayril mağdûbi aleyhim ve led dâllîn. (Âmin)',
  },
  {
    id: 5,
    baslik: 'Zamm-ı Sure',
    aciklama: 'Fatiha\'dan sonra kısa bir sure okunur. (Örn: Kevser Suresi)',
    arapca: 'اِنَّٓا اَعْطَيْنَاكَ الْكَوْثَرَۜ فَصَلِّ لِرَبِّكَ وَانْحَرْۜ اِنَّ شَانِئَكَ هُوَ الْاَبْتَرُ',
    okunusu: 'İnnâ a\'taynâkel kevser. Fesalli li rabbike venhar. İnne şânieke hüvel ebter.',
  },
  {
    id: 6,
    baslik: 'Rükû',
    aciklama: '"Allahu Ekber" diyerek rükûya eğilinir. Eller dizlere konur, sırt düz tutulur. 3 kez tesbih okunur.',
    arapca: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    okunusu: 'Sübhâne rabbiyel azîm (3 kez)',
  },
  {
    id: 7,
    baslik: 'Rükûdan Kalkış',
    aciklama: '"Semiallâhü limen hamideh" diyerek doğrulunur, "Rabbenâ lekel hamd" denir.',
    arapca: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا لَكَ الْحَمْدُ',
    okunusu: 'Semiallâhü limen hamideh - Rabbenâ lekel hamd',
  },
  {
    id: 8,
    baslik: 'Birinci Secde',
    aciklama: '"Allahu Ekber" diyerek secdeye gidilir. Eller yere, alın iki el arasına konur. 3 kez tesbih okunur.',
    arapca: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    okunusu: 'Sübhâne rabbiyel a\'lâ (3 kez)',
  },
  {
    id: 9,
    baslik: 'İki Secde Arası',
    aciklama: '"Allahu Ekber" diyerek oturulur, kısa bir süre beklenir.',
  },
  {
    id: 10,
    baslik: 'İkinci Secde',
    aciklama: '"Allahu Ekber" diyerek tekrar secdeye gidilir. 3 kez tesbih okunur.',
    arapca: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    okunusu: 'Sübhâne rabbiyel a\'lâ (3 kez)',
  },
  {
    id: 11,
    baslik: 'İkinci Rekata Kalkış',
    aciklama: '"Allahu Ekber" diyerek ayağa kalkılır. İkinci rekat başlar.',
  },
  {
    id: 12,
    baslik: 'İkinci Rekatta Kıraat',
    aciklama: 'Besmele ile Fatiha ve bir sure okunur. Eûzü çekilmez.',
  },
  {
    id: 13,
    baslik: 'İkinci Rekatta Rükû ve Secdeler',
    aciklama: 'Birinci rekattaki gibi rükû ve iki secde yapılır.',
  },
  {
    id: 14,
    baslik: 'Ka\'de (Son Oturuş)',
    aciklama: 'İkinci secdeden sonra oturulur. Ettehiyyatü, Salli-Barik ve Rabbena duaları okunur.',
    arapca: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ اَلسَّلَامُ عَلَيْكَ اَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ اَلسَّلَامُ عَلَيْنَا وَعَلٰى عِبَادِ اللّٰهِ الصَّالِح۪ينَ اَشْهَدُ اَنْ لَٓا اِلٰهَ اِلَّا اللّٰهُ وَاَشْهَدُ اَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    okunusu: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât. Esselâmü aleyke eyyühen nebiyyü ve rahmetullâhi ve berekâtüh. Esselâmü aleynâ ve alâ ibâdillâhis sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve resûlüh.',
  },
  {
    id: 15,
    baslik: 'Selam',
    aciklama: 'Önce sağa, sonra sola "Esselâmü aleyküm ve rahmetullah" diyerek selam verilir.',
    arapca: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    okunusu: 'Esselâmü aleyküm ve rahmetullâh',
  },
];

// 3 Rekatlık namaz adımları (Akşam farzı, Vitir)
const ucRekatAdimlar: NamazAdim[] = [
  {
    id: 1,
    baslik: 'Niyet ve İftitah Tekbiri',
    aciklama: 'Kıbleye dönülür, niyet edilir. Eller kulaklara kaldırılarak "Allahu Ekber" denir.',
    arapca: 'اللَّهُ أَكْبَرُ',
    okunusu: 'Allahu Ekber',
  },
  {
    id: 2,
    baslik: 'Birinci Rekat',
    aciklama: 'Sübhaneke, Eûzü-Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 3,
    baslik: 'İkinci Rekat',
    aciklama: 'Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 4,
    baslik: 'İlk Oturuş (Ka\'de-i Ûlâ)',
    aciklama: 'İkinci rekattan sonra oturulur, sadece Ettehiyyatü okunur.',
    arapca: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...',
    okunusu: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât...',
  },
  {
    id: 5,
    baslik: 'Üçüncü Rekata Kalkış',
    aciklama: '"Allahu Ekber" diyerek üçüncü rekata kalkılır.',
  },
  {
    id: 6,
    baslik: 'Üçüncü Rekat (Farz için)',
    aciklama: 'Sadece Besmele ve Fatiha okunur. Sure okunmaz. Rükû ve iki secde yapılır.',
  },
  {
    id: 7,
    baslik: 'Son Oturuş (Ka\'de-i Ahîre)',
    aciklama: 'Ettehiyyatü, Salli-Barik ve Rabbena duaları okunur.',
  },
  {
    id: 8,
    baslik: 'Selam',
    aciklama: 'Önce sağa, sonra sola selam verilir.',
    arapca: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    okunusu: 'Esselâmü aleyküm ve rahmetullâh',
  },
];

// 4 Rekatlık namaz adımları (Öğle, İkindi, Yatsı farzları vb.)
const dortRekatAdimlar: NamazAdim[] = [
  {
    id: 1,
    baslik: 'Niyet ve İftitah Tekbiri',
    aciklama: 'Kıbleye dönülür, niyet edilir. "Allahu Ekber" diyerek namaza başlanır.',
    arapca: 'اللَّهُ أَكْبَرُ',
    okunusu: 'Allahu Ekber',
  },
  {
    id: 2,
    baslik: 'Birinci Rekat',
    aciklama: 'Sübhaneke, Eûzü-Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 3,
    baslik: 'İkinci Rekat',
    aciklama: 'Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 4,
    baslik: 'İlk Oturuş (Ka\'de-i Ûlâ)',
    aciklama: 'İkinci rekattan sonra oturulur, sadece Ettehiyyatü okunur.',
    arapca: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...',
    okunusu: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât...',
  },
  {
    id: 5,
    baslik: 'Üçüncü Rekata Kalkış',
    aciklama: '"Allahu Ekber" diyerek ayağa kalkılır.',
  },
  {
    id: 6,
    baslik: 'Üçüncü Rekat (Farz için)',
    aciklama: 'Farz namazda sadece Besmele ve Fatiha okunur. Sünnet namazda sure de eklenir. Rükû ve iki secde yapılır.',
  },
  {
    id: 7,
    baslik: 'Dördüncü Rekat',
    aciklama: 'Üçüncü rekat gibi kılınır. Rükû ve iki secde yapılır.',
  },
  {
    id: 8,
    baslik: 'Son Oturuş (Ka\'de-i Ahîre)',
    aciklama: 'Ettehiyyatü, Salli-Barik ve Rabbena duaları okunur.',
    arapca: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلٰى اِبْرٰه۪يمَ وَعَلٰى اٰلِ اِبْرٰه۪يمَ اِنَّكَ حَم۪يدٌ مَج۪يدٌ',
    okunusu: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
  },
  {
    id: 9,
    baslik: 'Selam',
    aciklama: 'Önce sağa, sonra sola selam verilir.',
    arapca: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    okunusu: 'Esselâmü aleyküm ve rahmetullâh',
  },
];

// Vitir namazı adımları
const vitirAdimlar: NamazAdim[] = [
  {
    id: 1,
    baslik: 'Niyet ve İftitah Tekbiri',
    aciklama: 'Vitir namazına niyet edilir. "Allahu Ekber" diyerek namaza başlanır.',
  },
  {
    id: 2,
    baslik: 'Birinci Rekat',
    aciklama: 'Sübhaneke, Eûzü-Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 3,
    baslik: 'İkinci Rekat',
    aciklama: 'Besmele, Fatiha ve sure okunur. Rükû ve iki secde yapılır.',
  },
  {
    id: 4,
    baslik: 'İlk Oturuş',
    aciklama: 'Sadece Ettehiyyatü okunur.',
  },
  {
    id: 5,
    baslik: 'Üçüncü Rekata Kalkış',
    aciklama: '"Allahu Ekber" diyerek ayağa kalkılır.',
  },
  {
    id: 6,
    baslik: 'Üçüncü Rekatta Kıraat',
    aciklama: 'Besmele, Fatiha ve sure okunur.',
  },
  {
    id: 7,
    baslik: 'Kunut Tekbiri',
    aciklama: 'Sure bittikten sonra eller kulak hizasına kaldırılır, "Allahu Ekber" denir ve eller bağlanır.',
    arapca: 'اللَّهُ أَكْبَرُ',
    okunusu: 'Allahu Ekber',
  },
  {
    id: 8,
    baslik: 'Kunut Duaları',
    aciklama: 'Kunut duaları okunur: Önce "Allahümme innâ nestaînüke..." sonra "Allahümme iyyâke na\'büdü..." okunur.',
    arapca: 'اَللّٰهُمَّ اِنَّا نَسْتَع۪ينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْد۪يكَ وَنُؤْمِنُ بِكَ وَنَتُوبُ اِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْن۪ي عَلَيْكَ الْخَيْرَ كُلَّهُ نَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ',
    okunusu: 'Allahümme innâ nestaînüke ve nestağfiruke ve nestehdîke ve nü\'minü bike ve netûbü ileyke ve netevekkülü aleyke ve nüsnî aleykel hayra küllehû neşküruke ve lâ nekfüruke ve nahleu ve netrukü men yefcüruk.',
  },
  {
    id: 9,
    baslik: 'Rükû ve Secdeler',
    aciklama: 'Normal şekilde rükû ve iki secde yapılır.',
  },
  {
    id: 10,
    baslik: 'Son Oturuş',
    aciklama: 'Ettehiyyatü, Salli-Barik ve Rabbena duaları okunur.',
  },
  {
    id: 11,
    baslik: 'Selam',
    aciklama: 'Sağa ve sola selam verilir.',
  },
];

// Namaz Vakitleri
export const namazVakitleri: NamazVakti[] = [
  {
    id: 'sabah',
    isim: 'Sabah Namazı',
    icon: 'weather-sunset-up',
    renk: '#FF9800',
    toplamRekat: 4,
    bolumler: [
      {
        id: 'sabah-sunnet',
        tur: 'sunnet',
        isim: 'Sabah Sünneti',
        rekat: 2,
        aciklama: 'Sabah namazının sünneti 2 rekattır ve farzdan önce kılınır. Bu sünnet çok kuvvetlidir.',
        adimlar: ikiRekatAdimlar,
      },
      {
        id: 'sabah-farz',
        tur: 'farz',
        isim: 'Sabah Farzı',
        rekat: 2,
        aciklama: 'Sabah namazının farzı 2 rekattır.',
        adimlar: ikiRekatAdimlar,
      },
    ],
  },
  {
    id: 'ogle',
    isim: 'Öğle Namazı',
    icon: 'weather-sunny',
    renk: '#FFC107',
    toplamRekat: 10,
    bolumler: [
      {
        id: 'ogle-ilk-sunnet',
        tur: 'sunnet',
        isim: 'İlk Sünnet',
        rekat: 4,
        aciklama: 'Öğle namazının ilk sünneti 4 rekattır ve farzdan önce kılınır.',
        adimlar: dortRekatAdimlar,
      },
      {
        id: 'ogle-farz',
        tur: 'farz',
        isim: 'Öğle Farzı',
        rekat: 4,
        aciklama: 'Öğle namazının farzı 4 rekattır.',
        adimlar: dortRekatAdimlar,
      },
      {
        id: 'ogle-son-sunnet',
        tur: 'sunnet',
        isim: 'Son Sünnet',
        rekat: 2,
        aciklama: 'Öğle namazının son sünneti 2 rekattır ve farzdan sonra kılınır.',
        adimlar: ikiRekatAdimlar,
      },
    ],
  },
  {
    id: 'ikindi',
    isim: 'İkindi Namazı',
    icon: 'weather-partly-cloudy',
    renk: '#FF5722',
    toplamRekat: 8,
    bolumler: [
      {
        id: 'ikindi-sunnet',
        tur: 'sunnet',
        isim: 'İkindi Sünneti',
        rekat: 4,
        aciklama: 'İkindi namazının sünneti 4 rekattır ve farzdan önce kılınır. Bu sünnet gayr-i müekkede (kuvvetli olmayan) sünnettir.',
        adimlar: dortRekatAdimlar,
      },
      {
        id: 'ikindi-farz',
        tur: 'farz',
        isim: 'İkindi Farzı',
        rekat: 4,
        aciklama: 'İkindi namazının farzı 4 rekattır.',
        adimlar: dortRekatAdimlar,
      },
    ],
  },
  {
    id: 'aksam',
    isim: 'Akşam Namazı',
    icon: 'weather-sunset-down',
    renk: '#E91E63',
    toplamRekat: 5,
    bolumler: [
      {
        id: 'aksam-farz',
        tur: 'farz',
        isim: 'Akşam Farzı',
        rekat: 3,
        aciklama: 'Akşam namazının farzı 3 rekattır ve önce kılınır.',
        adimlar: ucRekatAdimlar,
      },
      {
        id: 'aksam-sunnet',
        tur: 'sunnet',
        isim: 'Akşam Sünneti',
        rekat: 2,
        aciklama: 'Akşam namazının sünneti 2 rekattır ve farzdan sonra kılınır.',
        adimlar: ikiRekatAdimlar,
      },
    ],
  },
  {
    id: 'yatsi',
    isim: 'Yatsı Namazı',
    icon: 'weather-night',
    renk: '#673AB7',
    toplamRekat: 13,
    bolumler: [
      {
        id: 'yatsi-ilk-sunnet',
        tur: 'sunnet',
        isim: 'İlk Sünnet',
        rekat: 4,
        aciklama: 'Yatsı namazının ilk sünneti 4 rekattır ve farzdan önce kılınır. Bu sünnet gayr-i müekkede sünnettir.',
        adimlar: dortRekatAdimlar,
      },
      {
        id: 'yatsi-farz',
        tur: 'farz',
        isim: 'Yatsı Farzı',
        rekat: 4,
        aciklama: 'Yatsı namazının farzı 4 rekattır.',
        adimlar: dortRekatAdimlar,
      },
      {
        id: 'yatsi-son-sunnet',
        tur: 'sunnet',
        isim: 'Son Sünnet',
        rekat: 2,
        aciklama: 'Yatsı namazının son sünneti 2 rekattır ve farzdan sonra kılınır.',
        adimlar: ikiRekatAdimlar,
      },
      {
        id: 'yatsi-vitir',
        tur: 'vitir',
        isim: 'Vitir Namazı',
        rekat: 3,
        aciklama: 'Vitir namazı 3 rekattır ve yatsı namazının ardından kılınır. Vaciptir.',
        adimlar: vitirAdimlar,
      },
    ],
  },
];

// Eski yapıyla uyumluluk için
export const namazAdimlari = ikiRekatAdimlar;
export const namazTurleri = namazVakitleri.map(vakit => ({
  id: vakit.id,
  isim: vakit.isim,
  rekatSayisi: vakit.toplamRekat,
  aciklama: vakit.bolumler.map(b => `${b.rekat} rekat ${b.isim.toLowerCase()}`).join(' + '),
  adimlar: namazAdimlari,
}));

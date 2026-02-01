export interface District {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export interface Country {
  id: string;
  name: string;
  cities: City[];
}

export const turkeyLocations: Country = {
  id: 'TR',
  name: 'Türkiye',
  cities: [
    {
      id: '01',
      name: 'Adana',
      districts: [
        { id: '0101', name: 'Seyhan', latitude: 36.9914, longitude: 35.3308 },
        { id: '0102', name: 'Yüreğir', latitude: 37.0167, longitude: 35.4167 },
        { id: '0103', name: 'Çukurova', latitude: 37.0333, longitude: 35.3667 },
        { id: '0104', name: 'Sarıçam', latitude: 37.0667, longitude: 35.4833 },
      ],
    },
    {
      id: '06',
      name: 'Ankara',
      districts: [
        { id: '0601', name: 'Çankaya', latitude: 39.9000, longitude: 32.8597 },
        { id: '0602', name: 'Keçiören', latitude: 39.9833, longitude: 32.8667 },
        { id: '0603', name: 'Mamak', latitude: 39.9333, longitude: 32.9167 },
        { id: '0604', name: 'Yenimahalle', latitude: 39.9667, longitude: 32.8000 },
        { id: '0605', name: 'Etimesgut', latitude: 39.9500, longitude: 32.6667 },
        { id: '0606', name: 'Sincan', latitude: 39.9667, longitude: 32.5833 },
        { id: '0607', name: 'Altındağ', latitude: 39.9500, longitude: 32.8667 },
        { id: '0608', name: 'Pursaklar', latitude: 40.0333, longitude: 32.9000 },
      ],
    },
    {
      id: '07',
      name: 'Antalya',
      districts: [
        { id: '0701', name: 'Muratpaşa', latitude: 36.8841, longitude: 30.7056 },
        { id: '0702', name: 'Kepez', latitude: 36.9333, longitude: 30.7167 },
        { id: '0703', name: 'Konyaaltı', latitude: 36.8667, longitude: 30.6333 },
        { id: '0704', name: 'Alanya', latitude: 36.5500, longitude: 32.0000 },
        { id: '0705', name: 'Manavgat', latitude: 36.7833, longitude: 31.4333 },
      ],
    },
    {
      id: '16',
      name: 'Bursa',
      districts: [
        { id: '1601', name: 'Osmangazi', latitude: 40.1833, longitude: 29.0500 },
        { id: '1602', name: 'Nilüfer', latitude: 40.2167, longitude: 28.9833 },
        { id: '1603', name: 'Yıldırım', latitude: 40.1833, longitude: 29.0833 },
        { id: '1604', name: 'Gemlik', latitude: 40.4333, longitude: 29.1667 },
        { id: '1605', name: 'İnegöl', latitude: 40.0833, longitude: 29.5000 },
      ],
    },
    {
      id: '34',
      name: 'İstanbul',
      districts: [
        { id: '3401', name: 'Kadıköy', latitude: 40.9833, longitude: 29.0333 },
        { id: '3402', name: 'Üsküdar', latitude: 41.0167, longitude: 29.0167 },
        { id: '3403', name: 'Beşiktaş', latitude: 41.0500, longitude: 29.0000 },
        { id: '3404', name: 'Fatih', latitude: 41.0167, longitude: 28.9500 },
        { id: '3405', name: 'Bakırköy', latitude: 40.9833, longitude: 28.8667 },
        { id: '3406', name: 'Beyoğlu', latitude: 41.0333, longitude: 28.9833 },
        { id: '3407', name: 'Şişli', latitude: 41.0667, longitude: 28.9833 },
        { id: '3408', name: 'Sarıyer', latitude: 41.1667, longitude: 29.0500 },
        { id: '3409', name: 'Maltepe', latitude: 40.9333, longitude: 29.1333 },
        { id: '3410', name: 'Kartal', latitude: 40.9000, longitude: 29.1833 },
        { id: '3411', name: 'Pendik', latitude: 40.8667, longitude: 29.2500 },
        { id: '3412', name: 'Tuzla', latitude: 40.8167, longitude: 29.3000 },
        { id: '3413', name: 'Ataşehir', latitude: 40.9833, longitude: 29.1167 },
        { id: '3414', name: 'Ümraniye', latitude: 41.0167, longitude: 29.1167 },
        { id: '3415', name: 'Bağcılar', latitude: 41.0333, longitude: 28.8500 },
        { id: '3416', name: 'Bahçelievler', latitude: 41.0000, longitude: 28.8500 },
        { id: '3417', name: 'Küçükçekmece', latitude: 41.0000, longitude: 28.7667 },
        { id: '3418', name: 'Başakşehir', latitude: 41.0833, longitude: 28.8000 },
        { id: '3419', name: 'Esenyurt', latitude: 41.0333, longitude: 28.6833 },
        { id: '3420', name: 'Beylikdüzü', latitude: 41.0000, longitude: 28.6333 },
        { id: '3421', name: 'Avcılar', latitude: 40.9833, longitude: 28.7167 },
        { id: '3422', name: 'Esenler', latitude: 41.0500, longitude: 28.8833 },
        { id: '3423', name: 'Güngören', latitude: 41.0167, longitude: 28.8833 },
        { id: '3424', name: 'Zeytinburnu', latitude: 41.0000, longitude: 28.9000 },
        { id: '3425', name: 'Eyüpsultan', latitude: 41.0500, longitude: 28.9333 },
        { id: '3426', name: 'Gaziosmanpaşa', latitude: 41.0667, longitude: 28.9167 },
        { id: '3427', name: 'Sultangazi', latitude: 41.1000, longitude: 28.8667 },
        { id: '3428', name: 'Kağıthane', latitude: 41.0833, longitude: 28.9667 },
        { id: '3429', name: 'Beykoz', latitude: 41.1333, longitude: 29.1000 },
        { id: '3430', name: 'Çekmeköy', latitude: 41.0333, longitude: 29.1833 },
        { id: '3431', name: 'Sancaktepe', latitude: 41.0000, longitude: 29.2333 },
        { id: '3432', name: 'Sultanbeyli', latitude: 40.9667, longitude: 29.2667 },
        { id: '3433', name: 'Arnavutköy', latitude: 41.2000, longitude: 28.7333 },
        { id: '3434', name: 'Çatalca', latitude: 41.1500, longitude: 28.4667 },
        { id: '3435', name: 'Silivri', latitude: 41.0833, longitude: 28.2500 },
        { id: '3436', name: 'Büyükçekmece', latitude: 41.0167, longitude: 28.5833 },
        { id: '3437', name: 'Adalar', latitude: 40.8833, longitude: 29.0833 },
        { id: '3438', name: 'Şile', latitude: 41.1833, longitude: 29.6167 },
      ],
    },
    {
      id: '35',
      name: 'İzmir',
      districts: [
        { id: '3501', name: 'Konak', latitude: 38.4167, longitude: 27.1333 },
        { id: '3502', name: 'Karşıyaka', latitude: 38.4500, longitude: 27.1000 },
        { id: '3503', name: 'Bornova', latitude: 38.4667, longitude: 27.2167 },
        { id: '3504', name: 'Buca', latitude: 38.3833, longitude: 27.1833 },
        { id: '3505', name: 'Bayraklı', latitude: 38.4667, longitude: 27.1500 },
        { id: '3506', name: 'Çiğli', latitude: 38.5000, longitude: 27.0667 },
        { id: '3507', name: 'Gaziemir', latitude: 38.3167, longitude: 27.1333 },
        { id: '3508', name: 'Karabağlar', latitude: 38.3833, longitude: 27.1167 },
        { id: '3509', name: 'Menemen', latitude: 38.6000, longitude: 27.0667 },
        { id: '3510', name: 'Torbalı', latitude: 38.1667, longitude: 27.3667 },
      ],
    },
    {
      id: '42',
      name: 'Konya',
      districts: [
        { id: '4201', name: 'Selçuklu', latitude: 37.9333, longitude: 32.4833 },
        { id: '4202', name: 'Meram', latitude: 37.8500, longitude: 32.4333 },
        { id: '4203', name: 'Karatay', latitude: 37.8833, longitude: 32.5000 },
      ],
    },
    {
      id: '55',
      name: 'Samsun',
      districts: [
        { id: '5501', name: 'Atakum', latitude: 41.3333, longitude: 36.2833 },
        { id: '5502', name: 'İlkadım', latitude: 41.2833, longitude: 36.3333 },
        { id: '5503', name: 'Canik', latitude: 41.2500, longitude: 36.3833 },
        { id: '5504', name: 'Tekkeköy', latitude: 41.2167, longitude: 36.4667 },
        { id: '5505', name: 'Bafra', latitude: 41.5667, longitude: 35.9000 },
        { id: '5506', name: 'Çarşamba', latitude: 41.2000, longitude: 36.7333 },
        { id: '5507', name: 'Terme', latitude: 41.2167, longitude: 36.9667 },
      ],
    },
    {
      id: '61',
      name: 'Trabzon',
      districts: [
        { id: '6101', name: 'Ortahisar', latitude: 41.0000, longitude: 39.7167 },
        { id: '6102', name: 'Akçaabat', latitude: 41.0333, longitude: 39.5500 },
        { id: '6103', name: 'Yomra', latitude: 40.9500, longitude: 39.8500 },
        { id: '6104', name: 'Arsin', latitude: 40.9167, longitude: 39.9333 },
        { id: '6105', name: 'Of', latitude: 40.9500, longitude: 40.2667 },
      ],
    },
    {
      id: '21',
      name: 'Diyarbakır',
      districts: [
        { id: '2101', name: 'Bağlar', latitude: 37.9000, longitude: 40.2167 },
        { id: '2102', name: 'Kayapınar', latitude: 37.9333, longitude: 40.1500 },
        { id: '2103', name: 'Sur', latitude: 37.9167, longitude: 40.2333 },
        { id: '2104', name: 'Yenişehir', latitude: 37.9167, longitude: 40.2000 },
      ],
    },
    {
      id: '27',
      name: 'Gaziantep',
      districts: [
        { id: '2701', name: 'Şahinbey', latitude: 37.0500, longitude: 37.3833 },
        { id: '2702', name: 'Şehitkamil', latitude: 37.0833, longitude: 37.3500 },
        { id: '2703', name: 'Nizip', latitude: 37.0167, longitude: 37.8000 },
      ],
    },
    {
      id: '33',
      name: 'Mersin',
      districts: [
        { id: '3301', name: 'Akdeniz', latitude: 36.8000, longitude: 34.6333 },
        { id: '3302', name: 'Mezitli', latitude: 36.7667, longitude: 34.5500 },
        { id: '3303', name: 'Toroslar', latitude: 36.8500, longitude: 34.5833 },
        { id: '3304', name: 'Yenişehir', latitude: 36.8167, longitude: 34.5833 },
        { id: '3305', name: 'Tarsus', latitude: 36.9167, longitude: 34.8833 },
      ],
    },
    {
      id: '41',
      name: 'Kocaeli',
      districts: [
        { id: '4101', name: 'İzmit', latitude: 40.7667, longitude: 29.9167 },
        { id: '4102', name: 'Gebze', latitude: 40.8000, longitude: 29.4333 },
        { id: '4103', name: 'Darıca', latitude: 40.7667, longitude: 29.3833 },
        { id: '4104', name: 'Körfez', latitude: 40.7667, longitude: 29.7667 },
        { id: '4105', name: 'Derince', latitude: 40.7500, longitude: 29.8333 },
      ],
    },
    {
      id: '26',
      name: 'Eskişehir',
      districts: [
        { id: '2601', name: 'Odunpazarı', latitude: 39.7667, longitude: 30.5167 },
        { id: '2602', name: 'Tepebaşı', latitude: 39.7833, longitude: 30.5000 },
      ],
    },
    {
      id: '38',
      name: 'Kayseri',
      districts: [
        { id: '3801', name: 'Kocasinan', latitude: 38.7333, longitude: 35.4833 },
        { id: '3802', name: 'Melikgazi', latitude: 38.7167, longitude: 35.5167 },
        { id: '3803', name: 'Talas', latitude: 38.7000, longitude: 35.5500 },
      ],
    },
    {
      id: '25',
      name: 'Erzurum',
      districts: [
        { id: '2501', name: 'Yakutiye', latitude: 39.9167, longitude: 41.2833 },
        { id: '2502', name: 'Palandöken', latitude: 39.8833, longitude: 41.2500 },
        { id: '2503', name: 'Aziziye', latitude: 39.9333, longitude: 41.2167 },
      ],
    },
    {
      id: '54',
      name: 'Sakarya',
      districts: [
        { id: '5401', name: 'Adapazarı', latitude: 40.7833, longitude: 30.4000 },
        { id: '5402', name: 'Serdivan', latitude: 40.7333, longitude: 30.3667 },
        { id: '5403', name: 'Erenler', latitude: 40.7500, longitude: 30.3500 },
      ],
    },
    {
      id: '63',
      name: 'Şanlıurfa',
      districts: [
        { id: '6301', name: 'Eyyübiye', latitude: 37.1500, longitude: 38.7833 },
        { id: '6302', name: 'Haliliye', latitude: 37.1667, longitude: 38.8000 },
        { id: '6303', name: 'Karaköprü', latitude: 37.2000, longitude: 38.7500 },
      ],
    },
    {
      id: '44',
      name: 'Malatya',
      districts: [
        { id: '4401', name: 'Battalgazi', latitude: 38.4000, longitude: 38.3333 },
        { id: '4402', name: 'Yeşilyurt', latitude: 38.3167, longitude: 38.2833 },
      ],
    },
    {
      id: '65',
      name: 'Van',
      districts: [
        { id: '6501', name: 'İpekyolu', latitude: 38.5000, longitude: 43.4000 },
        { id: '6502', name: 'Tuşba', latitude: 38.5167, longitude: 43.4333 },
        { id: '6503', name: 'Edremit', latitude: 38.4500, longitude: 43.2667 },
      ],
    },
    {
      id: '46',
      name: 'Kahramanmaraş',
      districts: [
        { id: '4601', name: 'Dulkadiroğlu', latitude: 37.5667, longitude: 36.9333 },
        { id: '4602', name: 'Onikişubat', latitude: 37.6000, longitude: 36.9167 },
      ],
    },
    {
      id: '20',
      name: 'Denizli',
      districts: [
        { id: '2001', name: 'Merkezefendi', latitude: 37.7833, longitude: 29.0833 },
        { id: '2002', name: 'Pamukkale', latitude: 37.9167, longitude: 29.1167 },
      ],
    },
    {
      id: '10',
      name: 'Balıkesir',
      districts: [
        { id: '1001', name: 'Altıeylül', latitude: 39.6500, longitude: 27.8833 },
        { id: '1002', name: 'Karesi', latitude: 39.6500, longitude: 27.9000 },
        { id: '1003', name: 'Bandırma', latitude: 40.3500, longitude: 27.9667 },
        { id: '1004', name: 'Edremit', latitude: 39.5833, longitude: 27.0167 },
      ],
    },
    {
      id: '45',
      name: 'Manisa',
      districts: [
        { id: '4501', name: 'Şehzadeler', latitude: 38.6167, longitude: 27.4167 },
        { id: '4502', name: 'Yunusemre', latitude: 38.6000, longitude: 27.4000 },
        { id: '4503', name: 'Akhisar', latitude: 38.9167, longitude: 27.8333 },
        { id: '4504', name: 'Turgutlu', latitude: 38.5000, longitude: 27.7000 },
      ],
    },
    {
      id: '09',
      name: 'Aydın',
      districts: [
        { id: '0901', name: 'Efeler', latitude: 37.8500, longitude: 27.8500 },
        { id: '0902', name: 'Nazilli', latitude: 37.9167, longitude: 28.3167 },
        { id: '0903', name: 'Kuşadası', latitude: 37.8667, longitude: 27.2667 },
        { id: '0904', name: 'Didim', latitude: 37.3833, longitude: 27.2667 },
        { id: '0905', name: 'Söke', latitude: 37.7500, longitude: 27.4167 },
      ],
    },
    {
      id: '48',
      name: 'Muğla',
      districts: [
        { id: '4801', name: 'Menteşe', latitude: 37.2167, longitude: 28.3667 },
        { id: '4802', name: 'Bodrum', latitude: 37.0333, longitude: 27.4333 },
        { id: '4803', name: 'Fethiye', latitude: 36.6500, longitude: 29.1167 },
        { id: '4804', name: 'Marmaris', latitude: 36.8500, longitude: 28.2667 },
        { id: '4805', name: 'Milas', latitude: 37.3167, longitude: 27.7833 },
        { id: '4806', name: 'Dalaman', latitude: 36.7667, longitude: 28.8000 },
      ],
    },
  ].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
};

// Tüm ülkeler (şimdilik sadece Türkiye)
export const countries: Country[] = [turkeyLocations];

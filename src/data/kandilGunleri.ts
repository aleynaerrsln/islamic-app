import type { KandilGunu, DiniBayram } from '../types';

export const kandilGunleri: KandilGunu[] = [
  {
    hicriAy: 3,  // Rebiülevvel
    hicriGun: 12,
    isim: 'Mevlid Kandili',
    aciklama: 'Hz. Muhammed\'in (s.a.v.) doğum günü. Bu mübarek gecede Peygamber Efendimizin dünyaya teşrifi anılır.',
  },
  {
    hicriAy: 7,  // Recep
    hicriGun: 'ilkCuma', // Recep ayının ilk Cuma gecesi (hesaplanacak)
    isim: 'Regaib Kandili',
    aciklama: 'Üç ayların başlangıcı. "Regaib" kelimesi, bol bol ihsan edilen anlamına gelir.',
  },
  {
    hicriAy: 7,  // Recep
    hicriGun: 27,
    isim: 'Miraç Kandili',
    aciklama: 'Hz. Muhammed\'in (s.a.v.) Mescid-i Haram\'dan Mescid-i Aksa\'ya ve oradan göklere yükseldiği gece. Beş vakit namaz bu gecede farz kılındı.',
  },
  {
    hicriAy: 8,  // Şaban
    hicriGun: 15,
    isim: 'Berat Kandili',
    aciklama: 'Günahların affedildiği, bir yıllık kader ve rızıkların belirlediği mübarek gece.',
  },
  {
    hicriAy: 9,  // Ramazan
    hicriGun: 27,
    isim: 'Kadir Gecesi',
    aciklama: 'Kur\'an-ı Kerim\'in indirildiği, bin aydan hayırlı olan mübarek gece. "Biz onu Kadir gecesinde indirdik." (Kadir Suresi)',
  },
];

export const diniBayramlar: DiniBayram[] = [
  {
    hicriAy: 10, // Şevval
    hicriGun: 1,
    sure: 3, // 3 gün
    isim: 'Ramazan Bayramı',
  },
  {
    hicriAy: 12, // Zilhicce
    hicriGun: 10,
    sure: 4, // 4 gün
    isim: 'Kurban Bayramı',
  },
];

// Önemli İslami günler
export const onemliGunler = [
  {
    hicriAy: 1, // Muharrem
    hicriGun: 1,
    isim: 'Hicri Yılbaşı',
    aciklama: 'İslam takviminin yeni yılı',
  },
  {
    hicriAy: 1, // Muharrem
    hicriGun: 10,
    isim: 'Aşure Günü',
    aciklama: 'Hz. Nuh\'un tufandan kurtulduğu, Hz. Musa\'nın Firavun\'dan kurtulduğu mübarek gün',
  },
  {
    hicriAy: 9, // Ramazan
    hicriGun: 1,
    isim: 'Ramazan Başlangıcı',
    aciklama: 'Oruç ayının başlangıcı',
  },
  {
    hicriAy: 12, // Zilhicce
    hicriGun: 9,
    isim: 'Arefe Günü',
    aciklama: 'Kurban Bayramı arefesi, hacıların Arafat\'ta vakfe yaptığı gün',
  },
];

// Hicri ay isimleri
export const hicriAylar: { [key: number]: string } = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebiülevvel',
  4: 'Rebiülahir',
  5: 'Cemaziyelevvel',
  6: 'Cemaziyelahir',
  7: 'Recep',
  8: 'Şaban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce',
};

// Hicri gün isimleri
export const hicriGunler: { [key: string]: string } = {
  'Al-Ahad': 'Pazar',
  'Al-Ithnayn': 'Pazartesi',
  'Al-Thulatha': 'Salı',
  'Al-Arba\'a': 'Çarşamba',
  'Al-Khamees': 'Perşembe',
  'Al-Jumu\'ah': 'Cuma',
  'As-Sabt': 'Cumartesi',
};

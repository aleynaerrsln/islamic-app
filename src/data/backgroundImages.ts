import { ImageSourcePropType } from 'react-native';

export interface BackgroundImage {
  id: string;
  name: string;
  source: ImageSourcePropType;
  thumbnail: ImageSourcePropType;
}

export interface SolidColor {
  id: string;
  name: string;
  color: string;
}

// Düz renkler
export const SOLID_COLORS: SolidColor[] = [
  { id: 'white', name: 'Beyaz', color: '#FFFFFF' },
  { id: 'light_gray', name: 'Açık Gri', color: '#F5F5F5' },
  { id: 'cream', name: 'Krem', color: '#FFF8E7' },
  { id: 'light_green', name: 'Açık Yeşil', color: '#E8F5E9' },
  { id: 'dark_green', name: 'Koyu Yeşil', color: '#1B5E20' },
  { id: 'dark_gray', name: 'Koyu Gri', color: '#424242' },
  { id: 'black', name: 'Siyah', color: '#121212' },
  { id: 'navy', name: 'Lacivert', color: '#1A237E' },
];

// Hazır arka plan resimleri
export const BACKGROUND_IMAGES: BackgroundImage[] = [
  {
    id: 'geometric_gold',
    name: 'Geometrik Altın',
    source: require('../../assets/images/backgrounds/geometric_gold.jpg'),
    thumbnail: require('../../assets/images/backgrounds/geometric_gold.jpg'),
  },
  {
    id: 'blue_mosque',
    name: 'Sultanahmet Camii',
    source: require('../../assets/images/backgrounds/blue_mosque.jpg'),
    thumbnail: require('../../assets/images/backgrounds/blue_mosque.jpg'),
  },
  {
    id: 'kabe',
    name: 'Kabe',
    source: require('../../assets/images/backgrounds/kabe.jpg'),
    thumbnail: require('../../assets/images/backgrounds/kabe.jpg'),
  },
  {
    id: 'mosque_interior',
    name: 'Cami İçi',
    source: require('../../assets/images/backgrounds/mosque_interior.jpg'),
    thumbnail: require('../../assets/images/backgrounds/mosque_interior.jpg'),
  },
  {
    id: 'night_sky',
    name: 'Gece Gökyüzü',
    source: require('../../assets/images/backgrounds/night_sky.jpg'),
    thumbnail: require('../../assets/images/backgrounds/night_sky.jpg'),
  },
  {
    id: 'ramazan',
    name: 'Ramazan',
    source: require('../../assets/images/backgrounds/ramazan.jpg'),
    thumbnail: require('../../assets/images/backgrounds/ramazan.jpg'),
  },
  {
    id: 'islamic_pattern',
    name: 'İslami Desen',
    source: require('../../assets/images/backgrounds/islamic_pattern.jpg'),
    thumbnail: require('../../assets/images/backgrounds/islamic_pattern.jpg'),
  },
];

// Varsayılan arka plan
export const DEFAULT_BACKGROUND = 'geometric_gold';
export const DEFAULT_OPACITY = 0.85;

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  Searchbar,
  TouchableRipple,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getAllSurahs } from '../api/quran';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
// import { BannerAdWrapper } from '../components/BannerAdWrapper';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

// Türkçe sure isimleri
const SURAH_NAMES_TR: { [key: number]: string } = {
  1: 'Fatiha', 2: 'Bakara', 3: 'Al-i İmran', 4: 'Nisa', 5: 'Maide',
  6: 'Enam', 7: 'Araf', 8: 'Enfal', 9: 'Tevbe', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: 'Rad', 14: 'İbrahim', 15: 'Hicr',
  16: 'Nahl', 17: 'İsra', 18: 'Kehf', 19: 'Meryem', 20: 'Taha',
  21: 'Enbiya', 22: 'Hac', 23: 'Müminun', 24: 'Nur', 25: 'Furkan',
  26: 'Şuara', 27: 'Neml', 28: 'Kasas', 29: 'Ankebut', 30: 'Rum',
  31: 'Lokman', 32: 'Secde', 33: 'Ahzab', 34: 'Sebe', 35: 'Fatır',
  36: 'Yasin', 37: 'Saffat', 38: 'Sad', 39: 'Zümer', 40: 'Mümin',
  41: 'Fussilet', 42: 'Şura', 43: 'Zuhruf', 44: 'Duhan', 45: 'Casiye',
  46: 'Ahkaf', 47: 'Muhammed', 48: 'Fetih', 49: 'Hucurat', 50: 'Kaf',
  51: 'Zariyat', 52: 'Tur', 53: 'Necm', 54: 'Kamer', 55: 'Rahman',
  56: 'Vakıa', 57: 'Hadid', 58: 'Mücadele', 59: 'Haşr', 60: 'Mümtehine',
  61: 'Saf', 62: 'Cuma', 63: 'Münafikun', 64: 'Tegabün', 65: 'Talak',
  66: 'Tahrim', 67: 'Mülk', 68: 'Kalem', 69: 'Hakka', 70: 'Mearic',
  71: 'Nuh', 72: 'Cin', 73: 'Müzzemmil', 74: 'Müddessir', 75: 'Kıyamet',
  76: 'İnsan', 77: 'Mürselat', 78: 'Nebe', 79: 'Naziat', 80: 'Abese',
  81: 'Tekvir', 82: 'İnfitar', 83: 'Mutaffifin', 84: 'İnşikak', 85: 'Buruc',
  86: 'Tarık', 87: 'Ala', 88: 'Gaşiye', 89: 'Fecr', 90: 'Beled',
  91: 'Şems', 92: 'Leyl', 93: 'Duha', 94: 'İnşirah', 95: 'Tin',
  96: 'Alak', 97: 'Kadir', 98: 'Beyyine', 99: 'Zilzal', 100: 'Adiyat',
  101: 'Karia', 102: 'Tekasür', 103: 'Asr', 104: 'Hümeze', 105: 'Fil',
  106: 'Kureyş', 107: 'Maun', 108: 'Kevser', 109: 'Kafirun', 110: 'Nasr',
  111: 'Tebbet', 112: 'İhlas', 113: 'Felak', 114: 'Nas',
};

export function QuranScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      const response = await getAllSurahs();
      setSurahs(response.data);
      setFilteredSurahs(response.data);
    } catch (error) {
      console.log('Sureler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        (surah) =>
          SURAH_NAMES_TR[surah.number]?.toLowerCase().includes(query.toLowerCase()) ||
          surah.englishName.toLowerCase().includes(query.toLowerCase()) ||
          surah.number.toString() === query
      );
      setFilteredSurahs(filtered);
    }
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableRipple
      onPress={() => {
        navigation.navigate('SurahDetail', {
          surahNumber: item.number,
          surahName: SURAH_NAMES_TR[item.number] || item.englishName,
        });
      }}
    >
      <Card style={styles.surahCard} mode="outlined">
        <View style={styles.surahContent}>
          {/* Sure numarası */}
          <View style={[styles.surahNumber, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              {item.number}
            </Text>
          </View>

          {/* Sure bilgileri */}
          <View style={styles.surahInfo}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {SURAH_NAMES_TR[item.number] || item.englishName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {item.englishNameTranslation} • {item.numberOfAyahs} ayet
            </Text>
          </View>

          {/* Arapça isim ve ok ikonu */}
          <View style={styles.rightSection}>
            <Text variant="titleLarge" style={[styles.arabicName, { color: theme.colors.primary }]}>
              {item.name}
            </Text>
            <Icon name="chevron-right" size={24} color={theme.colors.outline} />
          </View>
        </View>
      </Card>
    </TouchableRipple>
  );

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md }}>Sureler yükleniyor...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kur'an-ı Kerim</Text>
        </View>

        {/* Arama */}
        <Searchbar
          placeholder="Sure ara..."
          onChangeText={onSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Sure listesi */}
        <FlatList
          data={filteredSurahs}
          renderItem={renderSurahItem}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  searchBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  surahCard: {
    marginBottom: spacing.sm,
  },
  surahContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  surahInfo: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  arabicName: {
    fontFamily: 'System',
  },
  adContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
});

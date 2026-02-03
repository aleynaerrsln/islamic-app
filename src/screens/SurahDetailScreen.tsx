import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getSurahWithTranslation } from '../api/quran';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { useSettingsStore } from '../store/settingsStore';
// import { useAds } from '../services/adService';

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

// İngilizce transliteration'ı Türkçe okunuşa çevir
function toTurkishTransliteration(text: string): string {
  if (!text) return '';

  let result = text;

  // Büyük harfle başlat (cümle başı)
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // İngilizce -> Türkçe dönüşümler
  const replacements: [RegExp, string][] = [
    // Sessiz harfler
    [/sh/gi, 'ş'],
    [/gh/gi, 'ğ'],
    [/th/gi, 's'],
    [/dh/gi, 'z'],
    [/kh/gi, 'h'],
    [/ch/gi, 'ç'],

    // Uzun sesli harfler
    [/aa/gi, 'â'],
    [/ee/gi, 'î'],
    [/ii/gi, 'î'],
    [/oo/gi, 'û'],
    [/uu/gi, 'û'],

    // Özel karakterler
    [/'/g, ''],
    [/`/g, ''],
    [/"/g, ''],

    // q harfi Türkçe'de k olarak okunur
    [/q/gi, 'k'],

    // w harfi Türkçe'de v olarak okunur
    [/w/gi, 'v'],

    // Bazı kombinasyonlar
    [/allaah/gi, 'Allah'],
    [/allah/gi, 'Allah'],
    [/muhammed/gi, 'Muhammed'],
    [/muhammad/gi, 'Muhammed'],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  arabic: string;
  transliteration: string;
  turkish: string;
  juz: number;
  page: number;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

type RouteParams = {
  SurahDetail: {
    surahNumber: number;
    surahName?: string;
  };
};

export function SurahDetailScreen() {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SurahDetail'>>();
  const { surahNumber } = route.params;

  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24); // Arapça font boyutu
  const [showFullSurah, setShowFullSurah] = useState(false); // Surenin tamamı görünürlüğü

  // Okunuş ve meal için font boyutu (Arapça'dan biraz küçük)
  const textFontSize = Math.max(14, fontSize - 8);

  const loadSurah = useCallback(async () => {
    try {
      setError(null);
      const data = await getSurahWithTranslation(surahNumber);
      setSurahInfo(data.surahInfo);
      setAyahs(data.ayahs);
    } catch (err) {
      setError('Sure yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Sure yükleme hatası:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    loadSurah();
  }, [loadSurah]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSurah();
  };

  const increaseFontSize = () => {
    if (fontSize < 36) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 18) setFontSize(fontSize - 2);
  };

  // Besmele
  const renderBismillah = () => {
    if (surahNumber === 9 || surahNumber === 1) return null;

    return (
      <View style={[styles.bismillahContainer, { backgroundColor: cardBgColor }]}>
        <Text style={[styles.bismillahText, { fontSize: fontSize + 2 }]}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
        <Text style={[styles.transliterationText, { color: '#4CAF50', fontSize: textFontSize }]}>
          Bismillâhirrahmânirrahîm
        </Text>
        <Text style={[styles.bismillahTranslation, { color: 'rgba(255,255,255,0.7)', fontSize: textFontSize - 1 }]}>
          Rahmân ve Rahîm olan Allah'ın adıyla
        </Text>
      </View>
    );
  };

  // Surenin tamamı (sadece Arapça + Okunuş, meal yok) - Açılır/kapanır
  const renderFullSurah = () => {
    const fullArabicText = ayahs.map((ayah) =>
      `${ayah.arabic} ﴿${ayah.numberInSurah}﴾`
    ).join(' ');

    const fullTransliteration = ayahs.map((ayah) =>
      `(${ayah.numberInSurah}) ${toTurkishTransliteration(ayah.transliteration)}`
    ).join(' ');

    return (
      <View style={[styles.fullSurahContainer, { backgroundColor: cardBgColor }]}>
        {/* Tıklanabilir başlık */}
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setShowFullSurah(!showFullSurah)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <Icon name="book-open-variant" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Surenin Tamamı
            </Text>
          </View>
          <Icon
            name={showFullSurah ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        {/* Açılır içerik */}
        {showFullSurah && (
          <>
            {/* Tam Arapça Metin */}
            <Text style={[styles.fullArabicText, { fontSize }]}>
              {fullArabicText}
            </Text>

            {/* Tam Okunuş */}
            <View style={styles.transliterationSection}>
              <Text style={[styles.labelText, { color: 'rgba(255,255,255,0.5)' }]}>
                Okunuşu:
              </Text>
              <Text style={[styles.fullTransliterationText, { color: '#4CAF50', fontSize: textFontSize }]}>
                {fullTransliteration}
              </Text>
            </View>
          </>
        )}

        {/* Kapalıyken bilgi metni */}
        {!showFullSurah && (
          <Text style={[styles.collapsedHint, { color: 'rgba(255,255,255,0.5)' }]}>
            Surenin tamamını görmek için dokunun
          </Text>
        )}
      </View>
    );
  };

  // Tek tek ayetler
  const renderAyahItem = ({ item }: { item: Ayah }) => (
    <View style={[styles.ayahContainer, { backgroundColor: cardBgColor }]}>
      {/* Ayet numarası */}
      <View style={styles.ayahHeader}>
        <View style={[styles.ayahNumberBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.ayahNumber, { color: theme.colors.onPrimary }]}>
            {item.numberInSurah}
          </Text>
        </View>
        <Text style={[styles.pageInfo, { color: 'rgba(255,255,255,0.5)' }]}>
          Sayfa {item.page} • Cüz {item.juz}
        </Text>
      </View>

      {/* Arapça metin */}
      <Text style={[styles.arabicText, { fontSize }]}>
        {item.arabic}
      </Text>

      {/* Türkçe okunuş */}
      <View style={styles.transliterationContainer}>
        <Text style={[styles.transliterationLabel, { color: 'rgba(255,255,255,0.5)' }]}>
          Okunuşu:
        </Text>
        <Text style={[styles.ayahTransliteration, { color: '#4CAF50', fontSize: textFontSize }]}>
          {toTurkishTransliteration(item.transliteration)}
        </Text>
      </View>

      {/* Türkçe meal */}
      <View style={styles.translationContainer}>
        <Text style={[styles.translationLabel, { color: 'rgba(255,255,255,0.5)' }]}>
          Meali:
        </Text>
        <Text style={[styles.turkishText, { color: 'rgba(255,255,255,0.85)', fontSize: textFontSize }]}>
          {item.turkish}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Sure başlık kartı */}
      <View style={[styles.surahHeader, { backgroundColor: cardBgColor }]}>
        <Text style={styles.surahArabicName}>{surahInfo?.name}</Text>
        <Text style={styles.surahTurkishName}>
          {SURAH_NAMES_TR[surahNumber] || surahInfo?.englishName} Suresi
        </Text>
        <Text style={[styles.surahMeta, { color: 'rgba(255,255,255,0.7)' }]}>
          {surahInfo?.englishNameTranslation} • {surahInfo?.numberOfAyahs} Ayet
        </Text>
        <View style={styles.revelationBadge}>
          <Icon
            name={surahInfo?.revelationType === 'Meccan' ? 'mosque' : 'city'}
            size={14}
            color="rgba(255,255,255,0.7)"
          />
          <Text style={[styles.revelationText, { color: 'rgba(255,255,255,0.7)' }]}>
            {surahInfo?.revelationType === 'Meccan' ? 'Mekkî' : 'Medenî'}
          </Text>
        </View>
      </View>

      {/* Font boyutu kontrolleri */}
      <View style={[styles.fontControls, { backgroundColor: cardBgColor }]}>
        <Text style={[styles.fontLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          Yazı Boyutu
        </Text>
        <View style={styles.fontButtons}>
          <TouchableOpacity
            style={[styles.fontButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={decreaseFontSize}
          >
            <Icon name="minus" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.fontSizeText, { color: '#fff' }]}>{fontSize}</Text>
          <TouchableOpacity
            style={[styles.fontButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={increaseFontSize}
          >
            <Icon name="plus" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Besmele */}
      {renderBismillah()}

      {/* Surenin tamamı */}
      {renderFullSurah()}

      {/* Ayetler başlığı */}
      <View style={styles.ayahsHeaderSection}>
        <View style={styles.sectionHeader}>
          <Icon name="format-list-numbered" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Ayet Ayet
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md, color: '#fff' }}>
            {SURAH_NAMES_TR[surahNumber] || 'Sure'} yükleniyor...
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (error) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={{ marginTop: spacing.md, color: theme.colors.error, textAlign: 'center', paddingHorizontal: spacing.lg }}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadSurah}
          >
            <Text style={{ color: theme.colors.onPrimary }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Üst bar */}
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.topBarTitle}>
            {SURAH_NAMES_TR[surahNumber] || surahInfo?.englishName} Suresi
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Ayet listesi */}
        <FlatList
          data={ayahs}
          renderItem={renderAyahItem}
          keyExtractor={(item) => item.number.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerContent: {
    paddingBottom: spacing.md,
  },
  surahHeader: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  surahArabicName: {
    fontSize: 40,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  surahTurkishName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  surahMeta: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  revelationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revelationText: {
    fontSize: 13,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  fontLabel: {
    fontSize: 14,
  },
  fontButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  bismillahContainer: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bismillahText: {
    color: '#fff',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  transliterationText: {
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  bismillahTranslation: {
    textAlign: 'center',
  },
  fullSurahContainer: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  collapsedHint: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullArabicText: {
    color: '#fff',
    textAlign: 'right',
    lineHeight: 48,
    marginBottom: spacing.lg,
  },
  transliterationSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  labelText: {
    fontSize: 12,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fullTransliterationText: {
    fontStyle: 'italic',
    lineHeight: 28,
  },
  ayahsHeaderSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  ayahContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  ayahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ayahNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 12,
  },
  arabicText: {
    color: '#fff',
    textAlign: 'right',
    lineHeight: 44,
    marginBottom: spacing.md,
  },
  transliterationContainer: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  transliterationLabel: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ayahTransliteration: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
  translationContainer: {
    paddingTop: spacing.xs,
  },
  translationLabel: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turkishText: {
    lineHeight: 26,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
});

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Share,
  ScrollView,
  type TextInput as TextInputType,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import {
  HADITHS,
  HADITH_CATEGORIES,
  getDailyHadithFromCollection,
  getHadithsByCategory,
  searchHadithsInCollection,
  type HadithData,
  type HadithCategory,
} from '../data/hadiths';

const { width } = Dimensions.get('window');

export function HadithScreen() {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<HadithCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInputType>(null);

  // Arama açıldığında focus ver
  useEffect(() => {
    if (showSearch) {
      // Küçük bir gecikme ile focus ver (render tamamlandıktan sonra)
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSearch]);

  // Günün hadisi
  const dailyHadith = useMemo(() => getDailyHadithFromCollection(), []);

  // Filtrelenmiş hadisler
  const filteredHadiths = useMemo(() => {
    let results = HADITHS;

    if (searchQuery.trim()) {
      results = searchHadithsInCollection(searchQuery);
    } else if (selectedCategory !== 'all') {
      results = getHadithsByCategory(selectedCategory);
    }

    return results;
  }, [selectedCategory, searchQuery]);

  // Hadis paylaş
  const shareHadith = useCallback(async (hadith: HadithData) => {
    try {
      const sourceInfo = hadith.reference || hadith.source;
      await Share.share({
        message: `"${hadith.text}"\n\n📚 Kaynak: ${sourceInfo}\n\n📱 İslami Uygulama`,
      });
    } catch (error) {
      console.log('Paylaşım hatası');
    }
  }, []);

  // Günün hadisi kartı
  const renderDailyHadith = () => {
    const categoryInfo = HADITH_CATEGORIES[dailyHadith.category];

    return (
      <View style={styles.dailyHadithContainer}>
        <View style={styles.dailyHadithGradient}>
          {/* Dekoratif elementler */}
          <View style={styles.dailyDecoration}>
            <Icon name="star-crescent" size={80} color="rgba(255,255,255,0.08)" />
          </View>

          {/* Başlık */}
          <View style={styles.dailyHeader}>
            <View style={styles.dailyBadge}>
              <Icon name="calendar-star" size={16} color="#FFD700" />
              <Text style={styles.dailyBadgeText}>Günün Hadisi</Text>
            </View>
            <TouchableOpacity
              onPress={() => shareHadith(dailyHadith)}
              style={styles.shareButton}
            >
              <Icon name="share-variant" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Hadis metni */}
          <Text style={styles.dailyText}>"{dailyHadith.text}"</Text>

          {/* Kaynak */}
          <View style={styles.dailyFooter}>
            <View style={styles.dailySource}>
              <Icon name="book-open-variant" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.dailySourceText}>{dailyHadith.reference || dailyHadith.source}</Text>
            </View>
            <View style={[styles.categoryChip, { backgroundColor: categoryInfo.color + '40' }]}>
              <Icon name={categoryInfo.icon} size={12} color={categoryInfo.color} />
              <Text style={[styles.categoryChipText, { color: categoryInfo.color }]}>
                {categoryInfo.name}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Kategori butonları
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {/* Tümü butonu */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Icon
            name="view-grid"
            size={16}
            color={selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)'}
          />
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === 'all' && styles.categoryButtonTextActive,
            ]}
          >
            Tümü ({HADITHS.length})
          </Text>
        </TouchableOpacity>

        {/* Kategori butonları */}
        {(Object.entries(HADITH_CATEGORIES) as [HadithCategory, typeof HADITH_CATEGORIES[HadithCategory]][]).map(
          ([key, value]) => {
            const count = getHadithsByCategory(key).length;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryButton,
                  selectedCategory === key && [
                    styles.categoryButtonActive,
                    { backgroundColor: value.color },
                  ],
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Icon
                  name={value.icon}
                  size={16}
                  color={selectedCategory === key ? '#fff' : value.color}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === key && styles.categoryButtonTextActive,
                  ]}
                >
                  {value.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </ScrollView>
    </View>
  );

  // Hadis kartı
  const renderHadithCard = ({ item, index }: { item: HadithData; index: number }) => {
    const categoryInfo = HADITH_CATEGORIES[item.category];

    return (
      <TouchableOpacity
        style={styles.hadithCard}
        activeOpacity={0.9}
        onLongPress={() => shareHadith(item)}
      >
        {/* Sol kenar çizgisi */}
        <View style={[styles.cardAccent, { backgroundColor: categoryInfo.color }]} />

        <View style={styles.cardContent}>
          {/* Üst kısım - numara ve kategori */}
          <View style={styles.cardHeader}>
            <View style={styles.hadithNumber}>
              <Text style={styles.hadithNumberText}>{item.id}</Text>
            </View>
            <View style={[styles.topicBadge, { backgroundColor: categoryInfo.color + '20' }]}>
              <Text style={[styles.topicText, { color: categoryInfo.color }]}>
                {item.topic}
              </Text>
            </View>
          </View>

          {/* Hadis metni */}
          <Text style={styles.hadithText}>"{item.text}"</Text>

          {/* Alt kısım - kaynak ve paylaş */}
          <View style={styles.cardFooter}>
            <View style={styles.sourceContainer}>
              <Icon name="book-open-variant" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.sourceText}>{item.reference || item.source}</Text>
            </View>
            <TouchableOpacity
              onPress={() => shareHadith(item)}
              style={styles.cardShareButton}
            >
              <Icon name="share-variant-outline" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Header bileşeni
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Başlık ve arama */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Hadis-i Şerifler</Text>
          <Text style={styles.headerSubtitle}>
            {HADITHS.length} Sahih Hadis
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchToggle}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Icon
            name={showSearch ? 'close' : 'magnify'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Arama kutusu */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Hadis ara..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Günün hadisi - sadece arama yokken göster */}
      {!searchQuery && selectedCategory === 'all' && renderDailyHadith()}

      {/* Kategoriler */}
      {renderCategories()}

      {/* Sonuç sayısı */}
      {(searchQuery || selectedCategory !== 'all') && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredHadiths.length} hadis bulundu
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <BackgroundWrapper>
      <FlatList
        data={filteredHadiths}
        renderItem={renderHadithCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  searchToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: spacing.sm,
  },

  // Günün Hadisi
  dailyHadithContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dailyHadithGradient: {
    padding: spacing.lg,
    minHeight: 200,
    backgroundColor: '#1e2a4a',
    borderRadius: 20,
  },
  dailyDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    opacity: 0.5,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  dailyBadgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  dailyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailySource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dailySourceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Kategoriler
  categoriesContainer: {
    marginBottom: spacing.lg,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },

  // Sonuç bilgisi
  resultsInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  resultsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  // Hadis kartı
  hadithCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  hadithNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hadithNumberText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  topicBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  topicText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hadithText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  cardShareButton: {
    padding: spacing.xs,
  },
});

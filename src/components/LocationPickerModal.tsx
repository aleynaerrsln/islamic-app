import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ExpoLocation from 'expo-location';
import { spacing, borderRadius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import type { Location } from '../types';

// Şehir ve ilçe tipi
interface CityData {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  districts?: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

// Türkiye şehirleri ve ilçeleri
const TURKEY_CITIES: CityData[] = [
  {
    name: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0082,
    longitude: 28.9784,
    districts: [
      { name: 'Kadıköy', latitude: 40.9927, longitude: 29.0277 },
      { name: 'Beşiktaş', latitude: 41.0430, longitude: 29.0094 },
      { name: 'Üsküdar', latitude: 41.0234, longitude: 29.0152 },
      { name: 'Fatih', latitude: 41.0186, longitude: 28.9397 },
      { name: 'Beyoğlu', latitude: 41.0370, longitude: 28.9850 },
      { name: 'Şişli', latitude: 41.0602, longitude: 28.9877 },
      { name: 'Bakırköy', latitude: 40.9819, longitude: 28.8772 },
      { name: 'Ataşehir', latitude: 40.9923, longitude: 29.1244 },
      { name: 'Maltepe', latitude: 40.9346, longitude: 29.1319 },
      { name: 'Kartal', latitude: 40.8898, longitude: 29.1856 },
      { name: 'Pendik', latitude: 40.8756, longitude: 29.2336 },
      { name: 'Tuzla', latitude: 40.8165, longitude: 29.3003 },
      { name: 'Sarıyer', latitude: 41.1667, longitude: 29.0500 },
      { name: 'Beylikdüzü', latitude: 41.0021, longitude: 28.6428 },
      { name: 'Esenyurt', latitude: 41.0333, longitude: 28.6833 },
      { name: 'Başakşehir', latitude: 41.0944, longitude: 28.8019 },
      { name: 'Bağcılar', latitude: 41.0386, longitude: 28.8572 },
      { name: 'Bahçelievler', latitude: 41.0019, longitude: 28.8594 },
      { name: 'Güngören', latitude: 41.0197, longitude: 28.8756 },
      { name: 'Zeytinburnu', latitude: 40.9944, longitude: 28.9053 },
      { name: 'Esenler', latitude: 41.0436, longitude: 28.8756 },
      { name: 'Sultanbeyli', latitude: 40.9667, longitude: 29.2667 },
      { name: 'Ümraniye', latitude: 41.0167, longitude: 29.1167 },
      { name: 'Sancaktepe', latitude: 41.0028, longitude: 29.2311 },
      { name: 'Çekmeköy', latitude: 41.0333, longitude: 29.1833 },
      { name: 'Beykoz', latitude: 41.1333, longitude: 29.1000 },
      { name: 'Adalar', latitude: 40.8761, longitude: 29.0911 },
      { name: 'Arnavutköy', latitude: 41.1833, longitude: 28.7333 },
      { name: 'Avcılar', latitude: 40.9797, longitude: 28.7214 },
      { name: 'Büyükçekmece', latitude: 41.0167, longitude: 28.5833 },
      { name: 'Çatalca', latitude: 41.1439, longitude: 28.4594 },
      { name: 'Eyüpsultan', latitude: 41.0500, longitude: 28.9333 },
      { name: 'Gaziosmanpaşa', latitude: 41.0667, longitude: 28.9167 },
      { name: 'Kağıthane', latitude: 41.0833, longitude: 28.9667 },
      { name: 'Küçükçekmece', latitude: 41.0000, longitude: 28.7667 },
      { name: 'Silivri', latitude: 41.0736, longitude: 28.2467 },
      { name: 'Sultangazi', latitude: 41.1000, longitude: 28.8667 },
      { name: 'Şile', latitude: 41.1756, longitude: 29.6128 },
    ],
  },
  {
    name: 'Ankara',
    country: 'Türkiye',
    latitude: 39.9334,
    longitude: 32.8597,
    districts: [
      { name: 'Çankaya', latitude: 39.9032, longitude: 32.8597 },
      { name: 'Keçiören', latitude: 39.9833, longitude: 32.8667 },
      { name: 'Yenimahalle', latitude: 39.9667, longitude: 32.8000 },
      { name: 'Mamak', latitude: 39.9333, longitude: 32.9167 },
      { name: 'Etimesgut', latitude: 39.9500, longitude: 32.6667 },
      { name: 'Sincan', latitude: 39.9667, longitude: 32.5833 },
      { name: 'Altındağ', latitude: 39.9500, longitude: 32.8667 },
      { name: 'Pursaklar', latitude: 40.0333, longitude: 32.9000 },
      { name: 'Gölbaşı', latitude: 39.7833, longitude: 32.8000 },
      { name: 'Polatlı', latitude: 39.5833, longitude: 32.1500 },
    ],
  },
  {
    name: 'İzmir',
    country: 'Türkiye',
    latitude: 38.4192,
    longitude: 27.1287,
    districts: [
      { name: 'Konak', latitude: 38.4167, longitude: 27.1333 },
      { name: 'Karşıyaka', latitude: 38.4561, longitude: 27.1094 },
      { name: 'Bornova', latitude: 38.4667, longitude: 27.2167 },
      { name: 'Buca', latitude: 38.3833, longitude: 27.1667 },
      { name: 'Bayraklı', latitude: 38.4667, longitude: 27.1667 },
      { name: 'Çiğli', latitude: 38.5000, longitude: 27.0500 },
      { name: 'Gaziemir', latitude: 38.3167, longitude: 27.1333 },
      { name: 'Karabağlar', latitude: 38.3667, longitude: 27.1167 },
      { name: 'Balçova', latitude: 38.3833, longitude: 27.0500 },
      { name: 'Narlıdere', latitude: 38.3833, longitude: 27.0000 },
    ],
  },
  {
    name: 'Bursa',
    country: 'Türkiye',
    latitude: 40.1885,
    longitude: 29.0610,
    districts: [
      { name: 'Osmangazi', latitude: 40.1833, longitude: 29.0667 },
      { name: 'Nilüfer', latitude: 40.2167, longitude: 28.9833 },
      { name: 'Yıldırım', latitude: 40.2000, longitude: 29.1000 },
      { name: 'Gemlik', latitude: 40.4333, longitude: 29.1667 },
      { name: 'Mudanya', latitude: 40.3833, longitude: 28.8833 },
      { name: 'İnegöl', latitude: 40.0833, longitude: 29.5167 },
    ],
  },
  {
    name: 'Antalya',
    country: 'Türkiye',
    latitude: 36.8969,
    longitude: 30.7133,
    districts: [
      { name: 'Muratpaşa', latitude: 36.8833, longitude: 30.7000 },
      { name: 'Kepez', latitude: 36.9500, longitude: 30.7167 },
      { name: 'Konyaaltı', latitude: 36.8667, longitude: 30.6333 },
      { name: 'Aksu', latitude: 36.9333, longitude: 30.8333 },
      { name: 'Döşemealtı', latitude: 37.0333, longitude: 30.6000 },
      { name: 'Alanya', latitude: 36.5500, longitude: 32.0000 },
      { name: 'Manavgat', latitude: 36.7833, longitude: 31.4333 },
      { name: 'Serik', latitude: 36.9167, longitude: 31.1000 },
    ],
  },
  { name: 'Adana', country: 'Türkiye', latitude: 37.0000, longitude: 35.3213 },
  { name: 'Konya', country: 'Türkiye', latitude: 37.8746, longitude: 32.4932 },
  { name: 'Gaziantep', country: 'Türkiye', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Şanlıurfa', country: 'Türkiye', latitude: 37.1674, longitude: 38.7955 },
  { name: 'Kayseri', country: 'Türkiye', latitude: 38.7312, longitude: 35.4787 },
  { name: 'Diyarbakır', country: 'Türkiye', latitude: 37.9144, longitude: 40.2306 },
  { name: 'Mersin', country: 'Türkiye', latitude: 36.8121, longitude: 34.6415 },
  { name: 'Eskişehir', country: 'Türkiye', latitude: 39.7767, longitude: 30.5206 },
  { name: 'Samsun', country: 'Türkiye', latitude: 41.2867, longitude: 36.3300 },
  { name: 'Denizli', country: 'Türkiye', latitude: 37.7765, longitude: 29.0864 },
  { name: 'Sakarya', country: 'Türkiye', latitude: 40.7569, longitude: 30.3781 },
  { name: 'Trabzon', country: 'Türkiye', latitude: 41.0027, longitude: 39.7168 },
  { name: 'Erzurum', country: 'Türkiye', latitude: 39.9043, longitude: 41.2679 },
  { name: 'Van', country: 'Türkiye', latitude: 38.5012, longitude: 43.4089 },
  { name: 'Malatya', country: 'Türkiye', latitude: 38.3552, longitude: 38.3095 },
  { name: 'Elazığ', country: 'Türkiye', latitude: 38.6810, longitude: 39.2264 },
  { name: 'Kocaeli', country: 'Türkiye', latitude: 40.8533, longitude: 29.8815 },
  { name: 'Tekirdağ', country: 'Türkiye', latitude: 40.9833, longitude: 27.5167 },
  { name: 'Manisa', country: 'Türkiye', latitude: 38.6191, longitude: 27.4289 },
  { name: 'Balıkesir', country: 'Türkiye', latitude: 39.6484, longitude: 27.8826 },
  { name: 'Kahramanmaraş', country: 'Türkiye', latitude: 37.5847, longitude: 36.9371 },
  { name: 'Hatay', country: 'Türkiye', latitude: 36.4018, longitude: 36.3498 },
  { name: 'Aydın', country: 'Türkiye', latitude: 37.8560, longitude: 27.8416 },
  { name: 'Muğla', country: 'Türkiye', latitude: 37.2153, longitude: 28.3636 },
];

// Uluslararası şehirler
const INTERNATIONAL_CITIES: CityData[] = [
  { name: 'Mekke', country: 'Suudi Arabistan', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Medine', country: 'Suudi Arabistan', latitude: 24.5247, longitude: 39.5692 },
  { name: 'Kudüs', country: 'Filistin', latitude: 31.7683, longitude: 35.2137 },
  { name: 'Berlin', country: 'Almanya', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Londra', country: 'İngiltere', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', country: 'Fransa', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Amsterdam', country: 'Hollanda', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Brüksel', country: 'Belçika', latitude: 50.8503, longitude: 4.3517 },
  { name: 'Viyana', country: 'Avusturya', latitude: 48.2082, longitude: 16.3738 },
  { name: 'New York', country: 'ABD', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Toronto', country: 'Kanada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Sidney', country: 'Avustralya', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Dubai', country: 'BAE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Doha', country: 'Katar', latitude: 25.2854, longitude: 51.5310 },
];

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  currentLocation: Location | null;
}

type ViewMode = 'cities' | 'districts';

interface ListItem {
  id: string;
  name: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  hasDistricts?: boolean;
  cityData?: CityData;
}

export function LocationPickerModal({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
}: LocationPickerModalProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cities');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const { setLocationMode } = useSettingsStore();

  // Tema bazlı renkler
  const modalBgColor = theme.dark ? '#0a0a0a' : '#ffffff';
  const textColor = theme.dark ? '#fff' : '#1a1a1a';
  const subtextColor = theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderColor = theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const cardBgColor = theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const inputBgColor = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconColor = theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const buttonBgColor = theme.dark ? '#E5E5E5' : 'rgba(0,0,0,0.08)';
  const buttonIconColor = theme.dark ? '#1a1a1a' : '#1a1a1a';

  // Liste elemanlarını oluştur
  useEffect(() => {
    if (viewMode === 'cities') {
      const allCities = [...TURKEY_CITIES, ...INTERNATIONAL_CITIES];
      let items: ListItem[] = allCities.map(city => ({
        id: `${city.name}-${city.country}`,
        name: city.name,
        subtitle: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
        hasDistricts: !!(city.districts && city.districts.length > 0),
        cityData: city,
      }));

      // Arama filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        items = items.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(query))
        );
      }

      setListItems(items);
    } else if (viewMode === 'districts' && selectedCity?.districts) {
      let items: ListItem[] = [
        // Önce şehir merkezini ekle
        {
          id: `${selectedCity.name}-merkez`,
          name: `${selectedCity.name} (Merkez)`,
          subtitle: selectedCity.country,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          hasDistricts: false,
        },
        // Sonra ilçeleri ekle
        ...selectedCity.districts.map(district => ({
          id: `${selectedCity.name}-${district.name}`,
          name: district.name,
          subtitle: selectedCity.name,
          latitude: district.latitude,
          longitude: district.longitude,
          hasDistricts: false,
        })),
      ];

      // Arama filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item => item.name.toLowerCase().includes(query));
      }

      setListItems(items);
    }
  }, [searchQuery, viewMode, selectedCity]);

  // Modal kapandığında state'i sıfırla
  useEffect(() => {
    if (!visible) {
      setViewMode('cities');
      setSelectedCity(null);
      setSearchQuery('');
    }
  }, [visible]);

  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Konum izni verilmedi');
        setIsLoadingGPS(false);
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      let city = '';
      let country = '';
      let district = '';

      try {
        const geocode = await ExpoLocation.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          district = geocode[0].subregion || geocode[0].district || '';
          city = geocode[0].city || geocode[0].region || '';
          country = geocode[0].country || '';
        }
      } catch (e) {
        city = 'Mevcut Konum';
      }

      const displayCity = district ? `${district}, ${city}` : city;

      const newLocation: Location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: displayCity,
        country,
      };

      setLocationMode('auto');
      onLocationSelect(newLocation);
      onClose();
    } catch (error) {
      alert('Konum alınamadı');
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleItemSelect = (item: ListItem) => {
    // İlçesi olan bir şehirse ilçe listesine git
    if (item.hasDistricts && item.cityData) {
      setSelectedCity(item.cityData);
      setViewMode('districts');
      setSearchQuery('');
      return;
    }

    // Değilse konumu seç
    const cityName = viewMode === 'districts' && selectedCity
      ? (item.name.includes('Merkez') ? selectedCity.name : `${item.name}, ${selectedCity.name}`)
      : item.name;

    const newLocation: Location = {
      latitude: item.latitude,
      longitude: item.longitude,
      city: cityName,
      country: item.subtitle || '',
    };

    setLocationMode('manual');
    onLocationSelect(newLocation);
    onClose();
  };

  const handleBackPress = () => {
    setViewMode('cities');
    setSelectedCity(null);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    const isSelected =
      currentLocation?.latitude === item.latitude &&
      currentLocation?.longitude === item.longitude;

    return (
      <TouchableOpacity
        style={[
          styles.cityItem,
          { backgroundColor: cardBgColor },
          isSelected && styles.cityItemSelected,
        ]}
        onPress={() => handleItemSelect(item)}
      >
        <View style={styles.cityInfo}>
          <Text style={[styles.cityName, { color: textColor }]}>{item.name}</Text>
          {item.subtitle && (
            <Text style={[styles.cityCountry, { color: subtextColor }]}>{item.subtitle}</Text>
          )}
        </View>
        {item.hasDistricts ? (
          <Icon name="chevron-right" size={22} color={iconColor} />
        ) : isSelected ? (
          <Icon name="check-circle" size={22} color="#4CAF50" />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: modalBgColor }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            {viewMode === 'districts' ? (
              <TouchableOpacity onPress={handleBackPress} style={[styles.closeButton, { backgroundColor: buttonBgColor }]}>
                <Icon name="arrow-left" size={24} color={buttonIconColor} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: buttonBgColor }]}>
                <Icon name="close" size={24} color={buttonIconColor} />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: textColor }]}>
              {viewMode === 'districts' && selectedCity
                ? `${selectedCity.name} - İlçe Seç`
                : 'Konum Seç'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* GPS ile Konum Al - sadece şehir listesinde göster */}
          {viewMode === 'cities' && (
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGPSLocation}
              disabled={isLoadingGPS}
            >
              {isLoadingGPS ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Icon name="crosshairs-gps" size={24} color="#4CAF50" />
              )}
              <Text style={styles.gpsButtonText}>
                {isLoadingGPS ? 'Konum alınıyor...' : 'Mevcut Konumumu Kullan'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Arama */}
          <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
            <Icon name="magnify" size={22} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder={viewMode === 'districts' ? 'İlçe ara...' : 'Şehir ara...'}
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Bölüm Başlığı */}
          <Text style={[styles.sectionTitle, { color: subtextColor }]}>
            {searchQuery
              ? 'Arama Sonuçları'
              : viewMode === 'districts'
              ? 'İlçeler'
              : 'Şehirler'}
          </Text>

          {/* Liste */}
          <FlatList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="map-marker-off" size={48} color={iconColor} />
                <Text style={[styles.emptyText, { color: subtextColor }]}>
                  {viewMode === 'districts' ? 'İlçe bulunamadı' : 'Şehir bulunamadı'}
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  gpsButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  cityItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityCountry: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: spacing.sm,
  },
});

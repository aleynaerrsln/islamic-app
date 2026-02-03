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
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { spacing, borderRadius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import { turkeyLocations, City, District } from '../data/turkeyLocations';
import type { Location } from '../types';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  currentLocation: Location | null;
}

type ViewMode = 'cities' | 'districts';

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
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
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

  // Filtrelenmiş şehirler
  const filteredCities = turkeyLocations.cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrelenmiş ilçeler
  const filteredDistricts = selectedCity?.districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      let country = 'Türkiye';
      let district = '';

      try {
        const geocode = await ExpoLocation.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          district = geocode[0].subregion || geocode[0].district || '';
          city = geocode[0].city || geocode[0].region || '';
          country = geocode[0].country || 'Türkiye';
        }
      } catch (e) {
        city = 'Mevcut Konum';
      }

      const displayCity = district ? `${city} - ${district}` : city;

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

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setViewMode('districts');
    setSearchQuery('');
  };

  const handleDistrictSelect = (district: District) => {
    const newLocation: Location = {
      latitude: district.latitude,
      longitude: district.longitude,
      city: `${selectedCity?.name} - ${district.name}`,
      country: 'Türkiye',
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

  const renderCityItem = ({ item }: { item: City }) => {
    return (
      <TouchableOpacity
        style={[styles.cityItem, { backgroundColor: cardBgColor }]}
        onPress={() => handleCitySelect(item)}
      >
        <View style={styles.cityInfo}>
          <Icon name="map-marker" size={20} color={theme.dark ? '#E5E5E5' : '#2c3e50'} style={{ marginRight: 12 }} />
          <Text style={[styles.cityName, { color: textColor }]}>{item.name}</Text>
        </View>
        <Icon name="chevron-right" size={22} color={iconColor} />
      </TouchableOpacity>
    );
  };

  const renderDistrictItem = ({ item }: { item: District }) => {
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
        onPress={() => handleDistrictSelect(item)}
      >
        <View style={styles.cityInfo}>
          <Icon name="home-city" size={20} color={theme.dark ? '#E5E5E5' : '#2c3e50'} style={{ marginRight: 12 }} />
          <Text style={[styles.cityName, { color: textColor }]}>{item.name}</Text>
        </View>
        {isSelected && <Icon name="check-circle" size={22} color="#4CAF50" />}
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
                : 'İl Seçin'}
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

          {/* Seçili İl Badge - ilçe listesinde göster */}
          {viewMode === 'districts' && selectedCity && (
            <View style={[styles.selectedCityBadge, { backgroundColor: theme.dark ? 'rgba(229,229,229,0.15)' : 'rgba(44,62,80,0.15)' }]}>
              <Icon name="map-marker-check" size={16} color={theme.dark ? '#E5E5E5' : '#2c3e50'} />
              <Text style={[styles.selectedCityText, { color: theme.dark ? '#E5E5E5' : '#2c3e50' }]}>{selectedCity.name}</Text>
            </View>
          )}

          {/* Arama */}
          <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
            <Icon name="magnify" size={22} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder={viewMode === 'districts' ? 'İlçe ara...' : 'İl ara...'}
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
              : 'İller'}
          </Text>

          {/* Liste */}
          {viewMode === 'cities' ? (
            <FlatList
              data={filteredCities}
              renderItem={renderCityItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="map-marker-off" size={48} color={iconColor} />
                  <Text style={[styles.emptyText, { color: subtextColor }]}>
                    İl bulunamadı
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={filteredDistricts}
              renderItem={renderDistrictItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="map-marker-off" size={48} color={iconColor} />
                  <Text style={[styles.emptyText, { color: subtextColor }]}>
                    İlçe bulunamadı
                  </Text>
                </View>
              }
            />
          )}
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
  selectedCityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: spacing.md,
    gap: 6,
  },
  selectedCityText: {
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
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

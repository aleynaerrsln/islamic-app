import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { spacing } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';

const { width, height } = Dimensions.get('window');

interface Mosque {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  address?: string;
}

export function MosqueFinderScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [showList, setShowList] = useState(false);

  const [region, setRegion] = useState<Region>({
    latitude: 41.0082, // İstanbul varsayılan
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Konum izni verilmedi. Yakın camileri bulmak için konum izni gereklidir.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);

      // Yakındaki camileri bul
      await findNearbyMosques(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } catch (err) {
      setError('Konum alınamadı. Lütfen konum servislerinizi kontrol edin.');
      console.log('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const findNearbyMosques = async (lat: number, lng: number) => {
    try {
      // OpenStreetMap Overpass API kullanarak camileri bul
      const radius = 5000; // 5km yarıçap
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
          node["building"="mosque"](around:${radius},${lat},${lng});
          way["building"="mosque"](around:${radius},${lat},${lng});
        );
        out center;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('API hatası');
      }

      const data = await response.json();

      const mosquesData: Mosque[] = data.elements
        .map((element: any, index: number) => {
          const mosLat = element.lat || element.center?.lat;
          const mosLng = element.lon || element.center?.lon;

          if (!mosLat || !mosLng) return null;

          const distance = calculateDistance(lat, lng, mosLat, mosLng);

          return {
            id: element.id?.toString() || `mosque-${index}`,
            name: element.tags?.name || 'Cami',
            latitude: mosLat,
            longitude: mosLng,
            distance,
            address: element.tags?.['addr:street'] || element.tags?.['addr:full'] || '',
          };
        })
        .filter((m: Mosque | null): m is Mosque => m !== null)
        .sort((a: Mosque, b: Mosque) => (a.distance || 0) - (b.distance || 0));

      setMosques(mosquesData);

      if (mosquesData.length === 0) {
        setError('Yakınınızda cami bulunamadı. Arama yarıçapı: 5km');
      }
    } catch (err) {
      console.log('Mosque search error:', err);
      // Hata durumunda örnek veriler göster
      setMosques([]);
      setError('Camiler yüklenirken bir hata oluştu. İnternet bağlantınızı kontrol edin.');
    }
  };

  // İki nokta arasındaki mesafeyi hesapla (Haversine formülü)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Seçili camiye git
  const goToMosque = (mosque: Mosque) => {
    setSelectedMosque(mosque);
    setShowList(false);

    mapRef.current?.animateToRegion(
      {
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500
    );
  };

  // Yol tarifi aç
  const openDirections = (mosque: Mosque) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `maps:?daddr=${mosque.latitude},${mosque.longitude}&dirflg=w`,
      android: `geo:${mosque.latitude},${mosque.longitude}?q=${mosque.latitude},${mosque.longitude}(${encodeURIComponent(mosque.name)})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Google Maps'i dene
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
        Linking.openURL(googleMapsUrl);
      });
    }
  };

  // Konumuma git
  const goToMyLocation = () => {
    if (location) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  // Mesafe formatla
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Loading durumu
  if (loading) {
    return (
      <BackgroundWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Konumunuz alınıyor...</Text>
          <Text style={styles.loadingSubtext}>Yakındaki camiler aranıyor</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <View style={styles.container}>
      {/* Harita */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Cami işaretleri */}
        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            coordinate={{
              latitude: mosque.latitude,
              longitude: mosque.longitude,
            }}
            title={mosque.name}
            description={mosque.distance ? `${formatDistance(mosque.distance)} uzaklıkta` : ''}
            onPress={() => setSelectedMosque(mosque)}
          >
            <View style={[
              styles.markerContainer,
              selectedMosque?.id === mosque.id && styles.markerSelected
            ]}>
              <Icon name="mosque" size={24} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="mosque" size={24} color="#4CAF50" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Cami Bul</Text>
            <Text style={styles.headerSubtitle}>
              {mosques.length > 0
                ? `${mosques.length} cami bulundu`
                : 'Yakındaki camiler aranıyor...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Hata mesajı */}
      {error && (
        <View style={styles.errorCard}>
          <Icon name="alert-circle-outline" size={20} color="#FF9800" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.retryButton}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Kontrol butonları */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={goToMyLocation}
        >
          <Icon name="crosshairs-gps" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={getCurrentLocation}
        >
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.listButton]}
          onPress={() => setShowList(!showList)}
        >
          <Icon name={showList ? 'map' : 'format-list-bulleted'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Seçili cami kartı */}
      {selectedMosque && !showList && (
        <View style={styles.selectedMosqueCard}>
          <View style={styles.selectedMosqueHeader}>
            <View style={styles.mosqueIconContainer}>
              <Icon name="mosque" size={24} color="#4CAF50" />
            </View>
            <View style={styles.selectedMosqueInfo}>
              <Text style={styles.selectedMosqueName} numberOfLines={1}>
                {selectedMosque.name}
              </Text>
              {selectedMosque.distance && (
                <Text style={styles.selectedMosqueDistance}>
                  {formatDistance(selectedMosque.distance)} uzaklıkta
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setSelectedMosque(null)}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => openDirections(selectedMosque)}
          >
            <Icon name="directions" size={20} color="#fff" />
            <Text style={styles.directionsText}>Yol Tarifi Al</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cami listesi */}
      {showList && (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Yakındaki Camiler</Text>
            <TouchableOpacity onPress={() => setShowList(false)}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {mosques.length === 0 ? (
              <View style={styles.emptyList}>
                <Icon name="mosque" size={48} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>Yakında cami bulunamadı</Text>
              </View>
            ) : (
              mosques.map((mosque, index) => (
                <TouchableOpacity
                  key={mosque.id}
                  style={styles.listItem}
                  onPress={() => goToMosque(mosque)}
                >
                  <View style={styles.listItemLeft}>
                    <View style={styles.listItemRank}>
                      <Text style={styles.listItemRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.listItemInfo}>
                      <Text style={styles.listItemName} numberOfLines={1}>
                        {mosque.name}
                      </Text>
                      {mosque.address && (
                        <Text style={styles.listItemAddress} numberOfLines={1}>
                          {mosque.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemDistance}>
                      {mosque.distance ? formatDistance(mosque.distance) : '-'}
                    </Text>
                    <TouchableOpacity
                      style={styles.listItemDirections}
                      onPress={() => openDirections(mosque)}
                    >
                      <Icon name="directions" size={18} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  map: {
    flex: 1,
  },

  // Header
  header: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    padding: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Error
  errorCard: {
    position: 'absolute',
    top: 130,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Controls
  controlsContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 140,
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listButton: {
    backgroundColor: '#4CAF50',
  },

  // Marker
  markerContainer: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerSelected: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },

  // Selected mosque card
  selectedMosqueCard: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 16,
    padding: spacing.md,
  },
  selectedMosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mosqueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectedMosqueInfo: {
    flex: 1,
  },
  selectedMosqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  selectedMosqueDistance: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  directionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // List
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  listScroll: {
    flex: 1,
    padding: spacing.md,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  listItemRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  listItemAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listItemDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  listItemDirections: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

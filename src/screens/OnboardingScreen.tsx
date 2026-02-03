import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, Modal, Image, Alert } from 'react-native';
import { Text, Button, useTheme, RadioButton, ActivityIndicator, Searchbar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { spacing, borderRadius } from '../theme';
import { turkeyLocations, City, District } from '../data/turkeyLocations';
import { getPrayerTimesByCoordinates } from '../api/aladhan';
import { useSettingsStore } from '../store/settingsStore';
import { PrayerTimes } from '../types';
import { privacyPolicy, termsOfService } from '../data/legalTexts';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'location' | 'city' | 'district' | 'preview' | 'notifications' | 'privacy';

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const theme = useTheme();
  const { setLocation, setLocationMode, setNotificationsEnabled } = useSettingsStore();

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<{
    city: string;
    district: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const totalSteps = 7;
  const currentStepNumber =
    currentStep === 'welcome' ? 1 :
    currentStep === 'location' ? 2 :
    currentStep === 'city' ? 3 :
    currentStep === 'district' ? 4 :
    currentStep === 'preview' ? 5 :
    currentStep === 'notifications' ? 6 :
    currentStep === 'privacy' ? 7 : 1;

  // Namaz vakitlerini çek
  const fetchPrayerTimes = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await getPrayerTimesByCoordinates(lat, lng);
      if (response.data) {
        setPrayerTimes(response.data.timings);
      }
    } catch (error) {
      console.error('Namaz vakitleri alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // İlçe seçildiğinde
  useEffect(() => {
    if (selectedDistrict) {
      fetchPrayerTimes(selectedDistrict.latitude, selectedDistrict.longitude);
    }
  }, [selectedDistrict]);

  const handleLocationComplete = () => {
    if (autoDetectedLocation) {
      // Otomatik konum kullanılıyor
      setLocation({
        latitude: autoDetectedLocation.latitude,
        longitude: autoDetectedLocation.longitude,
        city: autoDetectedLocation.district
          ? `${autoDetectedLocation.city} - ${autoDetectedLocation.district}`
          : autoDetectedLocation.city,
      });
      setLocationMode('auto');
      setCurrentStep('notifications');
    } else if (selectedDistrict && selectedCity) {
      // Manuel seçim kullanılıyor
      setLocation({
        latitude: selectedDistrict.latitude,
        longitude: selectedDistrict.longitude,
        city: `${selectedCity.name} - ${selectedDistrict.name}`,
      });
      setLocationMode('manual');
      setCurrentStep('notifications');
    }
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setNotificationsEnabled(true);
    }
    setCurrentStep('privacy');
  };

  const skipNotifications = () => {
    setNotificationsEnabled(false);
    setCurrentStep('privacy');
  };

  const handlePrivacyComplete = () => {
    if (privacyAccepted && termsAccepted) {
      onComplete();
    }
  };

  // Otomatik konum belirleme
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli',
          'Konumunuzu otomatik belirlemek için konum iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        setIsDetectingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocoding ile şehir adını al
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode) {
        const cityName = geocode.city || geocode.subregion || geocode.region || 'Bilinmeyen';
        const districtName = geocode.district || geocode.subregion || '';

        // Otomatik konum bilgisini kaydet
        setAutoDetectedLocation({
          city: cityName,
          district: districtName,
          latitude,
          longitude,
        });

        // Namaz vakitlerini çek ve önizleme sayfasına git
        await fetchPrayerTimes(latitude, longitude);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('Konum alınamadı:', error);
      Alert.alert(
        'Konum Alınamadı',
        'Konumunuz otomatik olarak belirlenemedi. Lütfen manuel olarak seçin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Filtrelenmiş şehirler
  const filteredCities = turkeyLocations.cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrelenmiş ilçeler
  const filteredDistricts = selectedCity?.districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const canGoBack = currentStep !== 'welcome';

  // Geri gitme fonksiyonu
  const goBack = () => {
    switch (currentStep) {
      case 'location':
        setCurrentStep('welcome');
        break;
      case 'city':
        setAutoDetectedLocation(null); // Otomatik konumu temizle
        setCurrentStep('location');
        break;
      case 'district':
        setSearchQuery('');
        setCurrentStep('city');
        break;
      case 'preview':
        setSearchQuery('');
        if (autoDetectedLocation) {
          // Otomatik konumdan geldiyse, konum seçim sayfasına dön
          setAutoDetectedLocation(null);
          setCurrentStep('location');
        } else {
          // Manuel seçimden geldiyse, ilçe seçimine dön
          setCurrentStep('district');
        }
        break;
      case 'notifications':
        setCurrentStep('preview');
        break;
      case 'privacy':
        setCurrentStep('notifications');
        break;
    }
  };

  // Header with back button
  const renderHeader = (showBack: boolean = true) => (
    <View style={styles.headerContainer}>
      {showBack && canGoBack ? (
        <TouchableOpacity
          onPress={goBack}
          style={[styles.headerBackButton, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerBackPlaceholder} />
      )}
    </View>
  );

  // Welcome Screen
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      {renderHeader(false)}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
        Hoşgeldiniz...
      </Text>

      <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Uygulamada gerekli olan birkaç ayar ile başlayacağız ve yaklaşık bir dakika içinde bitireceğiz.
      </Text>

      <View style={styles.spacer} />

      <Button
        mode="contained"
        onPress={() => setCurrentStep('location')}
        style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }]}
        contentStyle={styles.buttonContent}
        labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
      >
        Başla
      </Button>
    </View>
  );

  // Location Method Selection
  const renderLocationMethod = () => (
    <View style={styles.stepContainer}>
      {renderHeader()}
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Konumunuzu Belirleyin
      </Text>

      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Konum bilginiz gizliliğinize saygı duyularak yalnızca uygulama içinde kullanılır.
      </Text>

      <View style={styles.spacer} />

      {/* Otomatik Konum Butonu */}
      <Button
        mode="contained"
        onPress={detectLocation}
        style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#253240', marginBottom: spacing.md }]}
        contentStyle={styles.buttonContent}
        labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
        icon="crosshairs-gps"
        loading={isDetectingLocation}
        disabled={isDetectingLocation}
      >
        {isDetectingLocation ? 'Konum Belirleniyor...' : 'Otomatik Bul'}
      </Button>

      {/* Ayırıcı */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]} />
        <Text style={[styles.dividerText, { color: theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>veya</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]} />
      </View>

      {/* Manuel Seçim Butonu */}
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setCurrentStep('city');
        }}
        style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }]}
        contentStyle={styles.buttonContent}
        labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
        icon="format-list-bulleted"
      >
        Listeden Seç
      </Button>
    </View>
  );

  // City Selection
  const renderCitySelection = () => (
    <View style={styles.stepContainer}>
      {renderHeader()}
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        İl Seçin
      </Text>

      <View style={[styles.modernSearchContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <Icon name="magnify" size={20} color={theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ marginRight: 8 }} />
        <Searchbar
          placeholder="İl ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.modernSearchBar}
          inputStyle={[styles.modernSearchInput, { color: theme.colors.onBackground }]}
          iconColor="transparent"
          placeholderTextColor={theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
        />
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredCities.map((city) => (
          <TouchableOpacity
            key={city.id}
            style={[styles.modernListItem, { borderBottomColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}
            onPress={() => {
              setSelectedCity(city);
              setSearchQuery('');
              setCurrentStep('district');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.listItemContent}>
              <View style={styles.listItemIcon}>
                <Icon name="map-marker" size={20} color={theme.dark ? '#E5E5E5' : '#2c3e50'} />
              </View>
              <Text style={[styles.listItemText, { color: theme.colors.onBackground }]}>{city.name}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // District Selection
  const renderDistrictSelection = () => (
    <View style={styles.stepContainer}>
      {renderHeader()}
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        İlçe Seçin
      </Text>

      <View style={[styles.selectedCityBadge, { backgroundColor: theme.dark ? 'rgba(229,229,229,0.15)' : 'rgba(44,62,80,0.15)' }]}>
        <Icon name="map-marker-check" size={16} color={theme.dark ? '#E5E5E5' : '#2c3e50'} />
        <Text style={[styles.selectedCityText, { color: theme.dark ? '#E5E5E5' : '#2c3e50' }]}>{selectedCity?.name}</Text>
      </View>

      <View style={[styles.modernSearchContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <Icon name="magnify" size={20} color={theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ marginRight: 8 }} />
        <Searchbar
          placeholder="İlçe ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.modernSearchBar}
          inputStyle={[styles.modernSearchInput, { color: theme.colors.onBackground }]}
          iconColor="transparent"
          placeholderTextColor={theme.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
        />
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredDistricts.map((district) => (
          <TouchableOpacity
            key={district.id}
            style={[styles.modernListItem, { borderBottomColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}
            onPress={() => {
              setSelectedDistrict(district);
              setSearchQuery('');
              setCurrentStep('preview');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.listItemContent}>
              <View style={styles.listItemIcon}>
                <Icon name="home-city" size={20} color={theme.dark ? '#E5E5E5' : '#2c3e50'} />
              </View>
              <Text style={[styles.listItemText, { color: theme.colors.onBackground }]}>{district.name}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Preview with Prayer Times
  const renderPreview = () => {
    // Konum bilgisini belirle (otomatik veya manuel)
    const locationDisplay = autoDetectedLocation
      ? {
          city: autoDetectedLocation.city,
          district: autoDetectedLocation.district,
          isAuto: true,
        }
      : selectedCity && selectedDistrict
      ? {
          city: selectedCity.name,
          district: selectedDistrict.name,
          isAuto: false,
        }
      : null;

    return (
      <View style={styles.stepContainer}>
        {renderHeader()}
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Konum Onayı
        </Text>

        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {locationDisplay?.isAuto
            ? 'Otomatik belirlenen konum ve namaz vakitleri aşağıda gösterilmektedir.'
            : 'Seçtiğiniz konum ve namaz vakitleri aşağıda gösterilmektedir.'}
        </Text>

        {/* Seçilen/Belirlenen Konum ve Namaz Vakitleri */}
        {locationDisplay && (
          <View style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
            {locationDisplay.isAuto && (
              <View style={styles.autoLocationBadge}>
                <Icon name="crosshairs-gps" size={14} color="#2c3e50" />
                <Text style={styles.autoLocationBadgeText}>Otomatik Konum</Text>
              </View>
            )}
            <Text variant="titleMedium" style={[styles.locationText, { color: theme.colors.onSurface }]}>
              TÜRKİYE - {locationDisplay.city.toUpperCase()}
              {locationDisplay.district ? ` - ${locationDisplay.district.toUpperCase()}` : ''}
            </Text>

            {isLoading ? (
              <ActivityIndicator style={{ marginTop: spacing.md }} />
            ) : prayerTimes ? (
              <View style={styles.prayerTimesRow}>
                <View style={styles.prayerTimeItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>İmsak</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{prayerTimes.Fajr}</Text>
                </View>
                <View style={styles.prayerTimeItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Öğle</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{prayerTimes.Dhuhr}</Text>
                </View>
                <View style={styles.prayerTimeItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>İkindi</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{prayerTimes.Asr}</Text>
                </View>
                <View style={styles.prayerTimeItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Akşam</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{prayerTimes.Maghrib}</Text>
                </View>
                <View style={styles.prayerTimeItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Yatsı</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{prayerTimes.Isha}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.spacer} />

        <Button
          mode="contained"
          onPress={handleLocationComplete}
          style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
          disabled={(!selectedDistrict && !autoDetectedLocation) || isLoading}
      >
          Devam Et
        </Button>
      </View>
    );
  };

  // Notification Permission Screen
  const renderNotifications = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();

    return (
      <View style={styles.stepContainer}>
        {renderHeader()}
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Ezan Alarmı
        </Text>

        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Vakitlerinde bildirim almak ister misiniz?
        </Text>

        {/* Notification Preview */}
        <View style={[styles.notificationPreview, { backgroundColor: '#1C1C1E' }]}>
          <Text style={styles.previewTime}>{hours}:{minutes}</Text>
          <Text style={styles.previewDate}>{dayName}, {date} {monthName}</Text>

          <View style={styles.notificationCard}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.notificationIconImage}
              resizeMode="cover"
            />
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationAppName}>Hatırlatıcı</Text>
                <Text style={styles.notificationTime}>şimdi</Text>
              </View>
              <Text style={styles.notificationTitle}>Öğle Ezanı Vakti</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <Button
          mode="contained"
          onPress={requestNotificationPermission}
          style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#253240', marginBottom: spacing.md }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : 'white' }]}
          icon="bell"
        >
          Ezan vaktinde bildirim al
        </Button>

        <Button
          mode="contained"
          onPress={skipNotifications}
          style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
        >
          Daha sonra ayarla
        </Button>
      </View>
    );
  };

  const showPolicy = (type: 'privacy' | 'terms') => {
    if (type === 'privacy') {
      setModalContent({ title: privacyPolicy.title, content: privacyPolicy.content });
    } else {
      setModalContent({ title: termsOfService.title, content: termsOfService.content });
    }
    setModalVisible(true);
  };

  // Privacy & Terms Screen
  const renderPrivacy = () => (
    <View style={styles.stepContainer}>
      {renderHeader()}
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Kullanım Koşulları
      </Text>

      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Uygulamayı kullanmak için aşağıdaki koşulları kabul etmeniz gerekmektedir.
      </Text>

      {/* Privacy Policy */}
      <TouchableOpacity
        style={[
          styles.agreementCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: privacyAccepted ? '#253240' : theme.colors.outlineVariant,
          }
        ]}
        onPress={() => setPrivacyAccepted(!privacyAccepted)}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: privacyAccepted ? (theme.dark ? '#E5E5E5' : '#253240') : 'transparent',
            borderColor: privacyAccepted ? (theme.dark ? '#E5E5E5' : '#253240') : theme.colors.outline,
          }
        ]}>
          {privacyAccepted && <Icon name="check" size={16} color={theme.dark ? '#1a1a1a' : 'white'} />}
        </View>
        <View style={styles.agreementContent}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Gizlilik Politikası
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            KVKK ve GDPR uyumluluğu için gerekli
          </Text>
        </View>
        <TouchableOpacity onPress={() => showPolicy('privacy')}>
          <Icon name="chevron-right" size={24} color={theme.colors.outline} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Terms of Service */}
      <TouchableOpacity
        style={[
          styles.agreementCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: termsAccepted ? '#253240' : theme.colors.outlineVariant,
          }
        ]}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: termsAccepted ? (theme.dark ? '#E5E5E5' : '#253240') : 'transparent',
            borderColor: termsAccepted ? (theme.dark ? '#E5E5E5' : '#253240') : theme.colors.outline,
          }
        ]}>
          {termsAccepted && <Icon name="check" size={16} color={theme.dark ? '#1a1a1a' : 'white'} />}
        </View>
        <View style={styles.agreementContent}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Kullanım Şartları
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Uygulama kullanım koşulları
          </Text>
        </View>
        <TouchableOpacity onPress={() => showPolicy('terms')}>
          <Icon name="chevron-right" size={24} color={theme.colors.outline} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <Button
        mode="contained"
        onPress={handlePrivacyComplete}
        style={[styles.button, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }]}
        contentStyle={styles.buttonContent}
        labelStyle={[styles.buttonLabel, { color: theme.dark ? '#1a1a1a' : '#fff' }]}
        disabled={!privacyAccepted || !termsAccepted}
        icon="check"
      >
        Tamamla
      </Button>

      {/* Policy Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.onBackground, flex: 1 }}>
              {modalContent?.title}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setModalVisible(false)}
            />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 24 }}>
              {modalContent?.content}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'location':
        return renderLocationMethod();
      case 'city':
        return renderCitySelection();
      case 'district':
        return renderDistrictSelection();
      case 'preview':
        return renderPreview();
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      default:
        return renderWelcome();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderCurrentStep()}

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepDotsContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                { backgroundColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
                step === currentStepNumber && [styles.stepDotActive, { backgroundColor: theme.dark ? '#E5E5E5' : '#2c3e50' }],
                step < currentStepNumber && [styles.stepDotCompleted, { backgroundColor: theme.dark ? 'rgba(229,229,229,0.5)' : 'rgba(44,62,80,0.5)' }],
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  button: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.full,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  methodButton: {
    borderRadius: borderRadius.full,
    minWidth: 130,
  },
  searchBar: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  listContainer: {
    flex: 1,
    marginTop: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modernListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  modernSearchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  modernSearchInput: {
  },
  selectedCityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(44,62,80,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: spacing.sm,
    gap: 6,
  },
  selectedCityText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: spacing.md,
  },
  previewCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  locationText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  autoLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: 4,
  },
  autoLocationBadgeText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '500',
  },
  prayerTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  prayerTimeItem: {
    alignItems: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    minHeight: 50,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackPlaceholder: {
    width: 40,
    height: 40,
  },
  stepDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    width: 24,
    backgroundColor: '#2c3e50',
  },
  stepDotCompleted: {
    backgroundColor: 'rgba(44,62,80,0.5)',
  },
  notificationPreview: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  previewTime: {
    fontSize: 48,
    fontWeight: '200',
    color: 'white',
  },
  previewDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationIconImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationAppName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  notificationTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  agreementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  agreementContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
});

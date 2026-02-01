import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, Modal } from 'react-native';
import { Text, Button, useTheme, RadioButton, ActivityIndicator, Searchbar, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
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
    if (selectedDistrict && selectedCity) {
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

  // Filtrelenmiş şehirler
  const filteredCities = turkeyLocations.cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrelenmiş ilçeler
  const filteredDistricts = selectedCity?.districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Welcome Screen
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.logoContainer}>
        <View style={[styles.logoBox, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.logoPlaceholder}>
            <View style={styles.minaret} />
            <View style={styles.dome}>
              <View style={styles.crescent} />
            </View>
            <View style={styles.minaret} />
          </View>
        </View>
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
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Başla
      </Button>
    </View>
  );

  // Location Method Selection
  const renderLocationMethod = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Konumunuzu Belirleyin
      </Text>

      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Konum bilginiz gizliliğinize saygı duyularak yalnızca uygulama içinde kullanılır.
        Lütfen konumunuzu listeden seçin.
      </Text>

      <View style={styles.spacer} />

      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setCurrentStep('city');
        }}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Konum Seç
      </Button>
    </View>
  );

  // City Selection
  const renderCitySelection = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        İl Seçin
      </Text>

      <Searchbar
        placeholder="İl ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredCities.map((city) => (
          <TouchableOpacity
            key={city.id}
            style={[
              styles.listItem,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }
            ]}
            onPress={() => {
              setSelectedCity(city);
              setSearchQuery('');
              setCurrentStep('district');
            }}
          >
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {city.name}
            </Text>
            <Icon name="chevron-right" size={24} color={theme.colors.outline} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Button
        mode="text"
        onPress={() => setCurrentStep('location')}
        style={styles.backButton}
      >
        Geri
      </Button>
    </View>
  );

  // District Selection
  const renderDistrictSelection = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        İlçe Seçin
      </Text>

      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
        {selectedCity?.name}
      </Text>

      <Searchbar
        placeholder="İlçe ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredDistricts.map((district) => (
          <TouchableOpacity
            key={district.id}
            style={[
              styles.listItem,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }
            ]}
            onPress={() => {
              setSelectedDistrict(district);
              setSearchQuery('');
              setCurrentStep('preview');
            }}
          >
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {district.name}
            </Text>
            <Icon name="chevron-right" size={24} color={theme.colors.outline} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Button
        mode="text"
        onPress={() => {
          setSearchQuery('');
          setCurrentStep('city');
        }}
        style={styles.backButton}
      >
        Geri
      </Button>
    </View>
  );

  // Preview with Prayer Times
  const renderPreview = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Konum Onayı
      </Text>

      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Seçtiğiniz konum ve namaz vakitleri aşağıda gösterilmektedir.
      </Text>

      {/* Seçilen Konum ve Namaz Vakitleri */}
      {selectedCity && selectedDistrict && (
        <View style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.locationText, { color: theme.colors.onSurface }]}>
            TÜRKİYE - {selectedCity.name.toUpperCase()} - {selectedDistrict.name.toUpperCase()}
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
        mode="text"
        onPress={() => {
          setSearchQuery('');
          setCurrentStep('city');
        }}
        style={{ marginBottom: spacing.sm }}
      >
        Konumu Değiştir
      </Button>

      <Button
        mode="contained"
        onPress={handleLocationComplete}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        disabled={!selectedDistrict || isLoading}
      >
        Devam Et
      </Button>
    </View>
  );

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
            <View style={[styles.notificationIcon, { backgroundColor: theme.colors.primary }]}>
              <Icon name="mosque" size={20} color="white" />
            </View>
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
          style={[styles.button, { backgroundColor: '#FF9500' }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
        >
          Ezan vaktinde bildirim al
        </Button>

        <Button
          mode="contained"
          onPress={skipNotifications}
          style={[styles.button, { backgroundColor: '#007AFF', marginTop: spacing.sm }]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
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
            borderColor: privacyAccepted ? theme.colors.primary : theme.colors.outlineVariant,
          }
        ]}
        onPress={() => setPrivacyAccepted(!privacyAccepted)}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: privacyAccepted ? '#4CAF50' : 'transparent',
            borderColor: privacyAccepted ? '#4CAF50' : theme.colors.outline,
          }
        ]}>
          {privacyAccepted && <Icon name="check" size={16} color="white" />}
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
            borderColor: termsAccepted ? theme.colors.primary : theme.colors.outlineVariant,
          }
        ]}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: termsAccepted ? '#4CAF50' : 'transparent',
            borderColor: termsAccepted ? '#4CAF50' : theme.colors.outline,
          }
        ]}>
          {termsAccepted && <Icon name="check" size={16} color="white" />}
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
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        disabled={!privacyAccepted || !termsAccepted}
      >
        Devam Et
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
      <View style={styles.stepIndicator}>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {currentStepNumber} / {totalSteps}
        </Text>
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
    paddingTop: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  minaret: {
    width: 12,
    height: 60,
    backgroundColor: 'white',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginHorizontal: 8,
  },
  dome: {
    width: 50,
    height: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    paddingTop: 4,
  },
  crescent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1B5E20',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
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

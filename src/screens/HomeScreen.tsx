import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useNotifications, scheduleRamadanMotivationNotifications, scheduleIftarReminderNotification, scheduleEidNotifications } from '../hooks/useNotifications';
import { useSettingsStore } from '../store/settingsStore';
import { PrayerTimesList } from '../components/PrayerTimeCard';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { MonthlyPrayerTimesModal } from '../components/MonthlyPrayerTimesModal';
import { HolidayCountdown } from '../components/HolidayCountdown';
import { DailyAyahCard, DailyHadisCard, DailyEsmaCard } from '../components/DailyContentCards';
import { EsmaUlHusnaModal } from '../components/EsmaUlHusnaModal';
import { LocationPickerModal } from '../components/LocationPickerModal';
import {
  getContextAwareDailyAyah,
  getContextAwareDailyHadis,
  getContextAwareDailyEsma,
} from '../utils/contextAwareContent';
import { spacing, borderRadius } from '../theme';
import { HIJRI_MONTHS, Location } from '../types';
// Firebase ve AdMob geçici olarak devre dışı - crash testi
// import { useAnalytics, AnalyticsEvents } from '../hooks/useAnalytics';
// import { BannerAdWrapper } from '../components/BannerAdWrapper';
// import { useAds } from '../services/adService';

export function HomeScreen() {
  const theme = useTheme();
  const { location, isLoading: locationLoading, error: locationError } = useLocation();
  const {
    prayerTimes,
    currentPrayer,
    nextPrayer,
    timeToNextPrayer,
    hijriDate,
    isLoading: prayerLoading,
    error: prayerError,
    refresh
  } = usePrayerTimes(location);

  const [dailyAyah, setDailyAyah] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyModalVisible, setMonthlyModalVisible] = useState(false);
  const [esmaModalVisible, setEsmaModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Bağlam farkında günlük içerikler (lokal veri - gece 00:00'da değişir)
  // Ramazan'da oruç/sabır, Cuma'da namaz, sıkıntılı günlerde teselli içerikleri
  const { hadis: dailyHadis } = getContextAwareDailyHadis();
  const { esma: dailyEsma } = getContextAwareDailyEsma();

  const { calculationMethod, setLocation: saveLocation, cardOpacity } = useSettingsStore();
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;

  // Aylık takvimi aç
  const openMonthlyCalendar = () => {
    setMonthlyModalVisible(true);
  };

  // Konum değiştiğinde kaydet ve yenile
  const handleLocationSelect = async (newLocation: Location) => {
    saveLocation(newLocation);
    // Namaz vakitlerini yenile
    setTimeout(() => {
      refresh();
    }, 100);
  };
  const { requestPermission, schedulePrayerNotifications } = useNotifications();

  // Bildirim izni ve günlük ayet
  useEffect(() => {
    requestPermission();
    loadDailyAyah();
  }, []);

  // Namaz vakitleri yüklenince bildirimleri planla
  useEffect(() => {
    if (prayerTimes) {
      schedulePrayerNotifications(prayerTimes);
      // Ramazan motivasyon bildirimlerini planla
      scheduleRamadanMotivationNotifications();
      // İftara 1 saat kala hatırlatma (Maghrib = iftar vakti)
      scheduleIftarReminderNotification(prayerTimes.Maghrib);
      // Bayram bildirimlerini planla
      scheduleEidNotifications();
    }
  }, [prayerTimes]);

  const loadDailyAyah = async () => {
    try {
      // Bağlam farkında ayet yükleme (Ramazan'da oruç ayetleri, Cuma'da dua ayetleri vs.)
      const { response } = await getContextAwareDailyAyah();
      if (response.data && response.data.length >= 2) {
        setDailyAyah({
          arabic: response.data[0].text,
          turkish: response.data[1].text,
          surah: response.data[0].surah?.englishName,
          ayah: response.data[0].numberInSurah,
        });
      }
    } catch (error) {
      console.log('Günlük ayet yüklenemedi');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadDailyAyah();
    setRefreshing(false);
  };

  // Türkçe gün ve ay isimleri
  const TURKISH_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const TURKISH_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // Miladi tarihi formatla: "01 Şubat 2026 Pazar"
  const formatGregorianDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = TURKISH_MONTHS[now.getMonth()];
    const year = now.getFullYear();
    const dayName = TURKISH_DAYS[now.getDay()];
    return `${day} ${month} ${year} ${dayName}`;
  };

  // Hicri tarihi formatla: "13 Şaban 1447"
  const formatHijriDate = () => {
    if (!hijriDate) return '';
    const monthName = HIJRI_MONTHS[hijriDate.month?.number] || hijriDate.month?.en;
    return `${hijriDate.day} ${monthName} ${hijriDate.year}`;
  };

  // Geri sayım formatla: "02:34:15"
  const formatTimeToNextPrayer = () => {
    if (!timeToNextPrayer || timeToNextPrayer <= 0) return '';

    const hours = Math.floor(timeToNextPrayer / 3600);
    const minutes = Math.floor((timeToNextPrayer % 3600) / 60);
    const seconds = timeToNextPrayer % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Yükleniyor durumu
  if (locationLoading || prayerLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md }}>
            {locationLoading ? 'Konum alınıyor...' : 'Namaz vakitleri yükleniyor...'}
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  // Hata durumu
  if (locationError || prayerError) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <Text style={{ color: theme.colors.error }}>
            {locationError || prayerError}
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Konum Header */}
        <TouchableOpacity
          style={[styles.locationHeader, { backgroundColor: cardBgColor }]}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.locationIconContainer}>
            <Icon name="map-marker" size={20} color="#4CAF50" />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationCity}>
              {location?.city || 'Konum Seçilmedi'}
            </Text>
            {location?.country && (
              <Text style={styles.locationCountry}>{location.country}</Text>
            )}
          </View>
          <Icon name="chevron-down" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Namaz Vakitleri ve Tarih */}
        {prayerTimes && (
          <PrayerTimesList
            prayerTimes={prayerTimes}
            currentPrayer={currentPrayer}
            nextPrayer={nextPrayer}
            gregorianDate={formatGregorianDate()}
            hijriDate={formatHijriDate()}
            timeToNextPrayer={formatTimeToNextPrayer()}
            onExpandPress={openMonthlyCalendar}
          />
        )}

        {/* Bayram ve Kandil Geri Sayımı */}
        <HolidayCountdown />

        {/* Günün Ayeti */}
        {dailyAyah && (
          <DailyAyahCard
            arabicText={dailyAyah.arabic}
            turkishText={dailyAyah.turkish}
            surahName={dailyAyah.surah}
            ayahNumber={dailyAyah.ayah}
          />
        )}

        {/* Günün Hadisi */}
        <DailyHadisCard
          hadisText={dailyHadis.turkish}
          arabicText={dailyHadis.arabic}
          source={dailyHadis.source}
          topic={dailyHadis.topic}
        />

        {/* Günün Esması */}
        <DailyEsmaCard
          number={dailyEsma.number}
          arabic={dailyEsma.arabic}
          turkish={dailyEsma.turkish}
          meaning={dailyEsma.meaning}
          color={dailyEsma.color}
          onExpandPress={() => setEsmaModalVisible(true)}
        />

        {/* Alt boşluk */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Aylık Namaz Vakitleri Modal */}
      <MonthlyPrayerTimesModal
        visible={monthlyModalVisible}
        onClose={() => setMonthlyModalVisible(false)}
        location={location}
        calculationMethod={calculationMethod}
      />

      {/* Esma-ül Hüsna Modal */}
      <EsmaUlHusnaModal
        visible={esmaModalVisible}
        onClose={() => setEsmaModalVisible(false)}
      />

      {/* Konum Seçim Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={location}
      />
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: 50,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
});

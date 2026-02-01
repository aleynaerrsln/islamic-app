import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, borderRadius } from '../theme';
import { getMonthlyCalendar } from '../api/aladhan';
import type { Location } from '../types';
import { HIJRI_MONTHS } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Türkçe ay isimleri
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Türkçe gün isimleri
const TURKISH_DAYS: { [key: string]: string } = {
  'Sunday': 'Pazar',
  'Monday': 'Pazartesi',
  'Tuesday': 'Salı',
  'Wednesday': 'Çarşamba',
  'Thursday': 'Perşembe',
  'Friday': 'Cuma',
  'Saturday': 'Cumartesi',
};

// Namaz vakti ikonları ve renkleri
const PRAYER_CONFIG = {
  Fajr: { icon: 'weather-night', color: '#9C27B0', name: 'İmsak' },
  Sunrise: { icon: 'weather-sunset-up', color: '#FF9800', name: 'Güneş' },
  Dhuhr: { icon: 'white-balance-sunny', color: '#FFC107', name: 'Öğle' },
  Asr: { icon: 'weather-sunny', color: '#FF5722', name: 'İkindi' },
  Maghrib: { icon: 'weather-sunset-down', color: '#E91E63', name: 'Akşam' },
  Isha: { icon: 'moon-waning-crescent', color: '#673AB7', name: 'Yatsı' },
};

interface MonthlyPrayerTimesModalProps {
  visible: boolean;
  onClose: () => void;
  location: Location | null;
  calculationMethod?: number;
}

interface DayPrayerTimes {
  date: {
    readable: string;
    gregorian: {
      day: string;
      month: { number: number };
      year: string;
      weekday: { en: string };
    };
    hijri: {
      day: string;
      month: { number: number; en: string };
      year: string;
    };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

export function MonthlyPrayerTimesModal({
  visible,
  onClose,
  location,
  calculationMethod = 13,
}: MonthlyPrayerTimesModalProps) {
  const [monthlyData, setMonthlyData] = useState<DayPrayerTimes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  useEffect(() => {
    if (visible && location) {
      fetchMonthlyData();
    }
  }, [visible, location]);

  const fetchMonthlyData = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMonthlyCalendar(
        currentYear,
        currentMonth,
        location.latitude,
        location.longitude,
        calculationMethod
      );

      if (response.data && Array.isArray(response.data)) {
        setMonthlyData(response.data);
      } else {
        setError('Veri formatı hatalı');
      }
    } catch (err) {
      setError('Aylık namaz vakitleri yüklenemedi');
      console.error('Monthly fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time?.split(' ')[0] || '';
  };

  const formatGregorianDate = (day: DayPrayerTimes) => {
    const dayNum = day.date?.gregorian?.day || '';
    const monthNum = day.date?.gregorian?.month?.number || currentMonth;
    const year = day.date?.gregorian?.year || currentYear;
    const weekday = TURKISH_DAYS[day.date?.gregorian?.weekday?.en] || '';
    const monthName = TURKISH_MONTHS[monthNum - 1] || '';

    return `${dayNum.padStart(2, '0')} ${monthName} ${year} ${weekday}`;
  };

  const formatHijriDate = (day: DayPrayerTimes) => {
    const hijri = day.date?.hijri;
    if (!hijri) return '';

    const monthName = HIJRI_MONTHS[hijri.month?.number] || hijri.month?.en || '';
    return `${hijri.day} ${monthName} ${hijri.year}`;
  };

  const renderPrayerTime = (prayerKey: keyof typeof PRAYER_CONFIG, time: string) => {
    const config = PRAYER_CONFIG[prayerKey];
    return (
      <View style={styles.prayerItem} key={prayerKey}>
        <Icon name={config.icon} size={24} color={config.color} />
        <Text style={styles.prayerName}>{config.name}</Text>
        <Text style={styles.prayerTime}>{formatTime(time)}</Text>
      </View>
    );
  };

  const renderDayCard = ({ item, index }: { item: DayPrayerTimes; index: number }) => {
    const dayNumber = parseInt(item.date?.gregorian?.day || '0');
    const isToday = dayNumber === currentDay;

    return (
      <View style={[styles.dayCard, isToday && styles.todayCard]}>
        {/* Tarih Başlığı */}
        <View style={styles.dateHeader}>
          <Text style={[styles.gregorianDate, isToday && styles.todayText]}>
            {formatGregorianDate(item)}
          </Text>
          <Text style={styles.hijriDate}>{formatHijriDate(item)}</Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Bugün</Text>
            </View>
          )}
        </View>

        {/* Namaz Vakitleri */}
        <View style={styles.prayerRow}>
          {renderPrayerTime('Fajr', item.timings?.Fajr)}
          {renderPrayerTime('Sunrise', item.timings?.Sunrise)}
          {renderPrayerTime('Dhuhr', item.timings?.Dhuhr)}
          {renderPrayerTime('Asr', item.timings?.Asr)}
          {renderPrayerTime('Maghrib', item.timings?.Maghrib)}
          {renderPrayerTime('Isha', item.timings?.Isha)}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {TURKISH_MONTHS[currentMonth - 1]} {currentYear}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F5A623" />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchMonthlyData} style={styles.retryButton}>
                <Text style={styles.retryText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : monthlyData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Veri bulunamadı</Text>
            </View>
          ) : (
            <FlatList
              data={monthlyData}
              renderItem={renderDayCard}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              initialScrollIndex={currentDay > 1 ? currentDay - 1 : 0}
              getItemLayout={(data, index) => ({
                length: 140,
                offset: 140 * index,
                index,
              })}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dayCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  todayCard: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  dateHeader: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  gregorianDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  todayText: {
    color: '#F5A623',
  },
  hijriDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  todayBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#F5A623',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prayerItem: {
    alignItems: 'center',
    flex: 1,
  },
  prayerName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    marginBottom: 2,
  },
  prayerTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
});

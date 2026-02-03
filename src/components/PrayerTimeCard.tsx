import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import type { PrayerTimes } from '../types';

// Namaz vakti ikonları
const PRAYER_ICONS: { [key: string]: string } = {
  Fajr: 'weather-night',           // İmsak - ay
  Sunrise: 'weather-sunset-up',    // Güneş doğuşu
  Dhuhr: 'white-balance-sunny',    // Öğle - güneş
  Asr: 'weather-sunny',            // İkindi - güneş
  Maghrib: 'weather-sunset-down',  // Akşam - gün batımı
  Isha: 'moon-waning-crescent',    // Yatsı - hilal
};

// Türkçe namaz isimleri
const PRAYER_NAMES_TR: { [key: string]: string } = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

interface PrayerTimesHorizontalProps {
  prayerTimes: PrayerTimes;
  currentPrayer: keyof PrayerTimes | null;
  nextPrayer: keyof PrayerTimes | null;
  gregorianDate?: string;
  hijriDate?: string;
  timeToNextPrayer?: string;
  onExpandPress?: () => void;
}

export function PrayerTimesHorizontal({
  prayerTimes,
  currentPrayer,
  nextPrayer,
  gregorianDate,
  hijriDate,
  timeToNextPrayer,
  onExpandPress
}: PrayerTimesHorizontalProps) {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;

  const prayerOrder: (keyof PrayerTimes)[] = [
    'Fajr',
    'Sunrise',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha',
  ];

  // Saati formatla (sadece saat:dakika)
  const formatTime = (time: string) => {
    return time.split(' ')[0];
  };

  return (
    <View style={[styles.container, { backgroundColor: cardBgColor }]}>
      {/* Geri Sayım */}
      {nextPrayer && timeToNextPrayer && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>
            {PRAYER_NAMES_TR[nextPrayer]} vaktine kalan
          </Text>
          <Text style={styles.countdownTime}>{timeToNextPrayer}</Text>
        </View>
      )}

      {/* Tarih Başlığı */}
      {(gregorianDate || hijriDate) && (
        <View style={styles.dateContainer}>
          <View style={styles.dateTextContainer}>
            {gregorianDate && (
              <Text style={styles.gregorianDate}>{gregorianDate}</Text>
            )}
            {hijriDate && (
              <Text style={styles.hijriDate}>{hijriDate}</Text>
            )}
          </View>
          {onExpandPress && (
            <TouchableOpacity onPress={onExpandPress} style={styles.expandButton}>
              <Icon name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Namaz Vakitleri */}
      <View style={styles.prayerRow}>
        {prayerOrder.map((prayer) => {
          const isNext = prayer === nextPrayer;

          return (
            <View
              key={prayer}
              style={[
                styles.prayerItem,
                isNext && styles.nextPrayer,
              ]}
            >
              <Icon
                name={PRAYER_ICONS[prayer]}
                size={32}
                color={isNext ? '#000' : 'rgba(255,255,255,0.9)'}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.prayerName,
                  { color: isNext ? '#000' : 'rgba(255,255,255,0.9)' },
                ]}
              >
                {PRAYER_NAMES_TR[prayer]}
              </Text>
              <Text
                style={[
                  styles.prayerTime,
                  { color: isNext ? '#000' : '#fff' },
                  isNext && styles.nextTime,
                ]}
              >
                {formatTime(prayerTimes[prayer])}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface PrayerTimesListProps {
  prayerTimes: PrayerTimes;
  currentPrayer: keyof PrayerTimes | null;
  nextPrayer: keyof PrayerTimes | null;
  gregorianDate?: string;
  hijriDate?: string;
  timeToNextPrayer?: string;
  onExpandPress?: () => void;
}

export function PrayerTimesList({
  prayerTimes,
  currentPrayer,
  nextPrayer,
  gregorianDate,
  hijriDate,
  timeToNextPrayer,
  onExpandPress
}: PrayerTimesListProps) {
  return (
    <PrayerTimesHorizontal
      prayerTimes={prayerTimes}
      currentPrayer={currentPrayer}
      nextPrayer={nextPrayer}
      gregorianDate={gregorianDate}
      hijriDate={hijriDate}
      timeToNextPrayer={timeToNextPrayer}
      onExpandPress={onExpandPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  countdownLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F5A623',
    letterSpacing: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  dateTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    padding: spacing.xs,
    position: 'absolute',
    right: 0,
  },
  gregorianDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  hijriDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  prayerItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 52,
  },
  nextPrayer: {
    backgroundColor: '#F5A623',
  },
  icon: {
    marginBottom: 4,
  },
  prayerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextTime: {
    fontWeight: 'bold',
  },
});

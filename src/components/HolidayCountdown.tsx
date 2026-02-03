import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, borderRadius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import {
  getUpcomingEvents,
  calculateDaysUntil,
  formatDateTurkish,
  isCurrentlyRamadan,
  IslamicEvent,
} from '../data/islamicDates';

interface CountdownInfo {
  name: string;
  icon: string;
  color: string;
  daysRemaining: number;
  isActive: boolean;
  gregorianDateStr?: string;
}

export function HolidayCountdown() {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;
  const [ramadanInfo, setRamadanInfo] = useState<CountdownInfo | null>(null);
  const [bayramInfo, setBayramInfo] = useState<CountdownInfo | null>(null);
  const [kandilInfo, setKandilInfo] = useState<CountdownInfo | null>(null);

  useEffect(() => {
    calculateCountdowns();
  }, []);

  const eventToCountdownInfo = (event: IslamicEvent, today: Date): CountdownInfo => {
    const daysUntil = calculateDaysUntil(event.date, today);
    return {
      name: event.name,
      icon: event.icon,
      color: event.color,
      daysRemaining: daysUntil,
      isActive: daysUntil === 0,
      gregorianDateStr: formatDateTurkish(event.date),
    };
  };

  const calculateCountdowns = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ramazan ayında mıyız kontrol et
    const inRamadan = isCurrentlyRamadan(today);

    // Önümüzdeki etkinlikleri al
    const { ramadan, bayram, kandil } = getUpcomingEvents(today);

    // Ramazan
    if (inRamadan) {
      setRamadanInfo({
        name: 'Ramazan',
        icon: 'moon-waning-crescent',
        color: '#9C27B0',
        daysRemaining: 0,
        isActive: true,
      });
    } else if (ramadan) {
      setRamadanInfo(eventToCountdownInfo(ramadan, today));
    }

    // Bayram
    if (bayram) {
      setBayramInfo(eventToCountdownInfo(bayram, today));
    }

    // Kandil
    if (kandil) {
      setKandilInfo(eventToCountdownInfo(kandil, today));
    }
  };

  const renderCountdownCard = (info: CountdownInfo, activeMessage: string) => (
    <View style={[styles.container, { borderLeftColor: info.color, backgroundColor: cardBgColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${info.color}20` }]}>
        <Icon name={info.icon} size={26} color={info.color} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          {info.isActive ? (
            <Text style={styles.holidayName}>Bugün {info.name}</Text>
          ) : (
            <Text style={styles.holidayName}>{info.name}</Text>
          )}
          {info.gregorianDateStr && !info.isActive && (
            <Text style={styles.dateText}>{info.gregorianDateStr}</Text>
          )}
        </View>
        {info.isActive ? (
          <Text style={[styles.activeText, { color: info.color }]}>{activeMessage}</Text>
        ) : (
          <View style={styles.countdownRow}>
            <Text style={[styles.daysNumber, { color: info.color }]}>
              {info.daysRemaining}
            </Text>
            <Text style={styles.daysText}> gün kaldı</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Hiçbir veri yoksa gösterme
  if (!ramadanInfo && !bayramInfo && !kandilInfo) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Ramazan */}
      {ramadanInfo && renderCountdownCard(ramadanInfo, "Ramazan-ı Şerif'iniz mübarek olsun!")}

      {/* Bayram */}
      {bayramInfo && renderCountdownCard(bayramInfo, "Bayramınız mübarek olsun!")}

      {/* Kandil */}
      {kandilInfo && renderCountdownCard(kandilInfo, "Kandiliniz mübarek olsun!")}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.sm,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  daysText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { formatTimeRemaining } from '../store/prayerStore';
import { PRAYER_NAMES } from '../types';
import { spacing, borderRadius } from '../theme';
import type { PrayerTimes } from '../types';

interface CountdownTimerProps {
  nextPrayer: keyof PrayerTimes | null;
  timeRemaining: number; // saniye cinsinden
}

export function CountdownTimer({ nextPrayer, timeRemaining }: CountdownTimerProps) {
  const theme = useTheme();

  if (!nextPrayer) {
    return null;
  }

  const formattedTime = formatTimeRemaining(timeRemaining);
  const [hours, minutes, seconds] = formattedTime.split(':');
  const prayerName = PRAYER_NAMES[nextPrayer];

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
      <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onPrimaryContainer }]}>
        {prayerName} vaktine kalan
      </Text>

      <View style={styles.timerContainer}>
        <TimeUnit value={hours} label="Saat" theme={theme} />
        <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
        <TimeUnit value={minutes} label="Dakika" theme={theme} />
        <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
        <TimeUnit value={seconds} label="Saniye" theme={theme} />
      </View>
    </Surface>
  );
}

interface TimeUnitProps {
  value: string;
  label: string;
  theme: any;
}

function TimeUnit({ value, label, theme }: TimeUnitProps) {
  return (
    <View style={styles.unitContainer}>
      <Surface style={[styles.unitBox, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="headlineLarge" style={[styles.unitValue, { color: theme.colors.primary }]}>
          {value}
        </Text>
      </Surface>
      <Text variant="labelSmall" style={[styles.unitLabel, { color: theme.colors.onPrimaryContainer }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  label: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitContainer: {
    alignItems: 'center',
  },
  unitBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  unitValue: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  unitLabel: {
    marginTop: spacing.xs,
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: spacing.xs,
  },
});

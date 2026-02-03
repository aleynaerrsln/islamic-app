import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, borderRadius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';

// ===== GÜNÜN AYETİ =====
interface DailyAyahCardProps {
  arabicText: string;
  turkishText: string;
  surahName?: string;
  ayahNumber?: number;
}

export function DailyAyahCard({ arabicText, turkishText, surahName, ayahNumber }: DailyAyahCardProps) {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;

  return (
    <View style={[styles.card, { borderLeftColor: '#4CAF50', backgroundColor: cardBgColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
          <Icon name="book-open-page-variant" size={24} color="#4CAF50" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Günün Ayeti</Text>
          {surahName && (
            <Text style={styles.subtitle}>{surahName} {ayahNumber && `- ${ayahNumber}`}</Text>
          )}
        </View>
      </View>

      <Text style={styles.arabicText}>
        {arabicText}
      </Text>

      <Text style={styles.turkishText}>
        {turkishText}
      </Text>
    </View>
  );
}

// ===== GÜNÜN HADİSİ =====
interface DailyHadisCardProps {
  hadisText: string;
  arabicText?: string;
  source: string;
  topic: string;
}

export function DailyHadisCard({ hadisText, arabicText, source, topic }: DailyHadisCardProps) {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;

  return (
    <View style={[styles.card, { borderLeftColor: '#FF9800', backgroundColor: cardBgColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
          <Icon name="message-text" size={24} color="#FF9800" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Günün Hadisi</Text>
          <Text style={styles.subtitle}>{source}</Text>
        </View>
        <View style={[styles.topicBadge, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
          <Text style={[styles.topicText, { color: '#FF9800' }]}>{topic}</Text>
        </View>
      </View>

      {arabicText && (
        <Text style={styles.arabicTextSmall}>
          {arabicText}
        </Text>
      )}

      <Text style={styles.hadisText}>
        "{hadisText}"
      </Text>
    </View>
  );
}

// ===== GÜNÜN ESMASI =====
interface DailyEsmaCardProps {
  number: number;
  arabic: string;
  turkish: string;
  meaning: string;
  color: string;
  onExpandPress?: () => void;
}

export function DailyEsmaCard({ number, arabic, turkish, meaning, color, onExpandPress }: DailyEsmaCardProps) {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;

  return (
    <View style={[styles.card, { borderLeftColor: color, backgroundColor: cardBgColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}33` }]}>
          <Icon name="star-four-points" size={24} color={color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Günün Esması</Text>
          <Text style={styles.subtitle}>Esma-ül Hüsna #{number}</Text>
        </View>
        {onExpandPress && (
          <TouchableOpacity onPress={onExpandPress} style={styles.expandButton}>
            <Icon name="chevron-right" size={26} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.esmaContainer}>
        <Text style={[styles.esmaArabic, { color }]}>
          {arabic}
        </Text>
        <Text style={styles.esmaTurkish}>
          {turkish}
        </Text>
      </View>

      <Text style={styles.esmaMeaning}>
        {meaning}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  topicBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ayet stilleri
  arabicText: {
    fontSize: 26,
    color: '#fff',
    textAlign: 'right',
    lineHeight: 46,
    marginBottom: spacing.md,
    fontFamily: 'System',
  },
  turkishText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  // Hadis stilleri
  arabicTextSmall: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: spacing.sm,
    fontFamily: 'System',
  },
  hadisText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  // Esma stilleri
  esmaContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  esmaArabic: {
    fontSize: 56,
    fontWeight: '300',
    fontFamily: 'System',
    marginBottom: spacing.sm,
  },
  esmaTurkish: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  esmaMeaning: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

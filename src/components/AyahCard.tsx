import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme, Divider } from 'react-native-paper';
import { spacing, borderRadius } from '../theme';

interface AyahCardProps {
  arabicText: string;
  turkishText: string;
  surahName?: string;
  ayahNumber?: number;
  surahNumber?: number;
  onShare?: () => void;
  onPlayAudio?: () => void;
  showActions?: boolean;
}

export function AyahCard({
  arabicText,
  turkishText,
  surahName,
  ayahNumber,
  surahNumber,
  onShare,
  onPlayAudio,
  showActions = true,
}: AyahCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        {/* Kaynak bilgisi */}
        {surahName && (
          <View style={styles.sourceContainer}>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              {surahName} {ayahNumber && `- Ayet ${ayahNumber}`}
            </Text>
          </View>
        )}

        {/* Arapça metin */}
        <View style={[styles.arabicContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text
            variant="headlineSmall"
            style={[styles.arabicText, { color: theme.colors.onSurfaceVariant }]}
          >
            {arabicText}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Türkçe meal */}
        <Text variant="bodyLarge" style={[styles.turkishText, { color: theme.colors.onSurface }]}>
          {turkishText}
        </Text>

        {/* Aksiyon butonları */}
        {showActions && (
          <View style={styles.actionsContainer}>
            {onPlayAudio && (
              <IconButton
                icon="play-circle-outline"
                size={24}
                onPress={onPlayAudio}
                iconColor={theme.colors.primary}
              />
            )}
            {onShare && (
              <IconButton
                icon="share-variant-outline"
                size={24}
                onPress={onShare}
                iconColor={theme.colors.primary}
              />
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

// Günlük Ayet için özel versiyon
interface DailyAyahCardProps {
  arabicText: string;
  turkishText: string;
  surahName?: string;
  ayahNumber?: number;
}

export function DailyAyahCard({ arabicText, turkishText, surahName, ayahNumber }: DailyAyahCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.dailyCard, { backgroundColor: theme.colors.tertiaryContainer }]} mode="contained">
      <Card.Content>
        <View style={styles.dailyHeader}>
          <Text variant="titleMedium" style={{ color: theme.colors.onTertiaryContainer }}>
            Günün Ayeti
          </Text>
          {surahName && (
            <Text variant="labelSmall" style={{ color: theme.colors.onTertiaryContainer }}>
              {surahName} {ayahNumber}
            </Text>
          )}
        </View>

        <Text
          variant="titleLarge"
          style={[styles.dailyArabic, { color: theme.colors.onTertiaryContainer }]}
        >
          {arabicText.length > 100 ? arabicText.substring(0, 100) + '...' : arabicText}
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.dailyTurkish, { color: theme.colors.onTertiaryContainer }]}
          numberOfLines={3}
        >
          {turkishText}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
  },
  sourceContainer: {
    marginBottom: spacing.sm,
  },
  arabicContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  arabicText: {
    textAlign: 'right',
    fontFamily: 'System', // iOS'ta varsayılan Arapça font kullanır
    lineHeight: 40,
    writingDirection: 'rtl',
  },
  divider: {
    marginVertical: spacing.md,
  },
  turkishText: {
    lineHeight: 26,
    textAlign: 'justify',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  // Daily card styles
  dailyCard: {
    margin: spacing.md,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dailyArabic: {
    textAlign: 'right',
    marginVertical: spacing.sm,
    lineHeight: 32,
  },
  dailyTurkish: {
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

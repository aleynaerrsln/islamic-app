import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper';
import { spacing, borderRadius } from '../theme';
import type { Hadith } from '../types';

interface HadithCardProps {
  hadith: Hadith;
  onShare?: () => void;
  showFullContent?: boolean;
}

export function HadithCard({ hadith, onShare, showFullContent = false }: HadithCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        {/* Başlık */}
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary }]}>
          {hadith.title}
        </Text>

        {/* Hadis metni */}
        <Text
          variant="bodyLarge"
          style={[styles.content, { color: theme.colors.onSurface }]}
          numberOfLines={showFullContent ? undefined : 4}
        >
          "{hadith.hadeeth}"
        </Text>

        {/* Alt bilgiler */}
        <View style={styles.footer}>
          <View style={styles.chips}>
            <Chip
              icon="book-open-variant"
              compact
              style={styles.chip}
              textStyle={{ fontSize: 12 }}
            >
              {hadith.attribution}
            </Chip>
            {hadith.grade && (
              <Chip
                icon="check-circle-outline"
                compact
                style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ fontSize: 12 }}
              >
                {hadith.grade}
              </Chip>
            )}
          </View>

          {onShare && (
            <IconButton
              icon="share-variant-outline"
              size={20}
              onPress={onShare}
              iconColor={theme.colors.primary}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

// Günlük Hadis için kompakt versiyon
interface DailyHadithCardProps {
  hadith: Hadith;
}

export function DailyHadithCard({ hadith }: DailyHadithCardProps) {
  const theme = useTheme();

  return (
    <Card
      style={[styles.dailyCard, { backgroundColor: theme.colors.secondaryContainer }]}
      mode="contained"
    >
      <Card.Content>
        <View style={styles.dailyHeader}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer }}>
            Günün Hadisi
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
            {hadith.attribution}
          </Text>
        </View>

        <Text
          variant="bodyMedium"
          style={[styles.dailyContent, { color: theme.colors.onSecondaryContainer }]}
          numberOfLines={3}
        >
          "{hadith.hadeeth}"
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  content: {
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    height: 28,
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
  dailyContent: {
    fontStyle: 'italic',
  },
});

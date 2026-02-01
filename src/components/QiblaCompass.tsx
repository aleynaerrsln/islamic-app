import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { spacing } from '../theme';

interface QiblaCompassProps {
  qiblaAngle: number;
  compassHeading: number;
  qiblaDirection: number;
  distanceToMecca: number;
  isCalibrated: boolean;
}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.75;

export function QiblaCompass({
  qiblaAngle,
  compassHeading,
  qiblaDirection,
  distanceToMecca,
  isCalibrated,
}: QiblaCompassProps) {
  const theme = useTheme();

  // Kıble yönüne döndürme için interpolasyon
  const rotateStyle = {
    transform: [{ rotate: `${-compassHeading}deg` }],
  };

  const qiblaIndicatorStyle = {
    transform: [{ rotate: `${qiblaDirection}deg` }],
  };

  return (
    <View style={styles.container}>
      {/* Kalibrasyon uyarısı */}
      {!isCalibrated && (
        <Surface style={[styles.calibrationWarning, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
            Pusulayı kalibre etmek için telefonunuzu 8 çizerek hareket ettirin
          </Text>
        </Surface>
      )}

      {/* Ana pusula */}
      <View style={[styles.compassContainer, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
        {/* Pusula dış çerçeve */}
        <Surface
          style={[
            styles.compassOuter,
            {
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
          elevation={3}
        >
          {/* Dönen pusula */}
          <Animated.View style={[styles.compassInner, rotateStyle]}>
            {/* Yön işaretleri */}
            <View style={styles.directionsContainer}>
              <Text style={[styles.directionText, styles.north, { color: theme.colors.error }]}>
                K
              </Text>
              <Text style={[styles.directionText, styles.east, { color: theme.colors.onSurface }]}>
                D
              </Text>
              <Text style={[styles.directionText, styles.south, { color: theme.colors.onSurface }]}>
                G
              </Text>
              <Text style={[styles.directionText, styles.west, { color: theme.colors.onSurface }]}>
                B
              </Text>
            </View>

            {/* Derece çizgileri */}
            {[...Array(72)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.degreeLine,
                  {
                    transform: [{ rotate: `${i * 5}deg` }],
                    backgroundColor: i % 6 === 0 ? theme.colors.onSurface : theme.colors.outline,
                    height: i % 6 === 0 ? 15 : 8,
                  },
                ]}
              />
            ))}

            {/* Kıble yönü oku */}
            <View style={[styles.qiblaArrow, qiblaIndicatorStyle]}>
              <View style={[styles.arrowBody, { backgroundColor: theme.colors.primary }]} />
              <View
                style={[
                  styles.arrowHead,
                  {
                    borderBottomColor: theme.colors.primary,
                  },
                ]}
              />
              <Text style={[styles.kaaba, { color: theme.colors.primary }]}>
                🕋
              </Text>
            </View>
          </Animated.View>

          {/* Merkez nokta */}
          <View style={[styles.centerDot, { backgroundColor: theme.colors.primary }]} />
        </Surface>
      </View>

      {/* Bilgi kartları */}
      <View style={styles.infoContainer}>
        <Surface style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
            Kıble Yönü
          </Text>
          <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer }}>
            {Math.round(qiblaDirection)}°
          </Text>
        </Surface>

        <Surface style={[styles.infoCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
            Mekke'ye Mesafe
          </Text>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSecondaryContainer }}>
            {distanceToMecca.toLocaleString()} km
          </Text>
        </Surface>
      </View>

      {/* Yön göstergesi */}
      <Surface style={[styles.headingIndicator, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          Bakış Yönü: {Math.round(compassHeading)}°
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  calibrationWarning: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassOuter: {
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassInner: {
    width: COMPASS_SIZE - 20,
    height: COMPASS_SIZE - 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  directionText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
  },
  north: {
    top: 20,
    alignSelf: 'center',
  },
  east: {
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  south: {
    bottom: 20,
    alignSelf: 'center',
  },
  west: {
    left: 20,
    top: '50%',
    marginTop: -12,
  },
  degreeLine: {
    position: 'absolute',
    width: 2,
    top: 5,
    left: '50%',
    marginLeft: -1,
    transformOrigin: 'center ' + (COMPASS_SIZE / 2 - 15) + 'px',
  },
  qiblaArrow: {
    position: 'absolute',
    alignItems: 'center',
    height: COMPASS_SIZE / 2 - 30,
    top: 30,
  },
  arrowBody: {
    width: 4,
    flex: 1,
    borderRadius: 2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  kaaba: {
    fontSize: 24,
    marginTop: -5,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  headingIndicator: {
    marginTop: spacing.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
});

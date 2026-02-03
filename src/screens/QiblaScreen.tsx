import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { useQibla } from '../hooks/useQibla';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';

const { width } = Dimensions.get('window');

// Kabe ikonu komponenti (emoji kullanarak)
const KaabaIcon = ({ size = 24 }: { size?: number }) => (
  <Text style={{ fontSize: size, textAlign: 'center' }}>🕋</Text>
);

export function QiblaScreen() {
  const theme = useTheme();
  const { location, isLoading: locationLoading, error: locationError } = useLocation();
  const {
    qiblaAngle,
    distanceToMecca,
    isLoading: qiblaLoading,
    error: qiblaError,
    isCalibrated,
  } = useQibla(location);

  // Yükleniyor durumu
  if (locationLoading || qiblaLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Kıble</Text>
          </View>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: spacing.md, color: '#fff' }}>
              {locationLoading ? 'Konum alınıyor...' : 'Kıble yönü hesaplanıyor...'}
            </Text>
          </View>
        </View>
      </BackgroundWrapper>
    );
  }

  // Hata durumu
  if (locationError || qiblaError) {
    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Kıble</Text>
          </View>
          <View style={styles.centered}>
            <KaabaIcon size={64} />
            <Text style={{ color: theme.colors.error, textAlign: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
              {locationError || qiblaError}
            </Text>
            <Text variant="bodySmall" style={{ marginTop: spacing.md, color: 'rgba(255,255,255,0.6)' }}>
              Konum izni gereklidir
            </Text>
          </View>
        </View>
      </BackgroundWrapper>
    );
  }

  // Kıble yönüne ne kadar yakın olduğumuzu hesapla
  const angleDiff = qiblaAngle > 180 ? qiblaAngle - 360 : qiblaAngle;
  const isAligned = Math.abs(angleDiff) < 15; // 15 derece tolerans
  const turnDirection = angleDiff > 0 ? 'right' : 'left';

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kıble</Text>
          {location?.city && (
            <Text style={styles.locationText}>
              {location.city}, {location.country}
            </Text>
          )}
        </View>

        <View style={styles.directorContainer}>
          {isAligned ? (
            // Kıble yönüne döndük
            <>
              <Text style={styles.alignedText}>Kıble</Text>
              <View style={styles.arrowContainer}>
                <Icon name="arrow-up" size={120} color="#fff" />
              </View>
              <View style={styles.kaabaIconContainer}>
                <KaabaIcon size={48} />
              </View>
              <Text style={styles.distanceText}>
                Mekke'ye {distanceToMecca.toLocaleString()} km
              </Text>
            </>
          ) : (
            // Döndürülmesi gereken yön
            <>
              <Text style={styles.turnText}>Telefonunuzu ok yönünde çeviriniz</Text>
              <View style={styles.arrowContainer}>
                <Icon
                  name={turnDirection === 'right' ? 'arrow-right' : 'arrow-left'}
                  size={120}
                  color="#fff"
                />
              </View>
              <Text style={styles.degreeText}>
                {Math.abs(Math.round(angleDiff))}° {turnDirection === 'right' ? 'sağa' : 'sola'}
              </Text>
            </>
          )}
        </View>

        {/* Kalibrasyon uyarısı */}
        {!isCalibrated && (
          <View style={styles.calibrationBanner}>
            <Icon name="information" size={20} color="#FF9800" />
            <Text style={{ color: '#FF9800', marginLeft: spacing.sm, flex: 1 }}>
              Pusulayı kalibre etmek için telefonunuzu 8 çizerek hareket ettirin
            </Text>
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  alignedText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
  },
  turnText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  arrowContainer: {
    marginVertical: spacing.xl,
  },
  kaabaIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  distanceText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.lg,
  },
  degreeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.md,
  },
  calibrationBanner: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,152,0,0.2)',
  },
});

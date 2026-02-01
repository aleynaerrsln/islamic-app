import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../hooks/useLocation';
import { useQibla } from '../hooks/useQibla';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.75;

type QiblaMode = 'selection' | 'compass' | 'director';

// Kabe ikonu komponenti (emoji kullanarak)
const KaabaIcon = ({ size = 24, color = '#1B5E20' }: { size?: number; color?: string }) => (
  <Text style={{ fontSize: size, textAlign: 'center' }}>🕋</Text>
);

export function QiblaScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<QiblaMode>('selection');
  const { location, isLoading: locationLoading, error: locationError } = useLocation();
  const {
    qiblaDirection,
    compassHeading,
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: spacing.md, color: '#fff' }}>
            {locationLoading ? 'Konum alınıyor...' : 'Kıble yönü hesaplanıyor...'}
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  // Hata durumu
  if (locationError || qiblaError) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <KaabaIcon size={64} />
          <Text style={{ color: theme.colors.error, textAlign: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            {locationError || qiblaError}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: spacing.md, color: 'rgba(255,255,255,0.6)' }}>
            Konum izni gereklidir
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  // Seçim ekranı
  if (mode === 'selection') {
    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              Kıble Bul
            </Text>
            {location?.city && (
              <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs }}>
                {location.city}, {location.country}
              </Text>
            )}
          </View>

          <View style={styles.selectionContainer}>
            {/* Kıble Pusulası seçeneği */}
            <TouchableOpacity
              style={[styles.selectionCard, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
              onPress={() => setMode('compass')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Icon name="compass-outline" size={64} color="#fff" />
              </View>
              <Text variant="titleLarge" style={{ color: '#fff', marginTop: spacing.lg }}>
                Kıble Pusulası
              </Text>
              <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.6)', marginTop: spacing.xs, textAlign: 'center' }}>
                Detaylı pusula görünümü ile Kıble yönünü bulun
              </Text>
            </TouchableOpacity>

            {/* Kıble Yönlendirici seçeneği */}
            <TouchableOpacity
              style={[styles.selectionCard, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
              onPress={() => setMode('director')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View style={styles.phoneIconWrapper}>
                  <Icon name="cellphone" size={48} color="#333" />
                  <View style={styles.arrowOverlay}>
                    <Icon name="arrow-right" size={20} color={theme.colors.primary} />
                  </View>
                </View>
              </View>
              <Text variant="titleLarge" style={{ color: '#333', marginTop: spacing.lg }}>
                Kıble Yönlendirici
              </Text>
              <Text variant="bodySmall" style={{ color: 'rgba(0,0,0,0.5)', marginTop: spacing.xs, textAlign: 'center' }}>
                Telefonunuzu Kıble yönüne çevirin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BackgroundWrapper>
    );
  }

  // Kıble Yönlendirici modu
  if (mode === 'director') {
    // Kıble yönüne ne kadar yakın olduğumuzu hesapla
    const angleDiff = qiblaAngle > 180 ? qiblaAngle - 360 : qiblaAngle;
    const isAligned = Math.abs(angleDiff) < 15; // 15 derece tolerans
    const turnDirection = angleDiff > 0 ? 'right' : 'left';

    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          {/* Üst bar */}
          <View style={styles.topBar}>
            <IconButton
              icon="arrow-left"
              iconColor="#fff"
              size={24}
              onPress={() => setMode('selection')}
            />
            <Text style={styles.topBarTitle}>Kıble Yönlendirici</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.directorContainer}>
            {isAligned ? (
              // Kıble yönüne döndük
              <>
                <Text style={styles.alignedText}>Kıble</Text>
                <View style={styles.arrowContainer}>
                  <Icon name="arrow-up" size={120} color="#fff" />
                </View>
                <View style={[styles.kaabaIconContainer, { backgroundColor: '#fff' }]}>
                  <KaabaIcon size={48} />
                </View>
                <Text style={[styles.distanceText, { color: 'rgba(255,255,255,0.7)' }]}>
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
                <Text style={[styles.degreeText, { color: 'rgba(255,255,255,0.5)' }]}>
                  {Math.abs(Math.round(angleDiff))}° {turnDirection === 'right' ? 'sağa' : 'sola'}
                </Text>
              </>
            )}
          </View>

          {/* Kalibrasyon uyarısı */}
          {!isCalibrated && (
            <View style={[styles.calibrationBanner, { backgroundColor: 'rgba(255,152,0,0.2)' }]}>
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

  // Kıble Pusulası modu - Pusula telefon ile döner, Kabe ibresi sabit kalır
  // qiblaAngle = kıbleye dönmemiz gereken açı (0 = tam kıble yönündeyiz)
  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Üst bar */}
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => setMode('selection')}
          />
          <Text style={styles.topBarTitle}>Kıble Pusulası</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Kıble açısı */}
        <View style={styles.angleContainer}>
          <Text style={[styles.angleLabel, { color: 'rgba(255,255,255,0.7)' }]}>
            Konumunuz için Kıble açısı
          </Text>
          <Text style={[styles.angleValue, { color: theme.colors.primary }]}>
            {qiblaDirection.toFixed(2)}°
          </Text>
        </View>

        {/* Pusula */}
        <View style={styles.compassWrapper}>
          <View style={[styles.compassOuterRing, { borderColor: 'rgba(255,255,255,0.3)' }]}>
            {/* Sabit gösterge (yukarı ok) */}
            <View style={styles.fixedIndicator}>
              <View style={[styles.indicatorTriangle, { borderBottomColor: '#FF9800' }]} />
            </View>

            {/* Dönen pusula diski */}
            <View
              style={[
                styles.compassDisk,
                { transform: [{ rotate: `${-compassHeading}deg` }] },
              ]}
            >
              {/* Derece çizgileri */}
              {[...Array(36)].map((_, i) => {
                const degree = i * 10;
                const isMajor = degree % 90 === 0;
                const isMinor = degree % 30 === 0;
                return (
                  <View
                    key={i}
                    style={[
                      styles.tickMarkContainer,
                      { transform: [{ rotate: `${degree}deg` }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.tickMark,
                        {
                          height: isMajor ? 15 : isMinor ? 10 : 6,
                          backgroundColor: isMajor ? '#fff' : 'rgba(255,255,255,0.5)',
                        },
                      ]}
                    />
                  </View>
                );
              })}

              {/* Yön etiketleri */}
              <View style={[styles.directionLabelContainer, { transform: [{ rotate: '0deg' }] }]}>
                <Text style={styles.directionText}>KUZEY</Text>
                <Text style={styles.degreeLabelText}>0°</Text>
              </View>
              <View style={[styles.directionLabelContainer, { transform: [{ rotate: '90deg' }] }]}>
                <Text style={styles.directionText}>DOĞU</Text>
                <Text style={styles.degreeLabelText}>90°</Text>
              </View>
              <View style={[styles.directionLabelContainer, { transform: [{ rotate: '180deg' }] }]}>
                <Text style={styles.directionText}>GÜNEY</Text>
                <Text style={styles.degreeLabelText}>180°</Text>
              </View>
              <View style={[styles.directionLabelContainer, { transform: [{ rotate: '270deg' }] }]}>
                <Text style={styles.directionText}>BATI</Text>
                <Text style={styles.degreeLabelText}>270°</Text>
              </View>

              {/* Kabe işareti - Kıble yönünde */}
              <View
                style={[
                  styles.qiblaIndicator,
                  { transform: [{ rotate: `${qiblaDirection}deg` }] },
                ]}
              >
                <View style={styles.qiblaLine} />
                <View style={styles.kaabaMarker}>
                  <KaabaIcon size={22} />
                </View>
              </View>
            </View>

            {/* Merkez nokta */}
            <View style={[styles.centerPoint, { backgroundColor: '#FF9800' }]} />
          </View>
        </View>

        {/* Bilgi kartları */}
        <View style={styles.infoCards}>
          <View style={[styles.infoCard, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Bakış Yönü</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {Math.round(compassHeading)}°
            </Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Mekke'ye</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {distanceToMecca.toLocaleString()} km
            </Text>
          </View>
        </View>

        {/* Not */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Not: Manyetik alanlar ve manyetik olabilecek kılıflar sonucu saptırabilir.
          </Text>
        </View>

        {/* Kalibrasyon uyarısı */}
        {!isCalibrated && (
          <View style={[styles.calibrationBanner, { backgroundColor: 'rgba(255,152,0,0.2)' }]}>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Seçim ekranı stilleri
  selectionContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  selectionCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconWrapper: {
    position: 'relative',
  },
  arrowOverlay: {
    position: 'absolute',
    right: -15,
    top: '50%',
    marginTop: -10,
  },
  // Yönlendirici stilleri
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  distanceText: {
    fontSize: 14,
    marginTop: spacing.lg,
  },
  degreeText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
  // Pusula stilleri
  angleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  angleLabel: {
    fontSize: 14,
  },
  angleValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  compassWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  compassOuterRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassDisk: {
    width: COMPASS_SIZE - 10,
    height: COMPASS_SIZE - 10,
    borderRadius: (COMPASS_SIZE - 10) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMarkContainer: {
    position: 'absolute',
    width: 2,
    height: COMPASS_SIZE / 2 - 5,
    alignItems: 'center',
  },
  tickMark: {
    width: 2,
    borderRadius: 1,
  },
  directionLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: 25,
  },
  directionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  degreeLabelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  qiblaIndicator: {
    position: 'absolute',
    alignItems: 'center',
    top: 5,
    height: COMPASS_SIZE / 2 - 10,
  },
  qiblaLine: {
    width: 3,
    height: COMPASS_SIZE / 2 - 55,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  kaabaMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centerPoint: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  fixedIndicator: {
    position: 'absolute',
    top: -8,
    zIndex: 10,
  },
  indicatorTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  infoCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  noteContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  noteText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
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
  },
});

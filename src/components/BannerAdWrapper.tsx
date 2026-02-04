import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';

type BannerType = 'HOME' | 'QURAN' | 'SETTINGS' | 'RAMADAN' | 'TASBIH';

interface BannerAdWrapperProps {
  type: BannerType;
  position?: 'top' | 'bottom';
}

// Lazy import için dinamik yükleme
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

export function BannerAdWrapper({ type, position = 'top' }: BannerAdWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [adUnitId, setAdUnitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const initAds = async () => {
      try {
        // Dinamik import ile native modülü güvenli yükle
        const adsModule = await import('react-native-google-mobile-ads');
        BannerAd = adsModule.BannerAd;
        BannerAdSize = adsModule.BannerAdSize;
        TestIds = adsModule.TestIds;

        // AD_UNIT_IDS'i de dinamik yükle
        const { AD_UNIT_IDS } = await import('../services/adService');

        let unitId: string;
        switch (type) {
          case 'HOME':
            unitId = AD_UNIT_IDS.BANNER_HOME;
            break;
          case 'QURAN':
            unitId = AD_UNIT_IDS.BANNER_QURAN;
            break;
          case 'SETTINGS':
            unitId = AD_UNIT_IDS.BANNER_SETTINGS;
            break;
          case 'RAMADAN':
            unitId = AD_UNIT_IDS.BANNER_RAMADAN;
            break;
          case 'TASBIH':
            unitId = AD_UNIT_IDS.BANNER_TASBIH;
            break;
          default:
            unitId = TestIds.BANNER;
        }

        setAdUnitId(unitId);
        setIsReady(true);
      } catch (err: any) {
        setError(err?.message || 'AdMob yüklenemedi');
        console.log('Banner ad module not available:', err);
      }
    };

    initAds();
  }, [type]);

  const containerStyle = position === 'bottom' ? styles.containerBottom : styles.container;
  const debugStyle = position === 'bottom' ? styles.debugContainerBottom : styles.debugContainer;

  // Debug: Hata varsa göster
  if (error) {
    return (
      <View style={debugStyle}>
        <Text style={styles.debugText}>AdMob Hata: {error}</Text>
      </View>
    );
  }

  // Debug: Yükleniyor
  if (!isReady || !adUnitId || !BannerAd) {
    return (
      <View style={debugStyle}>
        <Text style={styles.debugText}>AdMob yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
          console.log('Banner ad loaded:', type);
        }}
        onAdFailedToLoad={(err: any) => {
          setError(err?.message || 'Reklam yüklenemedi');
          console.log('Banner ad failed to load:', type, err);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 35,
    marginBottom: 4,
  },
  containerBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 100,
  },
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    marginTop: 35,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugContainerBottom: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});

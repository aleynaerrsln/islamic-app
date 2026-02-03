import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

type BannerType = 'HOME' | 'QURAN' | 'SETTINGS';

interface BannerAdWrapperProps {
  type: BannerType;
}

// Lazy import için dinamik yükleme
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

export function BannerAdWrapper({ type }: BannerAdWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [adUnitId, setAdUnitId] = useState<string | null>(null);

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
          default:
            unitId = TestIds.BANNER;
        }

        setAdUnitId(unitId);
        setIsReady(true);
      } catch (error) {
        console.log('Banner ad module not available:', error);
        // Sessizce başarısız ol - reklam gösterme
      }
    };

    initAds();
  }, [type]);

  // Modül hazır değilse veya hata varsa boş göster
  if (!isReady || !adUnitId || !BannerAd) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded:', type);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Banner ad failed to load:', type, error);
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
  },
});

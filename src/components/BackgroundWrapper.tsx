import React, { useMemo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';
import { BACKGROUND_IMAGES, SOLID_COLORS } from '../data/backgroundImages';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const theme = useTheme();
  const { background } = useSettingsStore();

  // Seçilen resmi bul
  const selectedImage = useMemo(() => {
    if (background.type === 'image' && background.imageId) {
      return BACKGROUND_IMAGES.find((img) => img.id === background.imageId);
    }
    return null;
  }, [background.type, background.imageId]);

  // Seçilen rengi bul
  const selectedColor = useMemo(() => {
    if (background.type === 'color' && background.colorId) {
      return SOLID_COLORS.find((c) => c.id === background.colorId);
    }
    return null;
  }, [background.type, background.colorId]);

  // Overlay rengi (sadece koyu temada uygulanır, açık temada overlay yok)
  const overlayColor = theme.dark
    ? `rgba(18, 18, 18, ${background.opacity})`
    : 'transparent';

  // Düz renk arka plan
  if (background.type === 'color' && selectedColor) {
    return (
      <View style={[styles.background, { backgroundColor: selectedColor.color }]}>
        {children}
      </View>
    );
  }

  // Resimli arka plan
  if (selectedImage) {
    return (
      <ImageBackground
        source={selectedImage.source}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  // Varsayılan (tema rengi)
  return (
    <View style={[styles.background, { backgroundColor: theme.colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
});

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  useTheme,
  RadioButton,
  Button,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '../store/settingsStore';
import { sendTestNotification } from '../hooks/useNotifications';
import { CALCULATION_METHODS, MEAL_OPTIONS } from '../types';
import { spacing, borderRadius } from '../theme';
import { BackgroundImagePicker } from '../components/BackgroundImagePicker';
import { BACKGROUND_IMAGES, SOLID_COLORS } from '../data/backgroundImages';

export function SettingsScreen() {
  const theme = useTheme();
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const {
    calculationMethod,
    setCalculationMethod,
    theme: appTheme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationMinutesBefore,
    setNotificationMinutesBefore,
    selectedMeal,
    setSelectedMeal,
    location,
    background,
    setBackgroundOpacity,
    cardOpacity,
    setCardOpacity,
  } = useSettingsStore();

  // Seçili arka plan önizlemesi
  const backgroundPreview = useMemo(() => {
    if (background.type === 'image' && background.imageId) {
      const image = BACKGROUND_IMAGES.find((img) => img.id === background.imageId);
      return image ? { type: 'image' as const, source: image.thumbnail, name: image.name } : null;
    }
    if (background.type === 'color' && background.colorId) {
      const color = SOLID_COLORS.find((c) => c.id === background.colorId);
      return color ? { type: 'color' as const, color: color.color, name: color.name } : null;
    }
    return null;
  }, [background]);

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

        {/* Konum Bilgisi */}
        <List.Section>
          <List.Subheader>Konum</List.Subheader>
          <List.Item
            title={location?.city || 'Konum alınmadı'}
            description={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Konum izni gerekli'}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
        </List.Section>

        <Divider />

        {/* Namaz Vakti Hesaplama Metodu */}
        <List.Section>
          <List.Subheader>Hesaplama Metodu</List.Subheader>
          <RadioButton.Group
            onValueChange={(value) => setCalculationMethod(Number(value))}
            value={String(calculationMethod)}
          >
            {CALCULATION_METHODS.map((method) => (
              <RadioButton.Item
                key={method.id}
                label={method.name}
                value={String(method.id)}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* Meal Seçimi */}
        <List.Section>
          <List.Subheader>Kur'an Meali</List.Subheader>
          <RadioButton.Group
            onValueChange={(value) => setSelectedMeal(value as any)}
            value={selectedMeal}
          >
            {MEAL_OPTIONS.map((meal) => (
              <RadioButton.Item
                key={meal.id}
                label={meal.name}
                value={meal.id}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* Bildirim Ayarları */}
        <List.Section>
          <List.Subheader>Bildirimler</List.Subheader>
          <List.Item
            title="Namaz Vakti Bildirimleri"
            description="Her namaz vakti için bildirim al"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          {notificationsEnabled && (
            <View style={styles.notificationOptions}>
              <Text variant="bodyMedium" style={{ marginBottom: spacing.sm }}>
                Kaç dakika önce bildirim gelsin?
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setNotificationMinutesBefore(Number(value))}
                value={String(notificationMinutesBefore)}
              >
                <View style={styles.minuteOptions}>
                  {[0, 5, 10, 15, 30].map((min) => (
                    <RadioButton.Item
                      key={min}
                      label={min === 0 ? 'Tam vakitte' : `${min} dk önce`}
                      value={String(min)}
                      style={styles.minuteItem}
                    />
                  ))}
                </View>
              </RadioButton.Group>
              <Button
                mode="outlined"
                onPress={() => {
                  sendTestNotification();
                  Alert.alert('Bildirim', '2 saniye içinde test bildirimi gelecek');
                }}
                style={{ marginTop: spacing.md }}
                icon="bell-ring"
              >
                Test Bildirimi Gönder
              </Button>
            </View>
          )}
        </List.Section>

        <Divider />

        {/* Görünüm Ayarları */}
        <List.Section>
          <List.Subheader>Görünüm</List.Subheader>

          {/* Arka Plan Resmi */}
          <TouchableOpacity
            style={styles.backgroundSettingRow}
            onPress={() => setShowBackgroundPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.backgroundSettingLeft}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>
                Arka Plan Resmi
              </Text>
            </View>
            <View style={styles.backgroundSettingRight}>
              {backgroundPreview?.type === 'image' ? (
                <Image
                  source={backgroundPreview.source}
                  style={styles.backgroundThumbnail}
                  resizeMode="cover"
                />
              ) : backgroundPreview?.type === 'color' ? (
                <View
                  style={[
                    styles.backgroundThumbnail,
                    { backgroundColor: backgroundPreview.color },
                    backgroundPreview.color === '#FFFFFF' && {
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.backgroundThumbnail,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Saydamlık Ayarı - Sadece resim seçiliyse göster */}
          {background.type === 'image' && (
            <View style={styles.opacityContainer}>
              <View style={styles.opacityHeader}>
                <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>
                  Ana Ekran Saydamlık
                </Text>
              </View>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.05}
                  value={background.opacity}
                  onValueChange={setBackgroundOpacity}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.surfaceVariant}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
            </View>
          )}

          {/* Kart Saydamlık Ayarı */}
          <View style={styles.opacityContainer}>
            <View style={styles.opacityHeader}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>
                Kart Saydamlığı
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {Math.round(cardOpacity * 100)}%
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                step={0.05}
                value={cardOpacity}
                onValueChange={setCardOpacity}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </View>

          {/* Tema */}
          <Text variant="bodyLarge" style={[styles.themeLabel, { color: theme.colors.onBackground }]}>
            Tema
          </Text>
          <RadioButton.Group
            onValueChange={(value) => setTheme(value as any)}
            value={appTheme}
          >
            <RadioButton.Item label="Açık Tema" value="light" style={styles.radioItem} />
            <RadioButton.Item label="Koyu Tema" value="dark" style={styles.radioItem} />
            <RadioButton.Item label="Sistem Teması" value="system" style={styles.radioItem} />
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* Uygulama Bilgisi */}
        <List.Section>
          <List.Subheader>Hakkında</List.Subheader>
          <List.Item
            title="Uygulama Versiyonu"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </List.Section>

        {/* Alt boşluk */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Arka Plan Seçici Modal */}
      <BackgroundImagePicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  radioItem: {
    paddingVertical: 2,
  },
  notificationOptions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  minuteOptions: {
    marginLeft: -spacing.md,
  },
  minuteItem: {
    paddingVertical: 0,
  },
  backgroundSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backgroundSettingLeft: {
    flex: 1,
  },
  backgroundSettingRight: {
    marginLeft: spacing.md,
  },
  backgroundThumbnail: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  opacityContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  opacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  themeLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

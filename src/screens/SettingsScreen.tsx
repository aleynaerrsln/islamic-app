import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Linking, Modal } from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  useTheme,
  RadioButton,
  Button,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '../store/settingsStore';
import {
  sendTestNotification,
  sendTestRamadanMotivation,
  sendTestIftarReminder,
  sendTestRamazanBayrami,
  sendTestKurbanBayrami,
} from '../hooks/useNotifications';
import { CALCULATION_METHODS, MEAL_OPTIONS } from '../types';
import { spacing, borderRadius } from '../theme';
import { BackgroundImagePicker } from '../components/BackgroundImagePicker';
import { BACKGROUND_IMAGES, SOLID_COLORS } from '../data/backgroundImages';
// import { BannerAdWrapper } from '../components/BannerAdWrapper';

// Destek bilgileri
const SUPPORT_EMAIL = 'namazvakti.destek@gmail.com';
const APP_VERSION = '1.0.0';

// Gizlilik Politikası metni
const PRIVACY_POLICY = `
Namaz Vakti Gizlilik Politikası

Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}

Bu gizlilik politikası, Namaz Vakti uygulamasının kişisel verilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklar.

1. Toplanan Veriler

• Konum Bilgisi: Namaz vakitlerini doğru hesaplamak için cihazınızın konum bilgisini kullanırız. Bu bilgi yalnızca namaz vakitlerini belirlemek için kullanılır ve sunucularımızda saklanmaz.

• Cihaz Bilgileri: Uygulamanın düzgün çalışması için temel cihaz bilgileri (işletim sistemi versiyonu, cihaz modeli) toplanabilir.

2. Verilerin Kullanımı

Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
• Namaz vakitlerini hesaplamak
• Uygulama deneyimini iyileştirmek
• Hata ayıklama ve performans analizi

3. Veri Paylaşımı

Kişisel verileriniz üçüncü taraflarla paylaşılmaz veya satılmaz. Veriler yalnızca:
• Yasal zorunluluk durumlarında
• Uygulama hizmetlerini sağlamak için gerekli olduğunda kullanılabilir

4. Reklamlar

Uygulamamızda Google AdMob reklamları gösterilmektedir. Google, reklam kişiselleştirme için kendi gizlilik politikasına uygun şekilde veri toplayabilir.

5. Veri Güvenliği

Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz.

6. İletişim

Gizlilik politikası hakkında sorularınız için:
E-posta: namazvakti.destek@gmail.com

7. Değişiklikler

Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama içinden bildirilecektir.
`.trim();

export function SettingsScreen() {
  const theme = useTheme();
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const {
    calculationMethod,
    setCalculationMethod,
    theme: appTheme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    ezanSoundEnabled,
    setEzanSoundEnabled,
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
            description="Her namaz vakti girdiğinde bildirim al"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          {notificationsEnabled && (
            <>
              <List.Item
                title="Ezan Sesi"
                description={ezanSoundEnabled ? "Namaz vaktinde ezan sesi çalacak" : "Sadece sessiz bildirim gelecek"}
                left={(props) => <List.Icon {...props} icon={ezanSoundEnabled ? "volume-high" : "volume-off"} />}
                right={() => (
                  <Switch
                    value={ezanSoundEnabled}
                    onValueChange={setEzanSoundEnabled}
                  />
                )}
              />
              <View style={styles.notificationOptions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    sendTestNotification(ezanSoundEnabled);
                    Alert.alert(
                      'Bildirim',
                      ezanSoundEnabled
                        ? '2 saniye içinde ezan sesli test bildirimi gelecek'
                        : '2 saniye içinde test bildirimi gelecek'
                    );
                  }}
                  icon="bell-ring"
                  style={styles.testButton}
                >
                  Namaz Vakti Testi
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    sendTestRamadanMotivation();
                    Alert.alert('Bildirim', '2 saniye içinde Ramazan motivasyon bildirimi gelecek');
                  }}
                  icon="moon-waning-crescent"
                  style={styles.testButton}
                >
                  Ramazan Motivasyon Testi
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    sendTestIftarReminder();
                    Alert.alert('Bildirim', '2 saniye içinde iftar hatırlatma bildirimi gelecek');
                  }}
                  icon="food"
                  style={styles.testButton}
                >
                  İftar Hatırlatma Testi
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    sendTestRamazanBayrami();
                    Alert.alert('Bildirim', '2 saniye içinde Ramazan Bayramı bildirimi gelecek');
                  }}
                  icon="party-popper"
                  style={styles.testButton}
                >
                  Ramazan Bayramı Testi
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    sendTestKurbanBayrami();
                    Alert.alert('Bildirim', '2 saniye içinde Kurban Bayramı bildirimi gelecek');
                  }}
                  icon="sheep"
                  style={styles.testButton}
                >
                  Kurban Bayramı Testi
                </Button>
              </View>
            </>
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
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* Destek ve Hakkında */}
        <List.Section>
          <List.Subheader>Destek ve Hakkında</List.Subheader>
          <List.Item
            title="Destek E-postası"
            description={SUPPORT_EMAIL}
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Namaz Vakti Uygulama Desteği`);
            }}
          />
          <List.Item
            title="Gizlilik Politikası"
            description="Kişisel verilerinizin kullanımı hakkında"
            left={(props) => <List.Icon {...props} icon="shield-lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPrivacyPolicy(true)}
          />
          <List.Item
            title="Uygulama Versiyonu"
            description={APP_VERSION}
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

      {/* Gizlilik Politikası Modal */}
      <Modal
        visible={showPrivacyPolicy}
        onRequestClose={() => setShowPrivacyPolicy(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.privacyHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface, flex: 1 }}>
                Gizlilik Politikası
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPrivacyPolicy(false)}
              />
            </View>
            <ScrollView style={styles.privacyContent} showsVerticalScrollIndicator={true}>
              <Text style={[styles.privacyText, { color: theme.colors.onSurface }]}>
                {PRIVACY_POLICY}
              </Text>
            </ScrollView>
            <View style={styles.privacyFooter}>
              <Button
                mode="contained"
                onPress={() => setShowPrivacyPolicy(false)}
                style={styles.privacyButton}
              >
                Anladım
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  testButton: {
    marginTop: spacing.xs,
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
  adContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  privacyModal: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  privacyContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  privacyFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  privacyButton: {
    borderRadius: borderRadius.md,
  },
});

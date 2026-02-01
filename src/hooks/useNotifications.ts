import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import type { PrayerTimes } from '../types';
import { PRAYER_NAMES } from '../types';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface UseNotificationsResult {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermission: () => Promise<boolean>;
  schedulePrayerNotifications: (prayerTimes: PrayerTimes) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const { notificationsEnabled, notificationMinutesBefore } = useSettingsStore();

  useEffect(() => {
    // Bildirim listener'larını kur
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Bildirime tıklandı:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Bildirim izni verilmedi');
      return false;
    }

    // Android için kanal oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-times', {
        name: 'Namaz Vakitleri',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B5E20',
        sound: 'default',
      });
    }

    // Push token al (opsiyonel - Firebase için gerekli)
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } catch (error) {
      console.log('Push token alınamadı');
    }

    return true;
  };

  const schedulePrayerNotifications = async (prayerTimes: PrayerTimes): Promise<void> => {
    if (!notificationsEnabled) return;

    // Önce mevcut bildirimleri iptal et
    await cancelAllNotifications();

    const prayerOrder: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();

    for (const prayer of prayerOrder) {
      // Sunrise için bildirim atma
      if (prayer === 'Sunrise') continue;

      const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);

      // Bugün için tarih oluştur
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      // Bildirim zamanını hesapla (dakika önce)
      const notificationDate = new Date(prayerDate.getTime() - notificationMinutesBefore * 60 * 1000);

      // Eğer zaman geçmişse, bildirimi planlama
      if (notificationDate > now) {
        const prayerName = PRAYER_NAMES[prayer];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayerName} Vakti`,
            body: notificationMinutesBefore > 0
              ? `${prayerName} vaktine ${notificationMinutesBefore} dakika kaldı`
              : `${prayerName} vakti girdi`,
            sound: true,
            data: { prayer },
          },
          trigger: {
            date: notificationDate,
          },
        });

        console.log(`${prayerName} bildirimi planlandı: ${notificationDate.toLocaleTimeString()}`);
      }
    }
  };

  const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    expoPushToken,
    notification,
    requestPermission,
    schedulePrayerNotifications,
    cancelAllNotifications,
  };
}

// Test bildirimi gönder
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Bildirimi',
      body: 'Bildirimler çalışıyor!',
      sound: true,
    },
    trigger: {
      seconds: 2,
    },
  });
}

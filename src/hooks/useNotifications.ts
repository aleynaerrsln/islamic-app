import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import type { PrayerTimes } from '../types';
import { PRAYER_NAMES } from '../types';

// 2026 Ramazan tarihleri (Hicri 1447) - Diyanet takvimi
// Ramazan: 1 Ramazan (19 Şubat) - 30 Ramazan (19 Mart)
// Bayram: 1 Şevval (20 Mart) - 3 Şevval (22 Mart)
const RAMADAN_2026 = {
  start: new Date('2026-02-19T00:00:00'),
  end: new Date('2026-03-19T23:59:59'),
};

const EID_2026 = {
  start: new Date('2026-03-20T00:00:00'),
  end: new Date('2026-03-22T23:59:59'),
};

// 2026 Kurban Bayramı tarihleri (Hicri 1447) - Diyanet takvimi
// Kurban Bayramı: 10 Zilhicce (27 Mayıs) - 13 Zilhicce (30 Mayıs)
const KURBAN_BAYRAMI_2026 = {
  start: new Date('2026-05-27T00:00:00'),
  end: new Date('2026-05-30T23:59:59'),
};

// Kurban Bayramı mesajı
const KURBAN_BAYRAMI_MESSAGE = {
  title: 'Kurban Bayramınız Mübarek Olsun! 🐑',
  body: 'Kurbanlarınız kabul olsun. Sevdiklerinizle birlikte sağlıklı, huzurlu bir bayram geçirmenizi dileriz.',
};

// Bayram mesajları
const EID_MESSAGES = [
  {
    title: 'Ramazan Bayramınız Mübarek Olsun! 🎉',
    body: 'Tuttuğunuz oruçlar, kıldığınız namazlar kabul olsun. Hayırlı bayramlar!',
  },
  {
    title: 'Bayramınız Kutlu Olsun! 🌙',
    body: 'Bu mübarek günlerde sevdiklerinizle mutlu anlar geçirmenizi dileriz.',
  },
  {
    title: 'İyi Bayramlar! 🕌',
    body: 'Ramazan\'ın bereketini bayramda da yaşamanız dileğiyle. Bayramınız mübarek olsun!',
  },
];

// Ramazan motivasyon mesajları
const RAMADAN_MOTIVATION_MESSAGES = [
  {
    title: 'Ramazan Motivasyonu 🌙',
    body: 'Yarısını geçtin! Her açlık anı bir sevap. İftara az kaldı 💪',
  },
  {
    title: 'Sabret, Kazanırsın 🤲',
    body: '"Oruç bir kalkandır." - Hz. Muhammed (s.a.v.) Sabret, mükafatı Allah\'tan!',
  },
  {
    title: 'Yalnız Değilsin 🌍',
    body: 'Milyonlarca Müslüman seninle birlikte oruç tutuyor. Hep birlikte!',
  },
  {
    title: 'Dua Vakti 🤲',
    body: 'Oruçlunun duası kabul olunur. Sevdiklerin için dua etmeyi unutma!',
  },
  {
    title: 'Ramazan Bereketi 🌟',
    body: 'Bedenin oruçta, kalbin huzurda. Bu mübarek ayın bereketini hisset.',
  },
  {
    title: 'Az Kaldı! ⏰',
    body: 'Sabret, bu açlık geçici ama sevabı kalıcı. Allah seninle!',
  },
  {
    title: 'Güzel Haber 📿',
    body: '"Oruçlunun iki sevinci vardır: İftar vakti ve Rabbine kavuştuğu an."',
  },
  {
    title: 'Rahmet Ayı 🕌',
    body: 'Ramazan rahmet ayıdır. Bugün bir iyilik yap, bereketini gör!',
  },
  {
    title: 'Şükür Vakti 🙏',
    body: 'Oruç tutabildiğin için şükret. Nice insanlar bu nimetten mahrum.',
  },
  {
    title: 'Devam Et 💪',
    body: 'Her geçen saat seni iftara yaklaştırıyor. Biraz daha sabret!',
  },
];

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Yeni API - shouldShowAlert yerine
    shouldShowList: true,   // Bildirim listesinde göster
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
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const { notificationsEnabled, ezanSoundEnabled } = useSettingsStore();

  useEffect(() => {
    // Bildirim listener'larını kur
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Bildirime tıklandı:', response);
    });

    return () => {
      // Yeni expo-notifications API'si: .remove() metodu kullan
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
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

    // Android için kanalları oluştur
    if (Platform.OS === 'android') {
      // TÜM eski kanalları sil - ses değişikliği için yeni kanal gerekiyor
      const oldChannels = [
        'prayer-times',
        'prayer-times-ezan',
        'prayer-times-silent',
        'prayer-times-ezan-v3',
        'prayer-times-silent-v3',
        'namaz-ezan-v4', // Eski uzun ezan sesi kanalı
        'namaz-default-v5',
      ];
      for (const channel of oldChannels) {
        await Notifications.deleteNotificationChannelAsync(channel).catch(() => {});
      }

      // Namaz vakti bildirimleri için kanal (ezan sesli) - v5 YENI
      // Kısa ezan (25 saniye) - Android bildirim sesleri max 30sn destekler
      // ÖNEMLI: Kullanıcı uygulamayı silip yeniden yüklemeli
      await Notifications.setNotificationChannelAsync('namaz-ezan-v5', {
        name: 'Namaz Vakitleri (Ezan Sesli)',
        description: 'Namaz vakitlerinde ezan sesi ile bildirim',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B5E20',
        sound: 'ezan', // raw/ezan.mp3 dosyası (25 saniye - kısaltılmış)
        enableVibrate: true,
        showBadge: true,
        bypassDnd: true, // Rahatsız etme modunu geç
      });

      // Varsayılan sesli namaz vakti bildirimleri için kanal - v4
      await Notifications.setNotificationChannelAsync('namaz-default-v5', {
        name: 'Namaz Vakitleri (Varsayılan Ses)',
        description: 'Namaz vakitlerinde varsayılan bildirim sesi',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B5E20',
        sound: 'default',
        enableVibrate: true,
      });

      // Ramazan motivasyon bildirimleri için kanal
      await Notifications.setNotificationChannelAsync('ramadan-motivation', {
        name: 'Ramazan Motivasyonu',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });

      console.log('Bildirim kanalları oluşturuldu: namaz-ezan-v5, namaz-default-v5');
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

      // Bugün için tarih oluştur - tam namaz vaktinde
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      // Eğer vakit geçmişse, bildirimi planlama
      if (prayerDate > now) {
        const prayerName = PRAYER_NAMES[prayer];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayerName} Vakti Girdi`,
            body: `${prayerName} namazının vakti geldi. Haydi namaza!`,
            sound: true, // Android'de kanal sesi kullanılır
            data: { prayer, withEzan: ezanSoundEnabled },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayerDate,
            channelId: Platform.OS === 'android'
              ? (ezanSoundEnabled ? 'namaz-ezan-v5' : 'namaz-default-v5')
              : undefined,
          },
        });

        console.log(`${prayerName} bildirimi planlandı: ${prayerDate.toLocaleTimeString()}`);
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
export async function sendTestNotification(withEzan: boolean = false): Promise<void> {
  console.log(`Test bildirimi gönderiliyor, ezan: ${withEzan}, kanal: ${withEzan ? 'namaz-ezan-v5' : 'namaz-default-v5'}`);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: withEzan ? 'Ezan Sesi Testi 🕌' : 'Test Bildirimi',
      body: withEzan ? 'Ezan sesi bu şekilde çalacak!' : 'Bildirimler çalışıyor!',
      sound: true, // Android'de kanal sesi kullanılır
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android'
        ? (withEzan ? 'namaz-ezan-v5' : 'namaz-default-v5')
        : undefined,
    },
  });
}

// Ramazan motivasyon bildirimi testi
export async function sendTestRamadanMotivation(): Promise<void> {
  const randomIndex = Math.floor(Math.random() * RAMADAN_MOTIVATION_MESSAGES.length);
  const message = RAMADAN_MOTIVATION_MESSAGES[randomIndex];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
    },
  });
}

// İftar hatırlatma bildirimi testi
export async function sendTestIftarReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'İftara 1 Saat Kaldı! 🌙',
      body: 'Biraz daha sabret, iftar vakti yaklaşıyor. Sofranı hazırlamaya başlayabilirsin.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
    },
  });
}

// Ramazan Bayramı bildirimi testi
export async function sendTestRamazanBayrami(): Promise<void> {
  const message = EID_MESSAGES[0];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
    },
  });
}

// Kurban Bayramı bildirimi testi
export async function sendTestKurbanBayrami(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: KURBAN_BAYRAMI_MESSAGE.title,
      body: KURBAN_BAYRAMI_MESSAGE.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
    },
  });
}

// Ramazan'da olup olmadığını kontrol et
function isRamadan(): boolean {
  const now = new Date();
  return now >= RAMADAN_2026.start && now <= RAMADAN_2026.end;
}

// Ramazan'ın kaçıncı günü olduğunu hesapla
function getRamadanDay(): number {
  const now = new Date();
  const diffTime = now.getTime() - RAMADAN_2026.start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Ramazan motivasyon bildirimlerini planla
export async function scheduleRamadanMotivationNotifications(): Promise<void> {
  // Ramazan değilse bildirim planlama
  if (!isRamadan()) {
    console.log('Ramazan ayı değil, motivasyon bildirimleri planlanmadı');
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Bugün için saat 12:00'de bildirim planla
  const noonNotification = new Date(today);
  noonNotification.setHours(12, 0, 0, 0);

  // Eğer saat 12'yi geçmemişse bugün için planla
  if (noonNotification > now) {
    const dayOfRamadan = getRamadanDay();
    const messageIndex = (dayOfRamadan - 1) % RAMADAN_MOTIVATION_MESSAGES.length;
    const message = RAMADAN_MOTIVATION_MESSAGES[messageIndex];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        data: { type: 'ramadan-motivation', day: dayOfRamadan },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: noonNotification,
        channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
      },
    });

    console.log(`Ramazan ${dayOfRamadan}. gün motivasyon bildirimi planlandı: 12:00`);
  }

  // Yarın için de planla (her gün farklı mesaj)
  const tomorrowNoon = new Date(today);
  tomorrowNoon.setDate(tomorrowNoon.getDate() + 1);
  tomorrowNoon.setHours(12, 0, 0, 0);

  // Yarın hala Ramazan'daysa
  if (tomorrowNoon <= RAMADAN_2026.end) {
    const tomorrowDayOfRamadan = getRamadanDay() + 1;
    const messageIndex = (tomorrowDayOfRamadan - 1) % RAMADAN_MOTIVATION_MESSAGES.length;
    const message = RAMADAN_MOTIVATION_MESSAGES[messageIndex];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        data: { type: 'ramadan-motivation', day: tomorrowDayOfRamadan },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tomorrowNoon,
        channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
      },
    });

    console.log(`Ramazan ${tomorrowDayOfRamadan}. gün motivasyon bildirimi planlandı: yarın 12:00`);
  }
}

// İftara 1 saat kala hatırlatma bildirimi planla
export async function scheduleIftarReminderNotification(iftarTime: string): Promise<void> {
  if (!isRamadan()) return;

  const now = new Date();
  const [hours, minutes] = iftarTime.split(':').map(Number);

  const iftarDate = new Date(now);
  iftarDate.setHours(hours, minutes, 0, 0);

  // İftara 1 saat kala
  const reminderDate = new Date(iftarDate.getTime() - 60 * 60 * 1000);

  if (reminderDate > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'İftara 1 Saat Kaldı! 🌙',
        body: 'Biraz daha sabret, iftar vakti yaklaşıyor. Sofranı hazırlamaya başlayabilirsin.',
        sound: true,
        data: { type: 'iftar-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
      },
    });

    console.log('İftar hatırlatma bildirimi planlandı');
  }
}

// Ramazan Bayramı'nın 1. günü mü kontrol et
function isEidFirstDay(): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eidFirstDay = new Date(EID_2026.start.getFullYear(), EID_2026.start.getMonth(), EID_2026.start.getDate());
  return today.getTime() === eidFirstDay.getTime();
}

// Kurban Bayramı'nın 1. günü mü kontrol et
function isKurbanBayramiFirstDay(): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const kurbanFirstDay = new Date(KURBAN_BAYRAMI_2026.start.getFullYear(), KURBAN_BAYRAMI_2026.start.getMonth(), KURBAN_BAYRAMI_2026.start.getDate());
  return today.getTime() === kurbanFirstDay.getTime();
}

// Bayram bildirimlerini planla (sadece 1. günlerde)
export async function scheduleEidNotifications(): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Ramazan Bayramı 1. gün - sabah 09:00'da bildirim
  if (isEidFirstDay()) {
    const morningNotification = new Date(today);
    morningNotification.setHours(9, 0, 0, 0);

    if (morningNotification > now) {
      const message = EID_MESSAGES[0];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          data: { type: 'ramazan-bayrami-greeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: morningNotification,
          channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
        },
      });

      console.log('Ramazan Bayramı 1. gün bildirimi planlandı: 09:00');
    }
  }

  // Kurban Bayramı 1. gün - sabah 09:00'da bildirim
  if (isKurbanBayramiFirstDay()) {
    const morningNotification = new Date(today);
    morningNotification.setHours(9, 0, 0, 0);

    if (morningNotification > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: KURBAN_BAYRAMI_MESSAGE.title,
          body: KURBAN_BAYRAMI_MESSAGE.body,
          sound: true,
          data: { type: 'kurban-bayrami-greeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: morningNotification,
          channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
        },
      });

      console.log('Kurban Bayramı 1. gün bildirimi planlandı: 09:00');
    }
  }

  // Ramazan Bayramı arefesi için bildirim planla
  const ramazanArefeDate = new Date(EID_2026.start);
  ramazanArefeDate.setDate(ramazanArefeDate.getDate() - 1);
  const isRamazanArefe = today.getTime() === new Date(ramazanArefeDate.getFullYear(), ramazanArefeDate.getMonth(), ramazanArefeDate.getDate()).getTime();

  if (isRamazanArefe) {
    const eveningNotification = new Date(today);
    eveningNotification.setHours(20, 0, 0, 0);

    if (eveningNotification > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Arefe Gününüz Mübarek Olsun! 🌙',
          body: 'Yarın bayram! Ramazan\'ı güzelce tamamladınız. Allah kabul etsin.',
          sound: true,
          data: { type: 'ramazan-arefe-greeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: eveningNotification,
          channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
        },
      });

      console.log('Ramazan Bayramı arefe bildirimi planlandı: 20:00');
    }
  }

  // Kurban Bayramı arefesi için bildirim planla
  const kurbanArefeDate = new Date(KURBAN_BAYRAMI_2026.start);
  kurbanArefeDate.setDate(kurbanArefeDate.getDate() - 1);
  const isKurbanArefe = today.getTime() === new Date(kurbanArefeDate.getFullYear(), kurbanArefeDate.getMonth(), kurbanArefeDate.getDate()).getTime();

  if (isKurbanArefe) {
    const eveningNotification = new Date(today);
    eveningNotification.setHours(20, 0, 0, 0);

    if (eveningNotification > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Kurban Bayramı Arefesi Mübarek Olsun! 🌙',
          body: 'Yarın Kurban Bayramı! Dualarınız kabul olsun.',
          sound: true,
          data: { type: 'kurban-arefe-greeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: eveningNotification,
          channelId: Platform.OS === 'android' ? 'ramadan-motivation' : undefined,
        },
      });

      console.log('Kurban Bayramı arefe bildirimi planlandı: 20:00');
    }
  }
}

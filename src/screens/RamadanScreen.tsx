import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { useSettingsStore } from '../store/settingsStore';
import { usePrayerStore } from '../store/prayerStore';
import { getDiyanetMonthlyCalendar } from '../api/diyanet';
import { useAds } from '../services/adService';

const { width } = Dimensions.get('window');

// Gün isimleri (Türkçe)
const DAY_NAMES: { [key: string]: string } = {
  'Monday': 'Pazartesi',
  'Tuesday': 'Salı',
  'Wednesday': 'Çarşamba',
  'Thursday': 'Perşembe',
  'Friday': 'Cuma',
  'Saturday': 'Cumartesi',
  'Sunday': 'Pazar',
};

// Ay isimleri (Türkçe)
const MONTH_NAMES: { [key: string]: string } = {
  'January': 'Ocak',
  'February': 'Şubat',
  'March': 'Mart',
  'April': 'Nisan',
  'May': 'Mayıs',
  'June': 'Haziran',
  'July': 'Temmuz',
  'August': 'Ağustos',
  'September': 'Eylül',
  'October': 'Ekim',
  'November': 'Kasım',
  'December': 'Aralık',
};

// 2026 Ramazan tarihleri (Hicri 1447)
// Ramazan: 19 Şubat - 19 Mart 2026 (Diyanet takvimi)
// Bayram: 20 Mart - 22 Mart 2026
const RAMADAN_2026 = {
  start: new Date('2026-02-19T00:00:00'),
  end: new Date('2026-03-19T23:59:59'),
  year: 2026,
  hijriYear: 1447,
};

// İmsakiye veri tipi
interface ImsakiyeDay {
  day: number;
  hicri: string;
  miladi: string;
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
}

// Ramazan duaları
const RAMADAN_DUAS = [
  {
    id: 'iftar',
    title: 'İftar Duası',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    turkishReading: 'Allahümme leke sumtü ve bike amentü ve ala rızkıke eftartü',
    meaning: 'Allah\'ım! Senin için oruç tuttum, Sana iman ettim ve Senin rızkınla orucumu açtım.',
  },
  {
    id: 'sahur',
    title: 'Sahur Duası (Niyet)',
    arabic: 'نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ خَالِصًا لِوَجْهِ اللهِ تَعَالَى',
    turkishReading: 'Neveytü en esume sevme şehri Ramazane minel fecri ilel mağribi halisen lillahi teala',
    meaning: 'Niyet ettim Allah rızası için Ramazan orucunu tutmaya.',
  },
  {
    id: 'kadir',
    title: 'Kadir Gecesi Duası',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    turkishReading: 'Allahümme inneke afüvvün tühibbül afve fa\'fü anni',
    meaning: 'Allah\'ım! Sen affedicisin, affetmeyi seversin, beni de affet.',
  },
];

interface FastingRecord {
  [day: number]: boolean;
}

// Teravih namazı kılınışı
const TERAVIH_STEPS = [
  {
    id: 1,
    title: 'Niyet',
    description: 'Teravih namazına niyet edilir: "Niyet ettim Allah rızası için bu gecenin teravih namazını kılmaya"',
  },
  {
    id: 2,
    title: 'İlk 4 Rekat',
    description: '4 rekatlık ilk sünnet namazı gibi kılınır. Her rekatta Fatiha ve bir sure okunur. 2. rekatta oturup Ettehiyyatü, 4. rekatta Ettehiyyatü, Salli-Barik ve Rabbena okunup selam verilir.',
  },
  {
    id: 3,
    title: 'Salat-ü Selam',
    description: 'Her 4 rekatın ardından "Allahümme salli ala seyyidina Muhammedin ve ala ali seyyidina Muhammed" okunur.',
  },
  {
    id: 4,
    title: 'İkinci 4 Rekat',
    description: 'Aynı şekilde 4 rekat daha kılınır.',
  },
  {
    id: 5,
    title: 'Üçüncü 4 Rekat',
    description: 'Aynı şekilde 4 rekat daha kılınır. Toplamda 12 rekat tamamlanır.',
  },
  {
    id: 6,
    title: 'Dördüncü 4 Rekat',
    description: 'Aynı şekilde 4 rekat daha kılınır. Toplamda 16 rekat tamamlanır.',
  },
  {
    id: 7,
    title: 'Son 4 Rekat',
    description: 'Son 4 rekat kılınır. Böylece 20 rekat teravih tamamlanmış olur.',
  },
  {
    id: 8,
    title: 'Vitir Namazı',
    description: 'Teravih namazından sonra 3 rekat vitir namazı kılınır. 3. rekatta Kunut duaları okunur.',
  },
];

export function RamadanScreen() {
  const theme = useTheme();
  const { cardOpacity, location } = useSettingsStore();
  // Ana sayfa ile aynı namaz vakitlerini kullan (tutarlılık için)
  const { prayerTimes } = usePrayerStore();
  const { showInterstitialForAction } = useAds();
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fastingRecord, setFastingRecord] = useState<FastingRecord>({});
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [selectedDua, setSelectedDua] = useState<typeof RAMADAN_DUAS[0] | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTeravihModal, setShowTeravihModal] = useState(false);
  const [showImsakiyeModal, setShowImsakiyeModal] = useState(false);
  const [imsakiyeData, setImsakiyeData] = useState<ImsakiyeDay[]>([]);
  const [imsakiyeLoading, setImsakiyeLoading] = useState(false);

  // Teravih modalını aç (reklam göstererek)
  const openTeravihModal = async () => {
    await showInterstitialForAction('teravih_guide');
    setShowTeravihModal(true);
  };

  // İmsakiye modalını aç (reklam göstererek)
  const openImsakiyeModal = async () => {
    await showInterstitialForAction('imsakiye_calendar');
    setShowImsakiyeModal(true);
  };

  // Saati formatla (sadece saat:dakika)
  const formatTime = (time: string | undefined) => {
    if (!time) return '--:--';
    return time.split(' ')[0];
  };

  // İmsakiye verilerini API'den çek (Ramazan takvimi için)
  const fetchImsakiye = useCallback(async () => {
    if (!location) return;

    setImsakiyeLoading(true);
    try {
      // Şubat ve Mart ayları için verileri çek (Ramazan iki ayı kapsıyor) - Diyanet API
      const [febData, marData] = await Promise.all([
        getDiyanetMonthlyCalendar(2026, 2, location.latitude, location.longitude),
        getDiyanetMonthlyCalendar(2026, 3, location.latitude, location.longitude),
      ]);

      const allDays = [...febData.data, ...marData.data];

      // Ramazan günlerini filtrele (Hicri 9. ay = Ramazan)
      const ramadanDays = allDays.filter((day: any) =>
        day.date.hijri.month.number === 9
      );

      // İmsakiye formatına dönüştür
      const formattedImsakiye: ImsakiyeDay[] = ramadanDays.map((day: any) => {
        const gregorianDate = day.date.gregorian;
        const hijriDate = day.date.hijri;
        const timings = day.timings;

        // Gün ve ay isimlerini Türkçeye çevir
        const dayName = DAY_NAMES[gregorianDate.weekday.en] || gregorianDate.weekday.en;
        const monthName = MONTH_NAMES[gregorianDate.month.en] || gregorianDate.month.en;

        return {
          day: parseInt(hijriDate.day),
          hicri: `${hijriDate.day} Ramazan ${hijriDate.year}`,
          miladi: `${gregorianDate.day} ${monthName} ${gregorianDate.year} ${dayName}`,
          imsak: timings.Imsak?.split(' ')[0] || timings.Fajr?.split(' ')[0] || '--:--',
          gunes: timings.Sunrise?.split(' ')[0] || '--:--',
          ogle: timings.Dhuhr?.split(' ')[0] || '--:--',
          ikindi: timings.Asr?.split(' ')[0] || '--:--',
          aksam: timings.Maghrib?.split(' ')[0] || '--:--',
          yatsi: timings.Isha?.split(' ')[0] || '--:--',
        };
      });

      setImsakiyeData(formattedImsakiye);
    } catch (error) {
      console.error('İmsakiye verileri alınamadı:', error);
    } finally {
      setImsakiyeLoading(false);
    }
  }, [location]);

  // Her saniye güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Konum değiştiğinde imsakiye verilerini çek
  useEffect(() => {
    if (location) {
      fetchImsakiye();
    }
  }, [location, fetchImsakiye]);

  // Oruç kayıtlarını yükle
  useEffect(() => {
    loadFastingRecord();
  }, []);

  const loadFastingRecord = async () => {
    try {
      const stored = await AsyncStorage.getItem('fastingRecord2026');
      if (stored) {
        setFastingRecord(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Oruç kaydı yüklenemedi');
    }
  };

  const saveFastingRecord = async (record: FastingRecord) => {
    try {
      await AsyncStorage.setItem('fastingRecord2026', JSON.stringify(record));
    } catch (error) {
      console.log('Oruç kaydı kaydedilemedi');
    }
  };

  const toggleFasting = (day: number) => {
    const newRecord = { ...fastingRecord, [day]: !fastingRecord[day] };
    setFastingRecord(newRecord);
    saveFastingRecord(newRecord);
  };

  // Ramazan hesaplamaları
  const ramadanInfo = useMemo(() => {
    const now = currentTime;
    const start = RAMADAN_2026.start;
    const end = RAMADAN_2026.end;

    const isRamadan = now >= start && now <= end;
    const isBeforeRamadan = now < start;

    let currentDay = 0;
    let daysRemaining = 30;
    let daysUntilStart = 0;

    if (isRamadan) {
      const diffTime = now.getTime() - start.getTime();
      currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      daysRemaining = 30 - currentDay;
    } else if (isBeforeRamadan) {
      const diffTime = start.getTime() - now.getTime();
      daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      isRamadan,
      isBeforeRamadan,
      currentDay,
      daysRemaining,
      daysUntilStart,
      totalDays: 30,
    };
  }, [currentTime]);

  // İftar/Sahur sayacı - sadece Ramazan'da çalışır
  const countdownInfo = useMemo(() => {
    // Ramazan dışında 00:00:00 göster
    if (!ramadanInfo.isRamadan) {
      return {
        targetTime: '--:--',
        targetLabel: 'Ramazan Bekleniyor',
        remainingHours: 0,
        remainingMins: 0,
        remainingSeconds: 0,
        isFasting: false,
        isActive: false,
      };
    }

    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // prayerTimes yoksa varsayılan değerler kullan (HomeScreen ile aynı kaynağı kullan)
    const imsakTime = formatTime(prayerTimes?.Fajr) !== '--:--' ? formatTime(prayerTimes?.Fajr) : '05:30';
    const iftarTime = formatTime(prayerTimes?.Maghrib) !== '--:--' ? formatTime(prayerTimes?.Maghrib) : '18:30';

    // İmsak ve iftar vakitlerini dakikaya çevir
    const [imsakH, imsakM] = imsakTime.split(':').map(Number);
    const [iftarH, iftarM] = iftarTime.split(':').map(Number);
    const imsakMinutes = imsakH * 60 + imsakM;
    const iftarMinutes = iftarH * 60 + iftarM;

    let targetTime: string;
    let targetLabel: string;
    let remainingMinutes: number;
    let isFasting: boolean;

    if (currentMinutes < imsakMinutes) {
      // Sahura kadar
      targetTime = imsakTime;
      targetLabel = 'Sahur';
      remainingMinutes = imsakMinutes - currentMinutes;
      isFasting = false;
    } else if (currentMinutes < iftarMinutes) {
      // İftara kadar
      targetTime = iftarTime;
      targetLabel = 'İftar';
      remainingMinutes = iftarMinutes - currentMinutes;
      isFasting = true;
    } else {
      // Ertesi gün sahura kadar
      targetTime = imsakTime;
      targetLabel = 'Sahur';
      remainingMinutes = (24 * 60 - currentMinutes) + imsakMinutes;
      isFasting = false;
    }

    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    const remainingSeconds = 59 - now.getSeconds();

    return {
      targetTime,
      targetLabel,
      remainingHours,
      remainingMins,
      remainingSeconds,
      isFasting,
      isActive: true,
    };
  }, [currentTime, ramadanInfo.isRamadan, prayerTimes]);

  // Tutulan oruç sayısı
  const fastingStats = useMemo(() => {
    const completed = Object.values(fastingRecord).filter(Boolean).length;
    const remaining = 30 - completed;
    const percentage = Math.round((completed / 30) * 100);
    return { completed, remaining, percentage };
  }, [fastingRecord]);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  const openDua = (dua: typeof RAMADAN_DUAS[0]) => {
    setSelectedDua(dua);
    setShowDuaModal(true);
  };

  return (
    <BackgroundWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ramazan</Text>
        </View>

        {/* Ramazan Durumu */}
        {ramadanInfo.isBeforeRamadan && (
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Icon name="calendar-clock" size={32} color="#FF9800" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Ramazan'a Kalan</Text>
              <Text style={styles.statusValue}>{ramadanInfo.daysUntilStart} Gün</Text>
              <Text style={styles.statusDate}>
                {RAMADAN_2026.start.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {ramadanInfo.isRamadan && (
          <View style={[styles.statusCard, styles.activeRamadan]}>
            <View style={styles.statusIcon}>
              <Icon name="star-crescent" size={32} color="#4CAF50" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Ramazan'ın</Text>
              <Text style={styles.statusValue}>{ramadanInfo.currentDay}. Günü</Text>
              <Text style={styles.statusDate}>
                {ramadanInfo.daysRemaining} gün kaldı
              </Text>
            </View>
          </View>
        )}

        {/* Sayaç Kartı */}
        <View style={[styles.countdownCard, { backgroundColor: cardBgColor }]}>
          <View style={styles.countdownHeader}>
            <Icon
              name={countdownInfo.isActive
                ? (countdownInfo.isFasting ? 'weather-sunset-down' : 'weather-sunset-up')
                : 'clock-outline'}
              size={24}
              color={countdownInfo.isActive
                ? (countdownInfo.isFasting ? '#FF9800' : '#9C27B0')
                : 'rgba(255,255,255,0.4)'}
            />
            <Text style={styles.countdownLabel}>
              {countdownInfo.isActive
                ? `${countdownInfo.targetLabel} Vaktine Kalan`
                : 'Ramazan Bekleniyor'}
            </Text>
          </View>

          <View style={styles.countdownTimer}>
            <View style={[styles.timeBlock, !countdownInfo.isActive && styles.timeBlockInactive]}>
              <Text style={[styles.timeValue, !countdownInfo.isActive && styles.timeValueInactive]}>
                {formatNumber(countdownInfo.remainingHours)}
              </Text>
              <Text style={styles.timeLabel}>Saat</Text>
            </View>
            <Text style={[styles.timeSeparator, !countdownInfo.isActive && styles.timeValueInactive]}>:</Text>
            <View style={[styles.timeBlock, !countdownInfo.isActive && styles.timeBlockInactive]}>
              <Text style={[styles.timeValue, !countdownInfo.isActive && styles.timeValueInactive]}>
                {formatNumber(countdownInfo.remainingMins)}
              </Text>
              <Text style={styles.timeLabel}>Dakika</Text>
            </View>
            <Text style={[styles.timeSeparator, !countdownInfo.isActive && styles.timeValueInactive]}>:</Text>
            <View style={[styles.timeBlock, !countdownInfo.isActive && styles.timeBlockInactive]}>
              <Text style={[styles.timeValue, !countdownInfo.isActive && styles.timeValueInactive]}>
                {formatNumber(countdownInfo.remainingSeconds)}
              </Text>
              <Text style={styles.timeLabel}>Saniye</Text>
            </View>
          </View>

          <View style={styles.countdownFooter}>
            <Text style={styles.countdownTime}>
              {countdownInfo.isActive
                ? `${countdownInfo.targetLabel}: ${countdownInfo.targetTime}`
                : 'Ramazan başladığında aktif olacak'}
            </Text>
          </View>
        </View>

        {/* İmsakiye Takvimi Kartı */}
        <TouchableOpacity
          style={[styles.imsakiyeClickCard, { backgroundColor: cardBgColor }]}
          onPress={openImsakiyeModal}
          activeOpacity={0.8}
        >
          <Icon name="calendar-month" size={32} color="#9C27B0" />
          <View style={styles.imsakiyeClickInfo}>
            <Text style={styles.imsakiyeClickTitle}>Ramazan İmsakiyesi</Text>
            <Text style={styles.imsakiyeClickDesc}>
              30 günlük imsak ve iftar vakitlerini görüntüle
            </Text>
            <Text style={styles.imsakiyeClickLink}>İmsakiyeyi görmek için tıklayın →</Text>
          </View>
        </TouchableOpacity>

        {/* Bugünün Vakitleri */}
        <View style={[styles.imsakiyeCard, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <Icon name="clock-outline" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>Bugünün Vakitleri</Text>
            {location && (
              <Text style={styles.locationBadge}>{location.city}</Text>
            )}
          </View>

          <View style={styles.imsakiyeGrid}>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-night" size={20} color="#9C27B0" />
              <Text style={styles.imsakiyeLabel}>İmsak</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Fajr)}</Text>
            </View>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-sunset-up" size={20} color="#FF9800" />
              <Text style={styles.imsakiyeLabel}>Güneş</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Sunrise)}</Text>
            </View>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-sunny" size={20} color="#FFC107" />
              <Text style={styles.imsakiyeLabel}>Öğle</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Dhuhr)}</Text>
            </View>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-partly-cloudy" size={20} color="#FF5722" />
              <Text style={styles.imsakiyeLabel}>İkindi</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Asr)}</Text>
            </View>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-sunset-down" size={20} color="#E91E63" />
              <Text style={styles.imsakiyeLabel}>Akşam</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Maghrib)}</Text>
            </View>
            <View style={styles.imsakiyeItem}>
              <Icon name="weather-night" size={20} color="#673AB7" />
              <Text style={styles.imsakiyeLabel}>Yatsı</Text>
              <Text style={styles.imsakiyeTime}>{formatTime(prayerTimes?.Isha)}</Text>
            </View>
          </View>
        </View>

        {/* Oruç Takibi */}
        <View style={[styles.fastingCard, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <Icon name="check-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>Oruç Takibi</Text>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => setShowCalendarModal(true)}
            >
              <Icon name="calendar-month" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.fastingStats}>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>{fastingStats.completed}</Text>
              <Text style={styles.fastingStatLabel}>Tutulan</Text>
            </View>
            <View style={styles.fastingProgress}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{fastingStats.percentage}%</Text>
              </View>
            </View>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>{fastingStats.remaining}</Text>
              <Text style={styles.fastingStatLabel}>Kalan</Text>
            </View>
          </View>

          {/* Mini takvim */}
          <View style={styles.miniCalendar}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calendarDay,
                  fastingRecord[day] && styles.calendarDayCompleted,
                  ramadanInfo.isRamadan && day === ramadanInfo.currentDay && styles.calendarDayToday,
                ]}
                onPress={() => toggleFasting(day)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    fastingRecord[day] && styles.calendarDayTextCompleted,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ramazan Duaları */}
        <View style={styles.duasSection}>
          <View style={styles.cardHeader}>
            <Icon name="hands-pray" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>Ramazan Duaları</Text>
          </View>

          {RAMADAN_DUAS.map((dua) => (
            <View
              key={dua.id}
              style={[styles.duaCardExpanded, { backgroundColor: cardBgColor }]}
            >
              <View style={styles.duaTitleRow}>
                <Icon name="star-four-points" size={16} color="#4CAF50" />
                <Text style={styles.duaTitle}>{dua.title}</Text>
              </View>
              <Text style={styles.duaArabicText}>{dua.arabic}</Text>
              <Text style={styles.duaReadingText}>{dua.turkishReading}</Text>
              <View style={styles.duaMeaningBox}>
                <Text style={styles.duaMeaningLabel}>Anlamı:</Text>
                <Text style={styles.duaMeaningText}>{dua.meaning}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fitre Bilgisi */}
        <View style={styles.fitreCard}>
          <View style={styles.fitreHeader}>
            <Icon name="hand-coin" size={24} color="#FFD700" />
            <View style={styles.fitreInfo}>
              <Text style={styles.fitreTitle}>Fitre (Sadaka-i Fıtr)</Text>
              <Text style={styles.fitreDesc}>
                Her Müslüman'ın Ramazan ayında vermesi gereken sadaka
              </Text>
            </View>
          </View>
          <View style={styles.fitreAmount}>
            <Text style={styles.fitreValue}>2026 Fitre Miktarı</Text>
            <Text style={styles.fitrePrice}>₺150 - ₺250</Text>
            <Text style={styles.fitreNote}>
              *Diyanet tarafından belirlenen miktara göre değişir
            </Text>
          </View>
        </View>

        {/* Teravih Bilgisi */}
        <TouchableOpacity
          style={styles.teravihCard}
          onPress={openTeravihModal}
          activeOpacity={0.8}
        >
          <Icon name="mosque" size={32} color="#4CAF50" />
          <View style={styles.teravihInfo}>
            <Text style={styles.teravihTitle}>Teravih Namazı</Text>
            <Text style={styles.teravihDesc}>
              Ramazan gecelerinde yatsı namazından sonra kılınan 20 rekatlık sünnet namaz
            </Text>
            <Text style={styles.teravihLink}>Nasıl kılınır? Tıklayın →</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Dua Modal */}
      <Modal
        visible={showDuaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDuaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.duaModal}>
            <View style={styles.duaModalHeader}>
              <TouchableOpacity onPress={() => setShowDuaModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.duaModalTitle}>{selectedDua?.title}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.duaModalContent}>
              <View style={styles.arabicContainer}>
                <Text style={styles.arabicText}>{selectedDua?.arabic}</Text>
              </View>

              <View style={styles.readingContainer}>
                <Text style={styles.readingLabel}>Okunuşu</Text>
                <Text style={styles.readingText}>{selectedDua?.turkishReading}</Text>
              </View>

              <View style={styles.meaningContainer}>
                <Text style={styles.meaningLabel}>Anlamı</Text>
                <Text style={styles.meaningText}>{selectedDua?.meaning}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Teravih Modal */}
      <Modal
        visible={showTeravihModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeravihModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.teravihModal}>
            <View style={styles.duaModalHeader}>
              <TouchableOpacity onPress={() => setShowTeravihModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.duaModalTitle}>Teravih Namazı Kılınışı</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.duaModalContent} showsVerticalScrollIndicator={false}>
              {/* Özet bilgi */}
              <View style={styles.teravihSummary}>
                <View style={styles.teravihSummaryItem}>
                  <Text style={styles.teravihSummaryValue}>20</Text>
                  <Text style={styles.teravihSummaryLabel}>Rekat</Text>
                </View>
                <View style={styles.teravihSummaryDivider} />
                <View style={styles.teravihSummaryItem}>
                  <Text style={styles.teravihSummaryValue}>5</Text>
                  <Text style={styles.teravihSummaryLabel}>Selam</Text>
                </View>
                <View style={styles.teravihSummaryDivider} />
                <View style={styles.teravihSummaryItem}>
                  <Text style={styles.teravihSummaryValue}>4</Text>
                  <Text style={styles.teravihSummaryLabel}>Rekat/Selam</Text>
                </View>
              </View>

              {/* Önemli not */}
              <View style={styles.teravihNote}>
                <Icon name="information" size={20} color="#FF9800" />
                <Text style={styles.teravihNoteText}>
                  Teravih namazı, Ramazan ayında yatsı namazından sonra kılınan müekked sünnettir.
                  Her 4 rekatta bir selam verilir. Cemaatle kılınması daha faziletlidir.
                </Text>
              </View>

              {/* Adımlar */}
              {TERAVIH_STEPS.map((step, index) => (
                <View key={step.id} style={styles.teravihStep}>
                  <View style={styles.teravihStepNumber}>
                    <Text style={styles.teravihStepNumberText}>{step.id}</Text>
                  </View>
                  <View style={styles.teravihStepContent}>
                    <Text style={styles.teravihStepTitle}>{step.title}</Text>
                    <Text style={styles.teravihStepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}

              {/* Hatim bilgisi */}
              <View style={styles.hatimInfo}>
                <Icon name="book-open-variant" size={24} color="#4CAF50" />
                <View style={styles.hatimInfoContent}>
                  <Text style={styles.hatimInfoTitle}>Hatim ile Teravih</Text>
                  <Text style={styles.hatimInfoDesc}>
                    Camilerde teravih namazı genellikle hatimle kılınır.
                    Her gece Kur'an-ı Kerim'den belirli bölümler okunarak
                    Ramazan boyunca bir hatim tamamlanır.
                  </Text>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İmsakiye Modal */}
      <Modal
        visible={showImsakiyeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImsakiyeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imsakiyeModal}>
            <View style={styles.duaModalHeader}>
              <TouchableOpacity onPress={() => setShowImsakiyeModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.duaModalTitle}>Ramazan İmsakiyesi 2026</Text>
                {location && <Text style={styles.imsakiyeLocationText}>{location.city}</Text>}
              </View>
              <View style={{ width: 24 }} />
            </View>

            {imsakiyeLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9C27B0" />
                <Text style={styles.loadingText}>İmsakiye yükleniyor...</Text>
              </View>
            ) : imsakiyeData.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Icon name="calendar-remove" size={48} color="rgba(255,255,255,0.3)" />
                <Text style={styles.loadingText}>İmsakiye verisi bulunamadı</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchImsakiye}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            ) : (
            <ScrollView style={styles.imsakiyeTableContainer} showsVerticalScrollIndicator={false}>
              {imsakiyeData.map((item) => {
                const isCurrentDay = ramadanInfo.isRamadan && item.day === ramadanInfo.currentDay;
                return (
                  <View
                    key={item.day}
                    style={[
                      styles.imsakiyeDayCard,
                      isCurrentDay && styles.imsakiyeDayCardCurrent,
                    ]}
                  >
                    {/* Tarih Satırı */}
                    <View style={styles.imsakiyeDateRow}>
                      <Text style={[styles.imsakiyeHicriText, isCurrentDay && styles.imsakiyeTextCurrent]}>
                        {item.hicri}
                      </Text>
                      <Text style={[styles.imsakiyeMiladiText, isCurrentDay && styles.imsakiyeTextCurrent]}>
                        {item.miladi}
                      </Text>
                    </View>
                    {/* Vakitler Satırı */}
                    <View style={styles.imsakiyeTimesRow}>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>İmsak</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.imsak}</Text>
                      </View>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>Güneş</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.gunes}</Text>
                      </View>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>Öğle</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.ogle}</Text>
                      </View>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>İkindi</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.ikindi}</Text>
                      </View>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>Akşam</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.aksam}</Text>
                      </View>
                      <View style={styles.imsakiyeTimeBox}>
                        <Text style={styles.imsakiyeTimeLabel}>Yatsı</Text>
                        <Text style={[styles.imsakiyeTimeValue, isCurrentDay && styles.imsakiyeTimeValueCurrent]}>{item.yatsi}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.35)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  activeRamadan: {
    backgroundColor: 'rgba(76, 175, 80, 0.35)',
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statusDate: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  // Countdown Card
  countdownCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  countdownLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  countdownTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timeBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    minWidth: 70,
  },
  timeValue: {
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
  },
  timeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 38,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  countdownFooter: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  countdownTime: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },

  // Imsakiye
  imsakiyeCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  imsakiyeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imsakiyeItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  imsakiyeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  imsakiyeTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },

  // Fasting Tracker
  fastingCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
  },
  calendarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  fastingStat: {
    alignItems: 'center',
  },
  fastingStatValue: {
    fontSize: 34,
    fontWeight: '700',
    color: '#4CAF50',
  },
  fastingStatLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  fastingProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  miniCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarDay: {
    width: (width - spacing.lg * 2 - spacing.md * 2 - 6 * 9) / 10,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayCompleted: {
    backgroundColor: '#4CAF50',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  calendarDayText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  calendarDayTextCompleted: {
    color: '#fff',
  },

  // Duas Section
  duasSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  duaCardExpanded: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  duaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  duaTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  duaArabicText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  duaReadingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  duaMeaningBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    padding: spacing.md,
    borderRadius: 12,
  },
  duaMeaningLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  duaMeaningText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },

  // Fitre Card
  fitreCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
  },
  fitreHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fitreInfo: {
    flex: 1,
  },
  fitreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  fitreDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  fitreAmount: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  fitreValue: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  fitrePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginVertical: 4,
  },
  fitreNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },

  // Teravih Card
  teravihCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  teravihInfo: {
    flex: 1,
  },
  teravihTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  teravihDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  duaModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  duaModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  duaModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  duaModalContent: {
    padding: spacing.lg,
  },
  arabicContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  arabicText: {
    fontSize: 24,
    color: '#4CAF50',
    textAlign: 'right',
    lineHeight: 40,
  },
  readingContainer: {
    marginBottom: spacing.lg,
  },
  readingLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xs,
  },
  readingText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  meaningContainer: {
    marginBottom: spacing.xl,
  },
  meaningLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xs,
  },
  meaningText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },

  // Inactive countdown
  timeBlockInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timeValueInactive: {
    color: 'rgba(255,255,255,0.3)',
  },

  // Teravih link
  teravihLink: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '500',
  },

  // Teravih Modal
  teravihModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  teravihSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  teravihSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  teravihSummaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
  },
  teravihSummaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  teravihSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  teravihNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  teravihNoteText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  teravihStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  teravihStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  teravihStepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  teravihStepContent: {
    flex: 1,
  },
  teravihStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  teravihStepDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
  },
  hatimInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  hatimInfoContent: {
    flex: 1,
  },
  hatimInfoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  hatimInfoDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },

  // İmsakiye Tıklanabilir Kart
  imsakiyeClickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  imsakiyeClickInfo: {
    flex: 1,
  },
  imsakiyeClickTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9C27B0',
  },
  imsakiyeClickDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  imsakiyeClickLink: {
    fontSize: 14,
    color: '#9C27B0',
    marginTop: 6,
    fontWeight: '500',
  },

  // İmsakiye Modal
  imsakiyeModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    minHeight: 500,
  },
  imsakiyeTableContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  imsakiyeDayCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.sm,
    marginVertical: 4,
  },
  imsakiyeDayCardCurrent: {
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  imsakiyeDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  imsakiyeHicriText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CE93D8',
  },
  imsakiyeMiladiText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  imsakiyeTextCurrent: {
    color: '#fff',
  },
  imsakiyeTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imsakiyeTimeBox: {
    alignItems: 'center',
    flex: 1,
  },
  imsakiyeTimeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  imsakiyeTimeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  imsakiyeTimeValueCurrent: {
    color: '#fff',
  },

  // Location badge
  locationBadge: {
    fontSize: 11,
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // Imsakiye modal extras
  imsakiyeLocationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#CE93D8',
    fontWeight: '500',
  },
});

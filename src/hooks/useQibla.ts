import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { getQiblaDirection, calculateDistanceToMecca, calculateQiblaDirection } from '../api/aladhan';
import type { Location } from '../types';

interface UseQiblaResult {
  qiblaDirection: number; // Kıble yönü (derece, gerçek kuzeyden)
  compassHeading: number; // Pusula yönü (derece, gerçek kuzeyden)
  qiblaAngle: number; // Gösterilecek açı (qiblaDirection - compassHeading)
  distanceToMecca: number; // Mekke'ye mesafe (km)
  isLoading: boolean;
  error: string | null;
  isCalibrated: boolean;
}

// Low-pass filter katsayısı (0-1 arası, düşük = daha yumuşak)
const SMOOTHING_FACTOR = 0.1;

// Manyetik sapma (declination) hesaplama
// Basitleştirilmiş World Magnetic Model (WMM) yaklaşımı
// Türkiye için yaklaşık 5-6 derece doğu
function getMagneticDeclination(latitude: number, longitude: number): number {
  // Basitleştirilmiş hesaplama - Türkiye ve çevresi için
  // Gerçek değerler için NOAA WMM API kullanılabilir
  // Türkiye'nin büyük bölümü için declination yaklaşık 5-6 derece doğudur (pozitif)

  // Basit lineer interpolasyon (Avrupa-Ortadoğu bölgesi için)
  // Batı Avrupa: ~0°, Doğu Türkiye: ~6°
  const baseDeclination = 3.5; // Orta değer
  const longitudeFactor = (longitude - 30) * 0.1; // Boylama göre ayarlama

  let declination = baseDeclination + longitudeFactor;

  // Sınırla
  declination = Math.max(-5, Math.min(15, declination));

  return declination;
}

export function useQibla(location: Location | null): UseQiblaResult {
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [magneticDeclination, setMagneticDeclination] = useState<number>(0);
  const [distanceToMecca, setDistanceToMecca] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Önceki değerleri sakla (low-pass filter için)
  const prevHeading = useRef<number>(0);
  const calibrationCount = useRef<number>(0);

  // Açı farkını hesapla (kısa yoldan, -180 ile +180 arası) - ref for stable function
  const angleDifferenceRef = useRef((a: number, b: number): number => {
    let diff = a - b;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  });

  // Gelişmiş low-pass filter uygula - ref for stable function
  const smoothHeadingRef = useRef((newHeading: number): number => {
    if (prevHeading.current === 0 && calibrationCount.current < 3) {
      prevHeading.current = newHeading;
      return newHeading;
    }

    const diff = angleDifferenceRef.current(newHeading, prevHeading.current);
    let smoothed = prevHeading.current + diff * SMOOTHING_FACTOR;

    if (smoothed < 0) smoothed += 360;
    if (smoothed >= 360) smoothed -= 360;

    prevHeading.current = smoothed;
    return smoothed;
  });

  // Magnetometer verilerini compass heading'e çevir - ref for stable function
  const calculateHeadingRef = useRef((x: number, y: number, _z: number): number => {
    let heading = Math.atan2(-x, y) * (180 / Math.PI);
    if (heading < 0) heading += 360;
    return heading;
  });

  // Kıble yönünü API'den al ve manyetik sapmayı hesapla
  useEffect(() => {
    if (!location) return;

    const fetchQiblaDirection = async () => {
      setIsLoading(true);
      try {
        // Önce API'den dene
        const response = await getQiblaDirection(location.latitude, location.longitude);
        setQiblaDirection(response.data.direction);
        setError(null);
      } catch (err) {
        // API başarısız olursa yerel hesaplama kullan
        console.log('API başarısız, yerel hesaplama kullanılıyor');
        const localQibla = calculateQiblaDirection(location.latitude, location.longitude);
        setQiblaDirection(localQibla);
        setError(null); // Yerel hesaplama başarılı
      }

      // Manyetik sapmayı hesapla
      const declination = getMagneticDeclination(location.latitude, location.longitude);
      setMagneticDeclination(declination);

      // Mekke'ye mesafeyi hesapla
      const distance = calculateDistanceToMecca(location);
      setDistanceToMecca(distance);

      setIsLoading(false);
    };

    fetchQiblaDirection();
  }, [location]);

  // Manyetik sapma değerini ref'e kaydet (closure'da kullanmak için)
  const magneticDeclinationRef = useRef(magneticDeclination);
  useEffect(() => {
    magneticDeclinationRef.current = magneticDeclination;
  }, [magneticDeclination]);

  // Magnetometer'ı başlat - sadece location değiştiğinde yeniden başlat
  useEffect(() => {
    let subscription: any;
    let isMounted = true;

    const startMagnetometer = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable) {
          if (isMounted) setError('Pusula sensörü bulunamadı');
          return;
        }

        // Güncelleme aralığını ayarla (50ms = 20fps)
        Magnetometer.setUpdateInterval(50);

        subscription = Magnetometer.addListener((data) => {
          if (!isMounted) return;

          // Ham manyetik başlık hesapla
          const rawMagneticHeading = calculateHeadingRef.current(data.x, data.y, data.z);

          // Low-pass filter uygula
          const smoothedMagneticHeading = smoothHeadingRef.current(rawMagneticHeading);

          // Manyetik sapmayı ekleyerek gerçek kuzeye göre başlık hesapla
          let trueHeading = smoothedMagneticHeading + magneticDeclinationRef.current;

          // 0-360 aralığına normalize et
          if (trueHeading < 0) trueHeading += 360;
          if (trueHeading >= 360) trueHeading -= 360;

          setCompassHeading(trueHeading);

          // Birkaç okuma sonrası kalibre edilmiş say
          calibrationCount.current += 1;
          if (calibrationCount.current > 20) {
            setIsCalibrated(true);
          }
        });
      } catch (err) {
        if (isMounted) setError('Pusula başlatılamadı');
      }
    };

    startMagnetometer();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [location]); // Sadece location değiştiğinde restart

  // Kıble açısını hesapla (pusula yönüne göre)
  const qiblaAngle = (qiblaDirection - compassHeading + 360) % 360;

  return {
    qiblaDirection,
    compassHeading,
    qiblaAngle,
    distanceToMecca,
    isLoading,
    error,
    isCalibrated,
  };
}

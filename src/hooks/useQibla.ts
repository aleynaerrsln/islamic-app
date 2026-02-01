import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { getQiblaDirection, calculateDistanceToMecca } from '../api/aladhan';
import type { Location } from '../types';

interface UseQiblaResult {
  qiblaDirection: number; // Kıble yönü (derece)
  compassHeading: number; // Pusula yönü (derece)
  qiblaAngle: number; // Gösterilecek açı (qiblaDirection - compassHeading)
  distanceToMecca: number; // Mekke'ye mesafe (km)
  isLoading: boolean;
  error: string | null;
  isCalibrated: boolean;
}

// Low-pass filter katsayısı (0-1 arası, düşük = daha yumuşak)
const SMOOTHING_FACTOR = 0.15;

export function useQibla(location: Location | null): UseQiblaResult {
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [distanceToMecca, setDistanceToMecca] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Önceki değerleri sakla (low-pass filter için)
  const prevHeading = useRef<number>(0);
  const calibrationCount = useRef<number>(0);

  // Açı farkını hesapla (kısa yoldan)
  const angleDifference = useCallback((a: number, b: number): number => {
    let diff = a - b;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }, []);

  // Low-pass filter uygula
  const smoothHeading = useCallback((newHeading: number): number => {
    const diff = angleDifference(newHeading, prevHeading.current);
    let smoothed = prevHeading.current + diff * SMOOTHING_FACTOR;

    // 0-360 aralığına normalize et
    if (smoothed < 0) smoothed += 360;
    if (smoothed >= 360) smoothed -= 360;

    prevHeading.current = smoothed;
    return smoothed;
  }, [angleDifference]);

  // Magnetometer verilerini compass heading'e çevir
  const calculateHeading = useCallback((x: number, y: number, z: number): number => {
    // Telefon düz tutulduğunda (ekran yukarı bakacak şekilde)
    // Manyetik Kuzey'e göre açıyı hesapla
    let heading: number;

    if (Platform.OS === 'ios') {
      // iOS için hesaplama
      heading = Math.atan2(x, y) * (180 / Math.PI);
    } else {
      // Android için hesaplama
      heading = Math.atan2(-x, y) * (180 / Math.PI);
    }

    // 0-360 aralığına normalize et
    if (heading < 0) {
      heading += 360;
    }

    return heading;
  }, []);

  // Kıble yönünü API'den al
  useEffect(() => {
    if (!location) return;

    const fetchQiblaDirection = async () => {
      setIsLoading(true);
      try {
        const response = await getQiblaDirection(location.latitude, location.longitude);
        setQiblaDirection(response.data.direction);

        // Mekke'ye mesafeyi hesapla
        const distance = calculateDistanceToMecca(location);
        setDistanceToMecca(distance);

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Kıble yönü alınamadı';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQiblaDirection();
  }, [location]);

  // Magnetometer'ı başlat
  useEffect(() => {
    let subscription: any;

    const startMagnetometer = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable) {
          setError('Pusula sensörü bulunamadı');
          return;
        }

        // Güncelleme aralığını ayarla (50ms = 20fps)
        Magnetometer.setUpdateInterval(50);

        subscription = Magnetometer.addListener((data) => {
          const rawHeading = calculateHeading(data.x, data.y, data.z);
          const smoothedHeading = smoothHeading(rawHeading);

          setCompassHeading(smoothedHeading);

          // Birkaç okuma sonrası kalibre edilmiş say
          calibrationCount.current += 1;
          if (calibrationCount.current > 10) {
            setIsCalibrated(true);
          }
        });
      } catch (err) {
        setError('Pusula başlatılamadı');
      }
    };

    startMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [calculateHeading, smoothHeading]);

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

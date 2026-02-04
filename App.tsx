import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { lightTheme, darkTheme } from './src/theme';
import { useSettingsStore } from './src/store/settingsStore';

const ONBOARDING_KEY = '@islamic_app_onboarding_complete';

export default function App() {
  const systemColorScheme = useColorScheme();
  const { theme: appTheme } = useSettingsStore();

  // Hızlı açılış için: varsayılan olarak false başla, ana uygulamayı hemen göster
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Tema seçimi
  const isDark =
    appTheme === 'dark' || (appTheme === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  // Onboarding durumunu kontrol et (arka planda)
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (completed !== 'true') {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('checkOnboarding error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Onboarding kayıt hatası:', error);
    }
  };

  // Hızlı açılış - loading spinner yok, direkt render
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {showOnboarding ? (
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <OnboardingScreen onComplete={completeOnboarding} />
          </SafeAreaView>
        ) : (
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

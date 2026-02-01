import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
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

  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Tema seçimi
  const isDark =
    appTheme === 'dark' || (appTheme === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  // Onboarding durumunu kontrol et
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Onboarding'i test etmek için sıfırla (sonra bu satırı kaldır)
      await AsyncStorage.removeItem(ONBOARDING_KEY);

      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(completed !== 'true');
    } catch (error) {
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
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

  // Yükleniyor
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

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

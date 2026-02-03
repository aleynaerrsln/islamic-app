import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Text } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { HomeScreen } from '../screens/HomeScreen';
import { QuranScreen } from '../screens/QuranScreen';
import { SurahDetailScreen } from '../screens/SurahDetailScreen';
import { QiblaScreen } from '../screens/QiblaScreen';
import { TasbihScreen } from '../screens/TasbihScreen';
import { RamadanScreen } from '../screens/RamadanScreen';
import { HadithScreen } from '../screens/HadithScreen';
import { PrayerGuideScreen } from '../screens/PrayerGuideScreen';
import { MosqueFinderScreen } from '../screens/MosqueFinderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MoreMenuModal } from '../components/MoreMenuModal';
import { spacing } from '../theme';

const Tab = createBottomTabNavigator();

// Placeholder screen for "More" tab
function MoreScreen() {
  return <View />;
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  const moreMenuItems = [
    {
      id: 'qibla',
      title: 'Kıble Pusulası',
      icon: 'compass',
      description: 'Kıble yönünü bul',
      onPress: () => navigation.navigate('Qibla'),
    },
    {
      id: 'hadith',
      title: 'Hadisler',
      icon: 'book-open-page-variant',
      description: 'Peygamber Efendimizin hadisleri',
      onPress: () => navigation.navigate('Hadith'),
    },
    {
      id: 'guide',
      title: 'Namaz Rehberi',
      icon: 'book-education',
      description: 'Namaz nasıl kılınır, dualar',
      onPress: () => navigation.navigate('Guide'),
    },
    {
      id: 'mosque',
      title: 'Cami Bul',
      icon: 'map-marker-radius',
      description: 'Yakınındaki camileri haritada bul',
      onPress: () => navigation.navigate('MosqueFinder'),
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      icon: 'cog-outline',
      description: 'Uygulama ayarları ve tercihler',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  // Only show first 4 tabs + More button
  const visibleTabs = state.routes.slice(0, 4);

  return (
    <>
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        {visibleTabs.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const iconName = options.tabBarIcon?.({ focused: isFocused, color: '', size: 24 })?.props?.name || 'circle';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconWrapper,
                isFocused && { backgroundColor: theme.colors.primaryContainer }
              ]}>
                <Icon
                  name={getIconName(route.name, isFocused)}
                  size={26}
                  color={isFocused ? theme.colors.primary : theme.colors.outline}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.primary : theme.colors.outline }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* More Button */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setMoreMenuVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Icon
              name="dots-horizontal"
              size={26}
              color={theme.colors.outline}
            />
          </View>
          <Text style={[styles.tabLabel, { color: theme.colors.outline }]}>
            Daha Fazla
          </Text>
        </TouchableOpacity>
      </View>

      <MoreMenuModal
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        menuItems={moreMenuItems}
      />
    </>
  );
}

// Get icon name based on route and focus state
function getIconName(routeName: string, isFocused: boolean): string {
  const icons: { [key: string]: { focused: string; unfocused: string } } = {
    Home: { focused: 'mosque', unfocused: 'mosque' },
    Quran: { focused: 'book-open-variant', unfocused: 'book-open-outline' },
    Ramadan: { focused: 'moon-waning-crescent', unfocused: 'moon-waning-crescent' },
    Tasbih: { focused: 'counter', unfocused: 'counter' },
  };

  return icons[routeName]?.[isFocused ? 'focused' : 'unfocused'] || 'circle';
}

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* Main visible tabs */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Namaz Vakitleri',
          headerShown: false,
          tabBarLabel: 'Ana Sayfa',
        }}
      />

      <Tab.Screen
        name="Quran"
        component={QuranScreen}
        options={{
          title: "Kur'an-ı Kerim",
          headerShown: false,
          tabBarLabel: "Kur'an",
        }}
      />

      <Tab.Screen
        name="Ramadan"
        component={RamadanScreen}
        options={{
          title: 'Ramazan',
          headerShown: false,
          tabBarLabel: 'Ramazan',
        }}
      />

      <Tab.Screen
        name="Tasbih"
        component={TasbihScreen}
        options={{
          title: 'Dijital Tesbih',
          headerShown: false,
          tabBarLabel: 'Tesbih',
        }}
      />

      {/* Hidden tabs - accessible via More menu */}
      <Tab.Screen
        name="Qibla"
        component={QiblaScreen}
        options={{
          title: 'Kıble Pusulası',
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      <Tab.Screen
        name="Hadith"
        component={HadithScreen}
        options={{
          title: 'Hadisler',
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      <Tab.Screen
        name="Guide"
        component={PrayerGuideScreen}
        options={{
          title: 'Namaz Rehberi',
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      <Tab.Screen
        name="MosqueFinder"
        component={MosqueFinderScreen}
        options={{
          title: 'Cami Bul',
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      {/* Detail screens - accessible via navigation */}
      <Tab.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={{
          title: 'Sure Detay',
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : spacing.sm,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconWrapper: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

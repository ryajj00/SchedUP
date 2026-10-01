import { Tabs } from 'expo-router';
import { StatusBar, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePreferences } from '../hooks/usePreferences';
import { PreferencesProvider } from '../providers/PreferencesProvider';
import { ScheduleProvider } from '../providers/ScheduleProvider';
import { darkTheme, lightTheme } from '../theme';

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <ScheduleProvider>
        <AppTabs />
      </ScheduleProvider>
    </PreferencesProvider>
  );
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { preferences } = usePreferences();
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
          tabBarItemStyle: { minWidth: 64 },
          tabBarBackground: () => null,
          tabBarStyle: {
            height: 64 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 8,
            backgroundColor: theme.surface,
            borderTopColor: theme.cardStroke,
            borderTopWidth: 1,
            shadowColor: '#131B2E',
            shadowOpacity: isDarkMode ? 0.18 : 0.08,
            shadowRadius: 12,
            elevation: 8,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} />
        <Tabs.Screen name="scan-review" options={{ title: 'Scan', tabBarLabel: 'Scan' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
        <Tabs.Screen name="onboarding" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="course-form" options={{ href: null, title: 'Course' }} />
        <Tabs.Screen name="profile-edit" options={{ href: null, title: 'Edit Profile' }} />
      </Tabs>
    </View>
  );
}

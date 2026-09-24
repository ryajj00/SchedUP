import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2A14B4',
        tabBarInactiveTintColor: '#777586',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarItemStyle: { minWidth: 64 },
        tabBarBackground: () => null,
        tabBarStyle: {
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#131B2E',
          shadowOpacity: 0.08,
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
    </Tabs>
  );
}

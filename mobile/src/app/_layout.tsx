import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerTintColor: '#1b2333',
        headerStyle: { backgroundColor: '#f3f6ff' },
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#2F6FED',
        tabBarInactiveTintColor: '#7585A6',
        tabBarLabelStyle: { fontWeight: '700' },
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} />
      <Tabs.Screen name="scan-review" options={{ title: 'Scan', tabBarLabel: 'Scan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
      <Tabs.Screen name="onboarding" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="course-form" options={{ href: null, title: 'Course' }} />
    </Tabs>
  );
}

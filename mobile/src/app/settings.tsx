import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePreferences } from '../hooks/usePreferences';
import { useSchedule } from '../hooks/useSchedule';
import { darkTheme, lightTheme } from '../theme';
import type { TransitBufferMinutes } from '../types/schedule';

type ThemeMode = 'system' | 'light' | 'dark';
const TRANSIT_BUFFER_OPTIONS: TransitBufferMinutes[] = [0, 10, 15, 30];

function SegmentButton({
  active,
  label,
  onPress,
  theme,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  theme: typeof lightTheme;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segment, { backgroundColor: active ? theme.surface : 'transparent' }]}
    >
      <Text style={[styles.segmentText, { color: active ? theme.primary : theme.textSoft }]}>{label}</Text>
    </Pressable>
  );
}

function Toggle({
  value,
  onPress,
  theme,
}: {
  value: boolean;
  onPress: () => void;
  theme: typeof lightTheme;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[styles.toggle, { backgroundColor: value ? theme.primary : theme.cardStroke }]}
    >
      <View style={[styles.toggleThumb, { backgroundColor: theme.surface, alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = usePreferences();
  const { courses, clearAll } = useSchedule();
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const confirmReset = () => {
    Alert.alert('Clear your schedule?', 'This permanently removes all saved classes from this device.', [
      { text: 'Keep schedule', style: 'cancel' },
      {
        text: 'Clear schedule',
        style: 'destructive',
        onPress: () => {
          void clearAll().catch(() => Alert.alert('Could not clear schedule', 'Please try again.'));
        },
      },
    ]);
  };

  const saveSetting = async (updates: Parameters<typeof updatePreferences>[0]) => {
    try {
      await updatePreferences(updates);
    } catch {
      Alert.alert('Could not save setting', 'Please try again.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>MAKE IT YOURS</Text>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSoft }]}>Set up SchedUP to fit your week.</Text>
        </View>
      </View>

      <SettingsSection title="Appearance" theme={theme}>
        <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <SegmentButton
              key={mode}
              active={preferences.themeMode === mode}
              label={mode[0].toUpperCase() + mode.slice(1)}
              onPress={() => void saveSetting({ themeMode: mode })}
              theme={theme}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Time format</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          <SegmentButton active={preferences.timeFormat === '12h'} label="12-hour (09:30 AM)" onPress={() => void saveSetting({ timeFormat: '12h' })} theme={theme} />
          <SegmentButton active={preferences.timeFormat === '24h'} label="24-hour (09:30)" onPress={() => void saveSetting({ timeFormat: '24h' })} theme={theme} />
        </View>
      </SettingsSection>

      <SettingsSection title="Schedule" theme={theme}>
        <SettingRow title="Back-to-back classes" description="Treat classes with no gap between them as okay." theme={theme}>
          <Toggle value={preferences.allowBackToBack} onPress={() => void saveSetting({ allowBackToBack: !preferences.allowBackToBack })} theme={theme} />
        </SettingRow>
        <Text style={[styles.label, { color: theme.text }]}>Travel time between classes</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          {TRANSIT_BUFFER_OPTIONS.map((minutes) => (
            <SegmentButton
              key={minutes}
              active={preferences.transitBufferMinutes === minutes}
              label={minutes === 0 ? 'None' : `${minutes} mins`}
              onPress={() => void saveSetting({
                transitBufferMinutes: minutes,
                studentProfile: { ...preferences.studentProfile, commuteBufferMinutes: minutes },
              })}
              theme={theme}
            />
          ))}
        </View>
        <SettingRow title="Skip duplicate classes when importing" description="Avoid adding the same class more than once." theme={theme}>
          <Toggle value={preferences.autoMergeDuplicates} onPress={() => void saveSetting({ autoMergeDuplicates: !preferences.autoMergeDuplicates })} theme={theme} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Schedule photo scanning" theme={theme}>
        <View style={[styles.provider, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>You stay in control</Text>
          <Text style={[styles.description, { color: theme.textSoft }]}>Review every class we find before it is added to your schedule.</Text>
        </View>
      </SettingsSection>

      <SettingsSection title="Your data" theme={theme}>
        <View style={[styles.storage, { backgroundColor: theme.surfaceAlt }]}>
          <View>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Saved on this device</Text>
            <Text style={[styles.description, { color: theme.textSoft }]}>{courses.length} {courses.length === 1 ? 'class' : 'classes'} in your schedule</Text>
          </View>
        </View>
        <Pressable onPress={confirmReset} style={[styles.dangerButton, { backgroundColor: theme.dangerSoft }]}>
          <Text style={[styles.dangerText, { color: theme.danger }]}>Clear all classes</Text>
        </Pressable>
      </SettingsSection>

      <Text style={[styles.footer, { color: theme.textMuted }]}>Your schedule stays on this device.</Text>
    </ScrollView>
  );
}

function SettingsSection({
  title,
  badge,
  theme,
  children,
}: {
  title: string;
  badge?: string;
  theme: typeof lightTheme;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        {badge ? <Text style={[styles.badge, { color: theme.primary, backgroundColor: theme.primarySoft }]}>{badge}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SettingRow({
  title,
  description,
  theme,
  children,
}: {
  title: string;
  description: string;
  theme: typeof lightTheme;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowCopy}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSoft }]}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  subtitle: { fontSize: 12, lineHeight: 17 },
  section: { borderRadius: 16, padding: 14, gap: 12, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  segmented: { flexDirection: 'row', padding: 4, borderRadius: 10, gap: 4 },
  segment: { flex: 1, minHeight: 34, paddingHorizontal: 6, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCopy: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 11, lineHeight: 16 },
  toggle: { width: 46, height: 28, borderRadius: 20, padding: 4, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
  provider: { borderRadius: 10, padding: 12, gap: 6 },
  storage: { borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  dangerButton: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  dangerText: { fontSize: 13, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 10, paddingVertical: 8 },
});

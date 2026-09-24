import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePreferences } from '../hooks/usePreferences';
import { useSchedule } from '../hooks/useSchedule';
import { darkTheme, lightTheme } from '../theme';

type ThemeMode = 'system' | 'light' | 'dark';

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
  const [resetting, setResetting] = useState(false);
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const confirmReset = () => {
    if (resetting) {
      setResetting(false);
      void clearAll();
      return;
    }

    setResetting(true);
    setTimeout(() => setResetting(false), 3500);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>● Local Engine Active · Offline Ready</Text>
          <Text style={[styles.title, { color: theme.text }]}>System Controls</Text>
          <Text style={[styles.subtitle, { color: theme.textSoft }]}>Deterministic scheduler runtime & OCR configuration</Text>
        </View>
        <Text style={[styles.build, { color: theme.textMuted }]}>Build 42</Text>
      </View>

      <SettingsSection title="Appearance & Display" theme={theme}>
        <Text style={[styles.label, { color: theme.text }]}>Theme Mode</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <SegmentButton
              key={mode}
              active={preferences.themeMode === mode}
              label={mode[0].toUpperCase() + mode.slice(1)}
              onPress={() => void updatePreferences({ themeMode: mode })}
              theme={theme}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Time Format</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          <SegmentButton active={preferences.timeFormat === '12h'} label="12-hour (09:30 AM)" onPress={() => void updatePreferences({ timeFormat: '12h' })} theme={theme} />
          <SegmentButton active={preferences.timeFormat === '24h'} label="24-hour (09:30)" onPress={() => void updatePreferences({ timeFormat: '24h' })} theme={theme} />
        </View>
        <View style={styles.twoColumn}>
          <InfoTile label="First day of week" value="Monday" theme={theme} />
          <InfoTile label="Default grid view" value="Timeline" theme={theme} />
        </View>
      </SettingsSection>

      <SettingsSection title="Timetable & Conflict Engine" badge="Deterministic" theme={theme}>
        <SettingRow title="Allow 0m gap transitions" description="Adjacent classes sharing a boundary are not conflicts." theme={theme}>
          <Toggle value={preferences.allowBackToBack} onPress={() => void updatePreferences({ allowBackToBack: !preferences.allowBackToBack })} theme={theme} />
        </SettingRow>
        <Text style={[styles.label, { color: theme.text }]}>Transit / Walking Buffer</Text>
        <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
          {[0, 10, 15].map((minutes) => (
            <SegmentButton
              key={minutes}
              active={preferences.transitBufferMinutes === minutes}
              label={minutes === 0 ? 'None' : `${minutes} mins`}
              onPress={() => void updatePreferences({ transitBufferMinutes: minutes as 0 | 10 | 15 })}
              theme={theme}
            />
          ))}
        </View>
        <View style={[styles.algorithm, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Collision algorithm</Text>
          <Text style={[styles.code, { color: theme.primary }]}>startA &lt; endB &amp;&amp; endA &gt; startB</Text>
          <Text style={[styles.description, { color: theme.textSoft }]}>Strict non-inclusive inequality prevents edge-touch false positives.</Text>
        </View>
        <SettingRow title="Auto-merge duplicates on import" description="Flags duplicate course codes across scans." theme={theme}>
          <Toggle value={preferences.autoMergeDuplicates} onPress={() => void updatePreferences({ autoMergeDuplicates: !preferences.autoMergeDuplicates })} theme={theme} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="AI Syllabus Scanner" badge="Privacy Shield" theme={theme}>
        <View style={[styles.provider, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.eyebrow, { color: theme.textMuted }]}>VISION ENGINE PROVIDER</Text>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Mock / Local Offline Engine</Text>
          <Text style={[styles.description, { color: theme.textSoft }]}>Deterministic mock payloads. API credentials remain server-side.</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[styles.label, { color: theme.text }]}>OCR confidence threshold</Text>
          <Text style={[styles.value, { color: theme.primary }]}>High (≥80%)</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.cardStroke }]}>
          <View style={[styles.progress, { backgroundColor: theme.primary, width: '80%' }]} />
        </View>
      </SettingsSection>

      <SettingsSection title="Storage & Portability" badge="AsyncStorage" theme={theme}>
        <View style={[styles.storage, { backgroundColor: theme.surfaceAlt }]}>
          <View>
            <Text style={[styles.settingTitle, { color: theme.text }]}>@schedUp/schedule</Text>
            <Text style={[styles.description, { color: theme.textSoft }]}>{courses.length} enrolled classes · Local cache healthy</Text>
          </View>
          <Text style={[styles.value, { color: theme.primary }]}>Healthy</Text>
        </View>
        <Text style={[styles.description, { color: theme.textSoft }]}>Export and calendar sync are planned for a future release.</Text>
        <Pressable onPress={confirmReset} style={[styles.dangerButton, { backgroundColor: resetting ? theme.danger : theme.dangerSoft }]}>
          <Text style={[styles.dangerText, { color: resetting ? '#FFFFFF' : theme.danger }]}>
            {resetting ? 'Tap again to confirm reset' : 'Reset all schedule data'}
          </Text>
        </Pressable>
      </SettingsSection>

      <Text style={[styles.footer, { color: theme.textMuted }]}>SchedUP Schedule Utility MVP · Version 1.2.0</Text>
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

function InfoTile({ label, value, theme }: { label: string; value: string; theme: typeof lightTheme }) {
  return (
    <View style={[styles.infoTile, { backgroundColor: theme.surfaceAlt }]}>
      <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.settingTitle, { color: theme.text }]}>{value}</Text>
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
  build: { fontSize: 10, marginTop: 4 },
  section: { borderRadius: 16, padding: 14, gap: 12, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  segmented: { flexDirection: 'row', padding: 4, borderRadius: 10, gap: 4 },
  segment: { flex: 1, minHeight: 34, paddingHorizontal: 6, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  twoColumn: { flexDirection: 'row', gap: 8 },
  infoTile: { flex: 1, borderRadius: 10, padding: 10, gap: 5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCopy: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 11, lineHeight: 16 },
  toggle: { width: 46, height: 28, borderRadius: 20, padding: 4, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
  algorithm: { borderRadius: 10, padding: 10, gap: 6 },
  code: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  provider: { borderRadius: 10, padding: 12, gap: 6 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 8 },
  storage: { borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  dangerButton: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  dangerText: { fontSize: 13, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 10, paddingVertical: 8 },
});

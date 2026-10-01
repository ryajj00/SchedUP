import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePreferences } from '../hooks/usePreferences';
import { darkTheme, lightTheme } from '../theme';
import { StudentProfile } from '../storage/scheduleStorage';

type NotificationChannel = 'push' | 'email';
type ProfileForm = StudentProfile & { colorCodingBySubject: boolean; compactView: boolean };

export default function ProfileEditScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [formState, setFormState] = useState<ProfileForm | null>(null);
  const form = formState ?? {
    ...preferences.studentProfile,
    colorCodingBySubject: preferences.colorCodingBySubject,
    compactView: preferences.compactView,
  };
  const [saveError, setSaveError] = useState('');

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setFormState((previous) => ({ ...(previous ?? form), [key]: value }));
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setFormState((previous) => {
      const current = previous ?? form;
      const next = current.notificationChannels.includes(channel)
        ? current.notificationChannels.filter((item) => item !== channel)
        : [...current.notificationChannels, channel];
      return { ...current, notificationChannels: next };
    });
  };

  const handleSave = async () => {
    const profile: StudentProfile = {
      ...form,
      notificationChannels: form.notificationChannels,
    };

    try {
      await updatePreferences({
        studentProfile: profile,
        transitBufferMinutes: profile.commuteBufferMinutes,
        colorCodingBySubject: form.colorCodingBySubject,
        compactView: form.compactView,
      });
      router.back();
    } catch {
      setSaveError('We could not save your changes. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading your profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>Profile</Text>
          <Text style={[styles.title, { color: theme.text }]}>Edit student details</Text>
        </View>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.backButtonText, { color: theme.text }]}>Back</Text>
        </Pressable>
      </View>

      <Section title="Academic context" theme={theme}>
        <Field label="Full name" value={form.fullName} placeholder="e.g. Alex Reyes" theme={theme} onChangeText={(value) => updateField('fullName', value)} />
        <Field label="School" value={form.school} placeholder="Your school" theme={theme} onChangeText={(value) => updateField('school', value)} />
        <Field label="Program" value={form.program} placeholder="e.g. BS Computer Science" theme={theme} onChangeText={(value) => updateField('program', value)} />
        <Field label="Year level" value={form.yearLevel} placeholder="e.g. 2nd Year" theme={theme} onChangeText={(value) => updateField('yearLevel', value)} />
        <Field label="Semester dates" value={form.semesterDates} placeholder="e.g. Aug 2026 - Dec 2026" theme={theme} onChangeText={(value) => updateField('semesterDates', value)} />

        <Text style={[styles.label, { color: theme.textSoft }]}>Class load type</Text>
        <SegmentedRow
          options={['regular', 'irregular']}
          value={form.classLoadType}
          onChange={(value) => updateField('classLoadType', value as 'regular' | 'irregular')}
          theme={theme}
        />

        <Text style={[styles.label, { color: theme.textSoft }]}>Timezone</Text>
        <Field value={form.timezone} theme={theme} onChangeText={(value) => updateField('timezone', value)} />

        <Text style={[styles.label, { color: theme.textSoft }]}>Week start day</Text>
        <SegmentedRow
          options={['Sunday', 'Monday']}
          value={form.weekStartDay}
          onChange={(value) => updateField('weekStartDay', value as 'Sunday' | 'Monday')}
          theme={theme}
        />
      </Section>

      <Section title="Scheduling preferences" theme={theme}>
        <TimeField label="Active hours" valueStart={form.activeHoursStart} valueEnd={form.activeHoursEnd} onChangeStart={(value) => updateField('activeHoursStart', value)} onChangeEnd={(value) => updateField('activeHoursEnd', value)} theme={theme} />
        <TimeField label="Do not schedule" valueStart={form.doNotScheduleStart} valueEnd={form.doNotScheduleEnd} onChangeStart={(value) => updateField('doNotScheduleStart', value)} onChangeEnd={(value) => updateField('doNotScheduleEnd', value)} theme={theme} />
        <TimeField label="Sleep window" valueStart={form.sleepWindowStart} valueEnd={form.sleepWindowEnd} onChangeStart={(value) => updateField('sleepWindowStart', value)} onChangeEnd={(value) => updateField('sleepWindowEnd', value)} theme={theme} />

        <Text style={[styles.label, { color: theme.textSoft }]}>Peak focus time</Text>
        <SegmentedRow
          options={['Morning', 'Afternoon', 'Evening', 'Night']}
          value={form.peakFocusTime}
          onChange={(value) => updateField('peakFocusTime', value as typeof form.peakFocusTime)}
          theme={theme}
        />

        <Text style={[styles.label, { color: theme.textSoft }]}>Commute buffer</Text>
        <SegmentedRow
          options={['0', '10', '15', '30']}
          value={String(form.commuteBufferMinutes)}
          onChange={(value) => updateField('commuteBufferMinutes', Number(value) as StudentProfile['commuteBufferMinutes'])}
          theme={theme}
        />
        <Field label="Study session (minutes)" value={String(form.studySessionMinutes)} keyboardType="numeric" theme={theme} onChangeText={(value) => updateField('studySessionMinutes', Number(value) || 0)} />
        <Field label="Break duration (minutes)" value={String(form.breakMinutes)} keyboardType="numeric" theme={theme} onChangeText={(value) => updateField('breakMinutes', Number(value) || 0)} />
      </Section>

      <Section title="Notifications" theme={theme}>
        <Text style={[styles.description, { color: theme.textSoft }]}>Reminder settings are saved here; notifications are not available in this version.</Text>
        <Field label="Reminder lead time (minutes)" value={String(form.reminderLeadTimeMinutes)} keyboardType="numeric" theme={theme} onChangeText={(value) => updateField('reminderLeadTimeMinutes', Number(value) || 0)} />
        <Text style={[styles.label, { color: theme.textSoft }]}>Channels</Text>
        <View style={styles.channelRow}>
          {(['push', 'email'] as const).map((channel) => {
            const active = form.notificationChannels.includes(channel);
            return (
              <Pressable
                key={channel}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                accessibilityLabel={`${channel} notifications`}
                style={[styles.channelChip, { backgroundColor: active ? theme.primary : theme.surfaceAlt, borderColor: active ? theme.primary : theme.cardStroke }]}
                onPress={() => toggleChannel(channel)}
              >
                <Text style={[styles.channelText, { color: active ? '#FFFFFF' : theme.text }]}>{channel}</Text>
              </Pressable>
            );
          })}
        </View>

        <TimeField label="Quiet hours" valueStart={form.quietHoursStart} valueEnd={form.quietHoursEnd} onChangeStart={(value) => updateField('quietHoursStart', value)} onChangeEnd={(value) => updateField('quietHoursEnd', value)} theme={theme} />
      </Section>

      <Section title="Appearance & accessibility" theme={theme}>
        <ToggleRow
          label="Color coding by subject"
          value={form.colorCodingBySubject}
          onToggle={() => updateField('colorCodingBySubject', !form.colorCodingBySubject)}
          theme={theme}
        />
        <ToggleRow
          label="Compact view"
          value={form.compactView}
          onToggle={() => updateField('compactView', !form.compactView)}
          theme={theme}
        />
      </Section>

      {saveError ? <Text style={[styles.error, { color: theme.danger }]}>{saveError}</Text> : null}
      <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={() => void handleSave()}>
        <Text style={styles.primaryButtonText}>Save profile</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, theme, children }: { title: string; theme: typeof lightTheme; children: React.ReactNode }) {
  return (
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}> 
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  theme,
  onChangeText,
  keyboardType = 'default',
}: {
  label?: string;
  value: string;
  placeholder?: string;
  theme: typeof lightTheme;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.fieldBlock}>
      {label ? <Text style={[styles.label, { color: theme.textSoft }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.cardStroke, color: theme.text }]}
      />
    </View>
  );
}

function TimeField({
  label,
  valueStart,
  valueEnd,
  onChangeStart,
  onChangeEnd,
  theme,
}: {
  label: string;
  valueStart: string;
  valueEnd: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  theme: typeof lightTheme;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.label, { color: theme.textSoft }]}>{label}</Text>
      <View style={styles.timeRow}>
        <TextInput
          value={valueStart}
          onChangeText={onChangeStart}
          keyboardType="numbers-and-punctuation"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, styles.timeInput, { backgroundColor: theme.surfaceAlt, borderColor: theme.cardStroke, color: theme.text }]}
        />
        <Text style={[styles.timeSeparator, { color: theme.textMuted }]}>to</Text>
        <TextInput
          value={valueEnd}
          onChangeText={onChangeEnd}
          keyboardType="numbers-and-punctuation"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, styles.timeInput, { backgroundColor: theme.surfaceAlt, borderColor: theme.cardStroke, color: theme.text }]}
        />
      </View>
    </View>
  );
}

function SegmentedRow<T extends string>({
  options,
  value,
  onChange,
  theme,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  theme: typeof lightTheme;
}) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option)}
            style={[styles.segment, { backgroundColor: active ? theme.primary : theme.surfaceAlt, borderColor: active ? theme.primary : theme.cardStroke }]}
          >
            <Text style={[styles.segmentText, { color: active ? '#FFFFFF' : theme.text }]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  theme,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  theme: typeof lightTheme;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={styles.toggleRow}
    >
      <Text style={[styles.settingTitle, { color: theme.text }]}>{label}</Text>
      <View style={[styles.toggle, { backgroundColor: value ? theme.primary : theme.cardStroke }]}>
        <View style={[styles.toggleThumb, { backgroundColor: '#FFFFFF', alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, fontWeight: '700' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800' },
  backButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  backButtonText: { fontWeight: '700' },
  section: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  fieldBlock: { marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeInput: { flex: 1 },
  timeSeparator: { fontSize: 13, fontWeight: '700' },
  segmentedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  segment: { minHeight: 40, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  segmentText: { fontSize: 12, fontWeight: '700' },
  channelRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  channelChip: { flex: 1, borderRadius: 999, borderWidth: 1, paddingVertical: 8, alignItems: 'center' },
  channelText: { fontWeight: '700', textTransform: 'capitalize' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  settingTitle: { fontSize: 14, fontWeight: '700' },
  description: { fontSize: 12, lineHeight: 17 },
  toggle: { width: 50, height: 28, borderRadius: 999, paddingHorizontal: 4, justifyContent: 'center' },
  toggleThumb: { width: 18, height: 18, borderRadius: 999 },
  error: { fontSize: 13, fontWeight: '700' },
  primaryButton: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
});

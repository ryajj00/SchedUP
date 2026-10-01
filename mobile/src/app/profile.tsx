import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePreferences } from '../hooks/usePreferences';
import { darkTheme, lightTheme } from '../theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { preferences } = usePreferences();
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;
  const profile = preferences.studentProfile;
  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'S';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>Student profile</Text>
          <Text style={[styles.title, { color: theme.text }]}>Your planner</Text>
        </View>
        <Pressable onPress={() => router.push('/profile-edit')} style={[styles.editButton, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit profile</Text>
        </Pressable>
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{profile.fullName || 'Add your name'}</Text>
        <Text style={[styles.program, { color: theme.textSoft }]}>
          {profile.program || 'Add your program'}{profile.yearLevel ? ` · ${profile.yearLevel}` : ''}
        </Text>
        <Text style={[styles.school, { color: theme.textSoft }]}>{profile.school || 'Add your school'}</Text>
      </View>

      <Section title="Academic context" theme={theme}>
        <InfoRow label="School" value={profile.school || 'Not set'} theme={theme} />
        <InfoRow label="Program" value={profile.program || 'Not set'} theme={theme} />
        <InfoRow label="Year level" value={profile.yearLevel || 'Not set'} theme={theme} />
        <InfoRow label="Semester dates" value={profile.semesterDates || 'Not set'} theme={theme} />
        <InfoRow label="Class load" value={profile.classLoadType} theme={theme} />
        <InfoRow label="Timezone" value={profile.timezone} theme={theme} />
        <InfoRow label="Week starts" value={profile.weekStartDay} theme={theme} />
      </Section>

      <Section title="Scheduling preferences" theme={theme}>
        <InfoRow label="Active hours" value={`${profile.activeHoursStart} - ${profile.activeHoursEnd}`} theme={theme} />
        <InfoRow label="Do not schedule" value={`${profile.doNotScheduleStart} - ${profile.doNotScheduleEnd}`} theme={theme} />
        <InfoRow label="Sleep window" value={`${profile.sleepWindowStart} - ${profile.sleepWindowEnd}`} theme={theme} />
        <InfoRow label="Peak focus" value={profile.peakFocusTime} theme={theme} />
        <InfoRow label="Commute buffer" value={`${profile.commuteBufferMinutes} mins`} theme={theme} />
        <InfoRow label="Study session" value={`${profile.studySessionMinutes} mins`} theme={theme} />
        <InfoRow label="Break" value={`${profile.breakMinutes} mins`} theme={theme} />
      </Section>

      <Section title="Notifications" theme={theme}>
        <InfoRow label="Reminder lead time" value={`${profile.reminderLeadTimeMinutes} mins`} theme={theme} />
        <InfoRow label="Channels" value={profile.notificationChannels.join(', ') || 'push'} theme={theme} />
        <InfoRow label="Quiet hours" value={`${profile.quietHoursStart} - ${profile.quietHoursEnd}`} theme={theme} />
      </Section>

      <Section title="Appearance & accessibility" theme={theme}>
        <InfoRow label="Color coding" value={preferences.colorCodingBySubject ? 'On' : 'Off'} theme={theme} />
        <InfoRow label="Compact view" value={preferences.compactView ? 'On' : 'Off'} theme={theme} />
        <Text style={[styles.appearanceHint, { color: theme.textSoft }]}>Change your app theme in Settings.</Text>
      </Section>

      <Section title="Account & data" theme={theme}>
        <Text style={[styles.infoValue, { color: theme.textSoft }]}>
          Your profile and schedule are stored on this device. Account sign-in, calendar sync, and export are not available yet.
        </Text>
      </Section>

      <Pressable
        style={[styles.action, { backgroundColor: theme.primarySoft }]}
        onPress={() => router.push('/onboarding')}
      >
        <Text style={[styles.actionText, { color: theme.primary }]}>Reset onboarding</Text>
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

function InfoRow({ label, value, theme }: { label: string; value: string; theme: typeof lightTheme }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.cardStroke }]}>
      <Text style={[styles.infoLabel, { color: theme.textSoft }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800' },
  editButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  editButtonText: { fontWeight: '800' },
  profileCard: { borderRadius: 20, borderWidth: 1, padding: 22, alignItems: 'center', shadowColor: '#131B2E', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 30, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  program: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  school: { fontSize: 14 },
  section: { borderRadius: 18, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '700' },
  infoValue: { fontSize: 13, fontWeight: '700', textAlign: 'right', maxWidth: '60%' },
  appearanceHint: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  action: { borderRadius: 14, padding: 14, alignItems: 'center' },
  actionText: { fontWeight: '800' },
});

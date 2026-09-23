import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { ThemeToggle } from '../components/ThemeToggle';
import { darkTheme, lightTheme } from '../theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode || scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ScrollView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>S</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>Student profile</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>Make SchedUP feel like yours.</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
        <View style={styles.preferenceRow}>
          <View>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>Appearance</Text>
            <Text style={[styles.preferenceSubtitle, { color: theme.textSoft }]}>Follow your device theme</Text>
          </View>
          <ThemeToggle isDark={isDarkMode || scheme === 'dark'} onToggle={() => setIsDarkMode((previous) => !previous)} />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About SchedUP</Text>
        <Text style={[styles.body, { color: theme.textSoft }]}>
          Build your class schedule, scan timetables, and catch conflicts before they disrupt your week.
        </Text>
        <Pressable style={[styles.action, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.actionText, { color: theme.primary }]}>Reset onboarding</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 30, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900' },
  subtitle: { marginTop: 6, fontSize: 14 },
  section: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 14 },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preferenceTitle: { fontSize: 15, fontWeight: '800' },
  preferenceSubtitle: { fontSize: 13, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 21 },
  action: { borderRadius: 14, padding: 13, alignItems: 'center', marginTop: 16 },
  actionText: { fontWeight: '800' },
});

import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { scanSchedule } from '../services/scanService';
import { darkTheme, lightTheme } from '../theme';
import { ScannedCourse } from '../types/schedule';

const demoCourses: ScannedCourse[] = [
  {
    courseName: 'Programming 1',
    days: ['Mon', 'Wed'],
    startTime: '09:00',
    endTime: '10:30',
    uncertain: false,
  },
  {
    courseName: 'Mathematics',
    days: ['Tue'],
    startTime: '10:00',
    endTime: '11:00',
    uncertain: true,
    uncertaintyReason: 'The end time is partially obscured.',
  },
];

export default function ScanReviewScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const [items, setItems] = useState<ScannedCourse[]>(demoCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');

    try {
      const parsedCourses = await scanSchedule('demo-image');
      setItems(parsedCourses.length > 0 ? parsedCourses : demoCourses);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'We could not analyze this schedule.');
      setItems(demoCourses);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Review Scanned Schedule</Text>
      <Text style={[styles.subtitle, { color: theme.textSoft }]}>Check the extracted classes before they hit your planner.</Text>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

      {items.map((course) => (
        <View
          key={`${course.courseName}-${course.startTime}`}
          style={[
            styles.courseCard,
            { backgroundColor: theme.surface, borderColor: course.uncertain ? '#F4C9A5' : theme.cardStroke },
            course.uncertain && { backgroundColor: theme.warningSoft },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.courseName, { color: theme.text }]}>{course.courseName}</Text>
            {course.uncertain ? <Text style={[styles.warning, { color: theme.warning }]}>⚠</Text> : <Text style={[styles.confirmed, { color: theme.success }]}>✓</Text>}
          </View>

          <Text style={[styles.meta, { color: theme.textSoft }]}>{course.days.join(' • ')}</Text>
          <Text style={[styles.meta, { color: theme.textSoft }]}>{course.startTime} – {course.endTime}</Text>

          {course.uncertain ? (
            <Text style={[styles.reviewText, { color: theme.warning }]}>Needs review</Text>
          ) : (
            <Text style={[styles.reviewText, { color: theme.primary }]}>Ready to confirm</Text>
          )}

          {course.uncertaintyReason ? (
            <Text style={[styles.reason, { color: theme.warning }]}>{course.uncertaintyReason}</Text>
          ) : null}
        </View>
      ))}

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleAnalyze} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Confirm All</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 18 },
  courseCard: { borderRadius: 18, padding: 14, borderWidth: 1, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseName: { fontSize: 18, fontWeight: '800' },
  meta: { marginTop: 4, fontSize: 14 },
  reviewText: { marginTop: 8, fontWeight: '800' },
  warning: { fontSize: 20 },
  confirmed: { fontSize: 20 },
  reason: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  error: { marginBottom: 12, fontWeight: '700' },
  primaryButton: { marginTop: 12, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
});

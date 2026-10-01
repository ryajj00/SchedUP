import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CourseCard } from '../components/CourseCard';
import { ConflictWarning } from '../components/ConflictWarning';
import { QuickFilterBar, ScheduleFilter } from '../components/QuickFilterBar';
import { useSchedule } from '../hooks/useSchedule';
import { usePreferences } from '../hooks/usePreferences';
import { darkTheme, lightTheme } from '../theme';
import { Day } from '../types/schedule';

const MONDAY_FIRST: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SUNDAY_FIRST: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen() {
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('All');
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const { preferences } = usePreferences();
  const semesterLabel = preferences.studentProfile.semesterDates || 'Current semester';
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && systemScheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { courses, conflicts, isLoading } = useSchedule();

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const dayOrder = preferences.studentProfile.weekStartDay === 'Sunday' ? SUNDAY_FIRST : MONDAY_FIRST;

  const visibleCourses = useMemo(() => {
    if (activeFilter === 'Conflicts') {
      return courses.filter((course) =>
        conflicts.some((conflict) => conflict.courseAId === course.id || conflict.courseBId === course.id),
      );
    }

    if (activeFilter === 'Today') {
      const today = new Date().getDay();
      const mappedDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today];
      return courses.filter((course) => course.days.includes(mappedDay as Day));
    }

    if (activeFilter === 'Week') {
      return courses.filter((course) => course.days.length > 0);
    }

    return courses;
  }, [activeFilter, conflicts, courses]);

  const daySections = dayOrder.map((day) => ({
    day,
    items: [...visibleCourses]
      .filter((course) => course.days.includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  const warningMessages = conflicts.map((conflict) => {
    const courseA = courseMap.get(conflict.courseAId);
    const courseB = courseMap.get(conflict.courseBId);

    return {
      ...conflict,
      courseAName: courseA?.courseName ?? 'Course',
      courseBName: courseB?.courseName ?? 'Course',
      startTime: courseA?.startTime ?? '09:00',
      endTime: courseA?.endTime ?? '10:30',
    };
  });

  if (isLoading) {
    return (
      <View style={StyleSheet.flatten([styles.centeredContainer, { backgroundColor: theme.background }])}>
        <Text style={[styles.loading, { color: theme.text }]}>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={[styles.appHeader, { borderBottomColor: theme.cardStroke }]}>
        <View>
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: theme.primary }]}>
              <Text style={styles.brandMarkText}>S</Text>
            </View>
            <Text style={[styles.brand, { color: theme.primary }]}>SchedUP</Text>
            <Text style={[styles.semester, { backgroundColor: theme.surfaceAlt, color: theme.textSoft }]}>{semesterLabel}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={[styles.eyebrow, { color: theme.textSoft }]}>Schedule Dashboard</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {conflicts.length > 0 ? <Text style={[styles.conflictBadge, { backgroundColor: theme.dangerSoft, color: theme.danger }]}>{conflicts.length} Conflicts</Text> : null}
        </View>
      </View>

      <View style={styles.quickRow}>
        <Text style={[styles.semesterPill, { backgroundColor: theme.surfaceAlt, color: theme.primary }]}>↻  {semesterLabel}</Text>
        <View style={styles.quickActions}>
          <Link href="/scan-review" asChild>
            <Pressable style={StyleSheet.flatten([styles.scanButton, { backgroundColor: theme.surfaceAlt }])}>
              <Text style={[styles.scanButtonText, { color: theme.secondary }]}>⌁ Scan</Text>
            </Pressable>
          </Link>
          <Link href="/course-form" asChild>
            <Pressable style={StyleSheet.flatten([styles.addButton, { backgroundColor: theme.primary }])}>
              <Text style={styles.primaryButtonText}>＋ Add Course</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <QuickFilterBar value={activeFilter} onChange={setActiveFilter} theme={theme} />

      {warningMessages.length > 0 ? (
        <View style={styles.warningBlock}>
          <View style={[styles.conflictBanner, { backgroundColor: theme.dangerSoft }]}>
            <Text style={[styles.warningTitle, { color: theme.danger }]}>⚠ {conflicts.length} Schedule Alert{conflicts.length === 1 ? '' : 's'}</Text>
            <Text style={[styles.warningBody, { color: theme.textSoft }]}>Check for overlapping classes or a short break between classes.</Text>
          </View>
          {warningMessages.map((warning) => (
            <ConflictWarning
              key={`${warning.courseAId}-${warning.courseBId}-${warning.day}`}
              courseName={warning.courseAName}
              otherCourseName={warning.courseBName}
              conflict={warning}
              startTime={warning.startTime}
              endTime={warning.endTime}
              theme={theme}
            />
          ))}
        </View>
      ) : null}

      {courses.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}> 
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your schedule is empty</Text>
          <Text style={[styles.emptyText, { color: theme.textSoft }]}>Add your first class manually or scan a schedule photo.</Text>
          <Link href="/course-form" asChild>
            <Pressable style={StyleSheet.flatten([styles.primaryButton, { backgroundColor: theme.primary }])}>
              <Text style={styles.primaryButtonText}>Add Course</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        daySections.map(({ day, items }) => (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: theme.text }]}>{day}</Text>
              <Text style={[styles.classCount, { backgroundColor: theme.surfaceAlt, color: theme.textSoft }]}>{items.length} {items.length === 1 ? 'Class' : 'Classes'}</Text>
            </View>

            {items.length === 0 ? <Text style={[styles.emptyDay, { color: theme.textMuted }]}>No classes</Text> : null}

            {items.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                conflicts={conflicts}
                theme={theme}
                colorCoding={preferences.colorCodingBySubject}
                compact={preferences.compactView}
                onPress={() => router.push({ pathname: '/course-form', params: { courseId: course.id } })}
              />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  brand: { fontSize: 18, fontWeight: '800' },
  semester: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 999 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, marginLeft: 36 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  headerActions: { alignItems: 'flex-end', gap: 8 },
  conflictBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '800' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  semesterPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: '800' },
  quickActions: { flexDirection: 'row', gap: 8 },
  scanButton: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  scanButtonText: { fontSize: 12, fontWeight: '800' },
  addButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  primaryButton: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.25, shadowRadius: 10, elevation: 3 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontWeight: '800' },
  warningBlock: { marginBottom: 16 },
  conflictBanner: { borderRadius: 14, padding: 14, marginBottom: 10 },
  warningTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  warningBody: { fontSize: 13, lineHeight: 18 },
  emptyState: { borderRadius: 22, padding: 24, alignItems: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyText: { fontSize: 15, marginBottom: 20, textAlign: 'center' },
  daySection: { marginBottom: 18 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayTitle: { fontSize: 20, fontWeight: '800' },
  classCount: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  emptyDay: { fontSize: 13, marginBottom: 8 },
  loading: { fontSize: 18, fontWeight: '700' },
});

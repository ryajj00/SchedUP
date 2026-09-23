import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { CourseCard } from '../components/CourseCard';
import { ConflictWarning } from '../components/ConflictWarning';
import { QuickFilterBar, ScheduleFilter } from '../components/QuickFilterBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useSchedule } from '../hooks/useSchedule';
import { darkTheme, lightTheme } from '../theme';
import { Day } from '../types/schedule';

const DAY_ORDER: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('All');
  const systemScheme = useColorScheme();
  const theme = isDarkMode || systemScheme === 'dark' ? darkTheme : lightTheme;

  const { courses, conflicts, isLoading } = useSchedule();

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

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

  const daySections = DAY_ORDER.map((day) => ({
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
    <ScrollView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.textSoft }]}>Your semester vibe</Text>
          <Text style={[styles.title, { color: theme.text }]}>SchedUP</Text>
        </View>
        <ThemeToggle isDark={isDarkMode || systemScheme === 'dark'} onToggle={() => setIsDarkMode((prev) => !prev)} />
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}> 
          <Text style={[styles.summaryValue, { color: theme.text }]}>{courses.length}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSoft }]}>Classes</Text>
        </View>
        <View style={[styles.summaryCardWarning, { backgroundColor: theme.dangerSoft, borderColor: theme.warning }]}> 
          <Text style={[styles.summaryValue, { color: theme.text }]}>{conflicts.length}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSoft }]}>Conflicts</Text>
        </View>
      </View>

      <QuickFilterBar value={activeFilter} onChange={setActiveFilter} theme={theme} />

      <View style={styles.actionRow}>
        <Link href="/course-form" asChild>
          <Pressable style={StyleSheet.flatten([styles.primaryButton, { backgroundColor: theme.primary }])}>
            <Text style={styles.primaryButtonText}>Add Course</Text>
          </Pressable>
        </Link>

        <Link href="/scan-review" asChild>
          <Pressable style={StyleSheet.flatten([styles.secondaryButton, { backgroundColor: theme.primarySoft }])}>
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Scan Schedule</Text>
          </Pressable>
        </Link>
      </View>

      {warningMessages.length > 0 ? (
        <View style={styles.warningBlock}>
          <Text style={[styles.warningTitle, { color: theme.text }]}>Conflict overview</Text>
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
            <Text style={[styles.dayTitle, { color: theme.textSoft }]}>{day}</Text>

            {items.length === 0 ? <Text style={[styles.emptyDay, { color: theme.textMuted }]}>No classes</Text> : null}

            {items.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                conflicts={conflicts}
                theme={theme}
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
  content: { padding: 20, paddingBottom: 40 },
  centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 34, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  summaryCardWarning: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  summaryValue: { fontSize: 24, fontWeight: '900' },
  summaryLabel: { fontWeight: '700', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  primaryButton: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.25, shadowRadius: 10, elevation: 3 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontWeight: '800' },
  warningBlock: { marginBottom: 20 },
  warningTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyState: { borderRadius: 22, padding: 24, alignItems: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyText: { fontSize: 15, marginBottom: 20, textAlign: 'center' },
  daySection: { marginBottom: 18 },
  dayTitle: { fontSize: 16, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  emptyDay: { fontSize: 13, marginBottom: 8 },
  loading: { fontSize: 18, fontWeight: '700' },
});

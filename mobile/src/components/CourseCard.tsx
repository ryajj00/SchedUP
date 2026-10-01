import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Course, CourseConflict } from '../types/schedule';
import { AppTheme, lightTheme } from '../theme';
import { formatTimeRange } from '../utils/timeUtils';

interface CourseCardProps {
  course: Course;
  conflicts: CourseConflict[];
  theme?: AppTheme;
  onPress?: () => void;
  colorCoding?: boolean;
  compact?: boolean;
}

const SUBJECT_COLORS = ['#5145CD', '#087E8B', '#B74774', '#8A6914', '#547A3C'];

export function CourseCard({ course, conflicts, theme = lightTheme, onPress, colorCoding = false, compact = false }: CourseCardProps) {
  const isConflicting = conflicts.some(
    (conflict) => conflict.courseAId === course.id || conflict.courseBId === course.id,
  );
  const subjectColor = SUBJECT_COLORS[
    [...course.courseName].reduce((hash, character) => hash + character.charCodeAt(0), 0) % SUBJECT_COLORS.length
  ];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        compact && styles.compactCard,
        { backgroundColor: theme.surface, borderColor: 'transparent' },
        isConflicting && { backgroundColor: theme.dangerSoft, borderColor: 'transparent' },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${course.courseName}, ${course.days.join(', ')}, ${formatTimeRange(course.startTime, course.endTime)}${isConflicting ? ', schedule alert with another class' : ''}`}
    >
      <View style={styles.headerRow}>
        <View style={[styles.badgeContainer, { backgroundColor: isConflicting ? theme.danger : colorCoding ? subjectColor : theme.primarySoft }]}>
          <Text style={[styles.badge, { color: isConflicting || colorCoding ? '#FFFFFF' : theme.primary }]}>{course.courseName.slice(0, 5).toUpperCase()}</Text>
        </View>
        {isConflicting ? <Text style={styles.warning}>⚠</Text> : null}
      </View>

      <Text style={[styles.title, compact && styles.compactTitle, { color: theme.text }]}>{course.courseName}</Text>
      <Text style={[styles.meta, compact && styles.compactMeta, { color: theme.textSoft }]}>{course.days.join(' • ')}</Text>
      <Text style={[styles.meta, compact && styles.compactMeta, { color: theme.textSoft }]}>{formatTimeRange(course.startTime, course.endTime)}</Text>

      {isConflicting ? (
        <Text style={[styles.warningText, { color: theme.danger }]}>Schedule alert</Text>
      ) : (
        <Text style={[styles.safeText, { color: theme.success }]}>On track</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#131B2E',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactCard: { padding: 12, marginBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    marginBottom: 4,
  },
  compactTitle: { fontSize: 15, marginBottom: 2 },
  meta: {
    fontSize: 14,
    marginTop: 2,
  },
  compactMeta: { fontSize: 13 },
  warning: {
    fontSize: 18,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  safeText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
});

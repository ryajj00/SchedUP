import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CourseConflict } from '../types/schedule';
import { AppTheme, lightTheme } from '../theme';
import { formatDisplayTime } from '../utils/timeUtils';

interface ConflictWarningProps {
  courseName: string;
  conflict: CourseConflict;
  otherCourseName: string;
  theme?: AppTheme;
  startTime?: string;
  endTime?: string;
}

export function ConflictWarning({
  courseName,
  conflict,
  otherCourseName,
  theme = lightTheme,
  startTime = '09:00',
  endTime = '10:30',
}: ConflictWarningProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
      <Text style={[styles.title, { color: theme.danger }]}>⚠ Conflict</Text>
      <Text style={[styles.message, { color: theme.text }]}>{courseName} overlaps with {otherCourseName}</Text>
      <Text style={[styles.meta, { color: theme.textSoft }]}>{conflict.day}</Text>
      <Text style={[styles.meta, { color: theme.textSoft }]}>{formatDisplayTime(startTime)} – {formatDisplayTime(endTime)}</Text>
      <Text style={[styles.meta, { color: theme.textSoft }]}>Choose a better time or review the clash.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9B1C1C',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#5C1E1E',
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: '#7A3B3B',
  },
});

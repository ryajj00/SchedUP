import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';

import { DaySelector } from '../components/DaySelector';
import { useSchedule } from '../hooks/useSchedule';
import { darkTheme, lightTheme } from '../theme';
import { Day } from '../types/schedule';
import { isValidTime } from '../utils/timeUtils';

const emptyForm = {
  courseName: '',
  days: [] as Day[],
  startTime: '09:00',
  endTime: '10:00',
};

export default function CourseFormScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const { courses, addCourse, updateCourse, deleteCourse } = useSchedule();

  const existingCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courseId, courses],
  );

  const [form, setForm] = useState(existingCourse ? {
    courseName: existingCourse.courseName,
    days: existingCourse.days,
    startTime: existingCourse.startTime,
    endTime: existingCourse.endTime,
  } : emptyForm);
  const [error, setError] = useState('');

  const toggleDay = (day: Day) => {
    setForm((previous) => ({
      ...previous,
      days: previous.days.includes(day)
        ? previous.days.filter((selectedDay) => selectedDay !== day)
        : [...previous.days, day],
    }));
  };

  const handleSave = async () => {
    const trimmedName = form.courseName.trim();

    if (!trimmedName) {
      setError('Course name is required.');
      return;
    }

    if (!form.days.length) {
      setError('Choose at least one day.');
      return;
    }

    if (!isValidTime(form.startTime) || !isValidTime(form.endTime)) {
      setError('Please use valid times in HH:mm format.');
      return;
    }

    const startMinutes = Number(form.startTime.split(':')[0]) * 60 + Number(form.startTime.split(':')[1]);
    const endMinutes = Number(form.endTime.split(':')[0]) * 60 + Number(form.endTime.split(':')[1]);

    if (endMinutes <= startMinutes) {
      setError('End time must be later than start time.');
      return;
    }

    try {
      if (existingCourse) {
        await updateCourse({
          ...existingCourse,
          courseName: trimmedName,
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
        });
      } else {
        await addCourse({
          courseName: trimmedName,
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
          source: 'manual',
        });
      }

      router.back();
    } catch {
      setError('Unable to save this course right now.');
    }
  };

  const handleDelete = async () => {
    if (!existingCourse) {
      return;
    }

    await deleteCourse(existingCourse.id);
    router.back();
  };

  return (
    <ScrollView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>{existingCourse ? 'Edit Course' : 'Add Course'}</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}> 
        <Text style={[styles.label, { color: theme.textSoft }]}>Course name</Text>
        <TextInput
          value={form.courseName}
          onChangeText={(value) => setForm((previous) => ({ ...previous, courseName: value }))}
          placeholder="Programming 1"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: theme.textSoft }]}>Days</Text>
        <DaySelector selectedDays={form.days} onToggle={toggleDay} theme={theme} />

        <Text style={[styles.label, { color: theme.textSoft }]}>Start time</Text>
        <TextInput
          value={form.startTime}
          onChangeText={(value) => setForm((previous) => ({ ...previous, startTime: value }))}
          placeholder="09:00"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={[styles.label, { color: theme.textSoft }]}>End time</Text>
        <TextInput
          value={form.endTime}
          onChangeText={(value) => setForm((previous) => ({ ...previous, endTime: value }))}
          placeholder="10:30"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
          keyboardType="numbers-and-punctuation"
        />

        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>

          <Pressable style={[styles.secondaryButton, { backgroundColor: theme.primarySoft }]} onPress={() => router.back()}>
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Cancel</Text>
          </Pressable>
        </View>

        {existingCourse ? (
          <Pressable style={[styles.deleteButton, { backgroundColor: theme.dangerSoft }]} onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: theme.danger }]}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 20 },
  card: { borderRadius: 24, padding: 18, borderWidth: 1 },
  label: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 18, fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { fontWeight: '800' },
  deleteButton: { marginTop: 20, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  deleteButtonText: { fontWeight: '800' },
  error: { fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 14 },
});

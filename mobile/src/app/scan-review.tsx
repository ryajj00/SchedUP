import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSchedule } from '../hooks/useSchedule';
import { usePreferences } from '../hooks/usePreferences';
import { DaySelector } from '../components/DaySelector';
import { scanSchedule } from '../services/scanService';
import { darkTheme, lightTheme } from '../theme';
import { ScannedCourse } from '../types/schedule';

export default function ScanReviewScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { preferences } = usePreferences();
  const isDarkMode = preferences.themeMode === 'dark' || (preferences.themeMode === 'system' && scheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [items, setItems] = useState<ScannedCourse[]>([]);
  const [image, setImage] = useState<{ uri: string; dataUrl: string; mimeType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { courses, isLoading: isScheduleLoading, addCourses } = useSchedule();

  const updateItem = (index: number, updates: Partial<ScannedCourse>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
  };

  const toggleItemDay = (index: number, day: ScannedCourse['days'][number]) => {
    const item = items[index];
    if (!item) return;
    updateItem(index, {
      days: item.days.includes(day) ? item.days.filter((selected) => selected !== day) : [...item.days, day],
    });
  };

  const setPickedImage = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      setError('This image could not be prepared for scanning. Please try another image.');
      return;
    }

    const mimeType = asset.mimeType ?? 'image/jpeg';
    setImage({
      uri: asset.uri,
      mimeType,
      dataUrl: `data:${mimeType};base64,${asset.base64}`,
    });
    setItems([]);
    setError('');
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to scan a timetable image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    setPickedImage(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow camera access to photograph a timetable.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    setPickedImage(result);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Choose a timetable image or take a photo first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsedCourses = await scanSchedule(image.dataUrl, image.mimeType);
      setItems(parsedCourses);
      if (parsedCourses.length === 0) {
        setError('No courses were found. Try a clearer timetable image.');
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'We could not analyze this schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!items.length) {
      setError('Analyze an image before confirming courses.');
      return;
    }

    const hasInvalidCourse = items.some((course) => {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!course.courseName.trim() || course.days.length === 0 || !timePattern.test(course.startTime) || !timePattern.test(course.endTime)) {
        return true;
      }

      return course.endTime <= course.startTime;
    });
    if (hasInvalidCourse) {
      setError('Check each class name, day, and time before adding it.');
      return;
    }

    setIsSaving(true);
    try {
      const getDuplicateKey = (course: Pick<ScannedCourse, 'courseName' | 'days' | 'startTime' | 'endTime'>) =>
        `${course.courseName.trim().toLowerCase()}|${[...course.days].sort().join(',')}|${course.startTime}|${course.endTime}`;
      const existingKeys = new Set(courses.map(getDuplicateKey));
      const coursesToAdd = preferences.autoMergeDuplicates
        ? items.filter((course) => {
            const key = getDuplicateKey(course);
            if (existingKeys.has(key)) return false;
            existingKeys.add(key);
            return true;
          })
        : items;

      if (!coursesToAdd.length) {
        setError('These classes are already in your schedule.');
        return;
      }

      await addCourses(coursesToAdd.map((course) => ({
          courseName: course.courseName,
          days: course.days,
          startTime: course.startTime,
          endTime: course.endTime,
          source: 'scan',
        })));
      const duplicatesSkipped = items.length - coursesToAdd.length;
      if (duplicatesSkipped > 0) {
        Alert.alert('Schedule updated', `${coursesToAdd.length} ${coursesToAdd.length === 1 ? 'class was' : 'classes were'} added. ${duplicatesSkipped} duplicate ${duplicatesSkipped === 1 ? 'was' : 'were'} skipped.`, [
          { text: 'Done', onPress: () => router.replace('/') },
        ]);
      } else {
        router.replace('/');
      }
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Unable to save scanned courses.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Add from a timetable</Text>
          <Text style={[styles.subtitle, { color: theme.textSoft }]}>Choose a photo, then check each class before saving.</Text>
        </View>
        <Text style={[styles.stepPill, { backgroundColor: theme.surfaceAlt, color: theme.textSoft }]}>{items.length ? 'Review' : image ? 'Ready' : 'Step 1'}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.secondaryButton, { backgroundColor: theme.primarySoft }]} onPress={pickImage}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Choose image</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, { backgroundColor: theme.primarySoft }]} onPress={takePhoto}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Take photo</Text>
        </Pressable>
      </View>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} accessibilityLabel="Selected timetable" />
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.cardStroke }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Start with a clear photo</Text>
          <Text style={[styles.meta, { color: theme.textSoft }]}>Make sure class names, days, and times are easy to read.</Text>
        </View>
      )}
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

      {items.map((course, index) => (
        <View
          key={`scanned-course-${index}`}
          style={[
            styles.courseCard,
            { backgroundColor: theme.surface, borderColor: course.uncertain ? '#F4C9A5' : theme.cardStroke },
            course.uncertain && { backgroundColor: theme.warningSoft },
          ]}
        >
          <View style={styles.headerRow}>
            <TextInput
              value={course.courseName}
              onChangeText={(courseName) => updateItem(index, { courseName })}
              placeholder="Course name"
              placeholderTextColor={theme.textMuted}
              accessibilityLabel="Course name"
              style={[styles.editInput, styles.courseName, { color: theme.text, borderColor: theme.cardStroke }]}
            />
            {course.uncertain ? <Text style={[styles.warning, { color: theme.warning }]}>⚠</Text> : <Text style={[styles.confirmed, { color: theme.success }]}>✓</Text>}
          </View>

          <Text style={[styles.meta, { color: theme.textSoft }]}>Class days</Text>
          <DaySelector selectedDays={course.days} onToggle={(day) => toggleItemDay(index, day)} theme={theme} />
          <View style={styles.timeRow}>
            <TextInput
              value={course.startTime}
              onChangeText={(startTime) => updateItem(index, { startTime })}
              accessibilityLabel="Class start time"
              style={[styles.editInput, styles.timeInput, { color: theme.text, borderColor: theme.cardStroke }]}
            />
            <Text style={[styles.meta, { color: theme.textSoft }]}>to</Text>
            <TextInput
              value={course.endTime}
              onChangeText={(endTime) => updateItem(index, { endTime })}
              accessibilityLabel="Class end time"
              style={[styles.editInput, styles.timeInput, { color: theme.text, borderColor: theme.cardStroke }]}
            />
          </View>

          {course.uncertain ? (
            <Text style={[styles.reviewText, { color: theme.warning }]}>Needs review</Text>
          ) : (
            <Text style={[styles.reviewText, { color: theme.primary }]}>Ready to confirm</Text>
          )}

          {course.uncertaintyReason ? (
            <Text style={[styles.reason, { color: theme.warning }]}>{course.uncertaintyReason}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${course.courseName}`}
            onPress={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            style={styles.removeButton}
          >
            <Text style={[styles.removeText, { color: theme.danger }]}>Remove class</Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: !image || isLoading ? 0.55 : 1 }]} onPress={handleAnalyze} disabled={!image || isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Analyze timetable</Text>}
      </Pressable>
      {items.length > 0 ? (
        <Pressable
          style={[styles.confirmButton, { backgroundColor: theme.success, opacity: isScheduleLoading ? 0.55 : 1 }]}
          onPress={() => void handleConfirm()}
          disabled={isScheduleLoading || isSaving}
        >
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving classes…' : `Add ${items.length} ${items.length === 1 ? 'class' : 'classes'} to schedule`}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 25, fontWeight: '800', marginBottom: 5 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 18 },
  stepPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, fontSize: 10, fontWeight: '700' },
  courseCard: { borderRadius: 14, padding: 16, borderWidth: 0, marginBottom: 12, shadowColor: '#131B2E', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
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
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  secondaryButton: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { fontWeight: '800' },
  preview: { width: '100%', height: 180, borderRadius: 16, marginBottom: 12, resizeMode: 'cover' },
  confirmButton: { marginTop: 10, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  emptyState: { borderRadius: 18, borderWidth: 1, padding: 20, marginBottom: 12, gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  editInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 15 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  timeInput: { flex: 1 },
  removeButton: { alignSelf: 'flex-start', paddingVertical: 10, marginTop: 4 },
  removeText: { fontSize: 13, fontWeight: '700' },
});

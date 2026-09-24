import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSchedule } from '../hooks/useSchedule';
import { usePreferences } from '../hooks/usePreferences';
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
  const [error, setError] = useState('');
  const { addCourses } = useSchedule();

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

    try {
      await addCourses(items.map((course) => ({
          courseName: course.courseName,
          days: course.days,
          startTime: course.startTime,
          endTime: course.endTime,
          source: 'scan',
        })));
      router.replace('/');
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Unable to save scanned courses.');
    }
  };

  return (
    <ScrollView
      style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Review Scanned Schedule</Text>
          <Text style={[styles.subtitle, { color: theme.textSoft }]}>✦ AI extraction assistant</Text>
        </View>
        <Text style={[styles.stepPill, { backgroundColor: theme.surfaceAlt, color: theme.textSoft }]}>Step 2 of 2</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.secondaryButton, { backgroundColor: theme.primarySoft }]} onPress={pickImage}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Choose image</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, { backgroundColor: theme.primarySoft }]} onPress={takePhoto}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Take photo</Text>
        </Pressable>
      </View>

      {image ? <Image source={{ uri: image.uri }} style={styles.preview} accessibilityLabel="Selected timetable" /> : null}
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
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Analyze timetable</Text>}
      </Pressable>
      {items.length > 0 ? (
        <Pressable style={[styles.confirmButton, { backgroundColor: theme.success }]} onPress={() => void handleConfirm()}>
          <Text style={styles.primaryButtonText}>Add courses to schedule</Text>
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
});

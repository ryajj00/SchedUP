import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}>
      <Text style={styles.eyebrow}>Welcome</Text>
      <Text style={styles.title}>Build your perfect class week.</Text>
      <Text style={styles.copy}>Add courses, scan your schedule, and catch clashes before they happen.</Text>

      <View style={styles.featureList}>
        <Text style={styles.feature}>• Manual course entry</Text>
        <Text style={styles.feature}>• AI scan review</Text>
        <Text style={styles.feature}>• Conflict alerts</Text>
      </View>

      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    padding: 28,
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1B2333',
    marginTop: 14,
  },
  copy: {
    color: '#5B6477',
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24,
  },
  featureList: {
    marginTop: 22,
  },
  feature: {
    color: '#1B2333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  button: {
    marginTop: 26,
    backgroundColor: '#2F6FED',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

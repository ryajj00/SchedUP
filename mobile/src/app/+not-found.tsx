import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Go home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B2333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2F6FED',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

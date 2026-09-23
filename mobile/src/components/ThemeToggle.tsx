import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={[styles.pill, isDark && styles.pillDark]}
    >
      <Text style={[styles.text, isDark && styles.textDark]}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#EAF0FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillDark: {
    backgroundColor: '#1D2F56',
  },
  text: {
    color: '#1D3B73',
    fontWeight: '800',
    fontSize: 12,
  },
  textDark: {
    color: '#EAF2FF',
  },
});

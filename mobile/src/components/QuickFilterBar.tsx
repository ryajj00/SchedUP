import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AppTheme, lightTheme } from '../theme';

export type ScheduleFilter = 'All' | 'Today' | 'Week' | 'Conflicts';

interface QuickFilterBarProps {
  value: ScheduleFilter;
  onChange: (filter: ScheduleFilter) => void;
  theme?: AppTheme;
}

const FILTERS: ScheduleFilter[] = ['All', 'Today', 'Week', 'Conflicts'];

export function QuickFilterBar({ value, onChange, theme = lightTheme }: QuickFilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map((filter) => {
        const selected = value === filter;

        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            onPress={() => onChange(filter)}
            style={[styles.pill, { backgroundColor: selected ? theme.primary : theme.primarySoft }]}
          >
            <Text style={[styles.text, { color: selected ? '#FFFFFF' : theme.primary }]}>{filter}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingBottom: 4 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  text: {
    fontWeight: '800',
    fontSize: 12,
  },
});

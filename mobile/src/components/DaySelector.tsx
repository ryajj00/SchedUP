import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Day } from '../types/schedule';
import { AppTheme, lightTheme } from '../theme';

const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySelectorProps {
  selectedDays: Day[];
  onToggle: (day: Day) => void;
  theme?: AppTheme;
}

export function DaySelector({ selectedDays, onToggle, theme = lightTheme }: DaySelectorProps) {
  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day);

        return (
          <Pressable
            key={day}
            onPress={() => onToggle(day)}
            style={[
              styles.chip,
              { backgroundColor: isSelected ? theme.primary : theme.primarySoft, borderColor: isSelected ? theme.primary : theme.border },
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>{day}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

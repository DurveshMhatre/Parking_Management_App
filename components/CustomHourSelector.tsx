import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';

interface CustomHourSelectorProps {
  hours: number;
  onChangeHours: (hours: number) => void;
  maxHours?: number;
}

export default function CustomHourSelector({ hours, onChangeHours, maxHours = 23 }: CustomHourSelectorProps) {
  const { colors } = useTheme();

  const handleDecrease = () => {
    if (hours > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeHours(hours - 1);
    }
  };

  const handleIncrease = () => {
    if (hours < maxHours) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeHours(hours + 1);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bgCard, borderColor: colors.accent + '60' }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Select Hours</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleDecrease}
          disabled={hours <= 1}
          style={[styles.btn, { backgroundColor: colors.bgSurface, opacity: hours <= 1 ? 0.4 : 1 }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: colors.accent }]}>−</Text>
        </TouchableOpacity>
        <View style={styles.displayBox}>
          <Text style={[styles.hoursText, { color: colors.textPrimary }]}>{hours}</Text>
          <Text style={[styles.hoursLabel, { color: colors.textMuted }]}>
            {hours === 1 ? 'hour' : 'hours'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleIncrease}
          disabled={hours >= maxHours}
          style={[styles.btn, { backgroundColor: colors.bgSurface, opacity: hours >= maxHours ? 0.4 : 1 }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: colors.accent }]}>+</Text>
        </TouchableOpacity>
      </View>
      {hours >= 23 && (
        <Text style={[styles.hint, { color: colors.warning }]}>
          💡 Consider the 24hr slot for better value
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 24,
    fontWeight: FontWeight.regular,
    lineHeight: 28,
  },
  displayBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  hoursText: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
  },
  hoursLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    marginTop: 2,
  },
  hint: {
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
    fontWeight: FontWeight.regular,
  },
});

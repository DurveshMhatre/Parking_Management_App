import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';

interface SlotAvailabilityCardProps {
  icon: string;
  name: string;
  available: number;
  total: number;
  color: string;
}

export default function SlotAvailabilityCard({
  icon,
  name,
  available,
  total,
  color,
}: SlotAvailabilityCardProps) {
  const { colors, isDark } = useTheme();
  const fillPercentage = ((total - available) / total) * 100;
  const isFull = available <= 0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, {
        backgroundColor: colors.bgSurface,
        borderColor: colors.border,
        ...(isDark ? Shadows.sm : {
          shadowColor: '#000000',
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }),
      }]}>
        {/* Icon and name */}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.name, { color: colors.textSecondary }]}>{name}</Text>

        {/* Slot count */}
        <View style={styles.countRow}>
          <Text style={[styles.countNumber, { color: isFull ? colors.error : color }]}>
            {available}
          </Text>
          <Text style={[styles.countTotal, { color: colors.textMuted }]}>/{total}</Text>
        </View>
        <Text style={[styles.label, { color: colors.textMuted }]}>{isFull ? 'FULL' : 'Available'}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${fillPercentage}%`,
                  backgroundColor: isFull ? colors.error : color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },
  countTotal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 2,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '100%',
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

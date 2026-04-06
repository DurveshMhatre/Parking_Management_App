import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';

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
  const fillPercentage = ((total - available) / total) * 100;
  const isFull = available <= 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon and name */}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.name}>{name}</Text>

        {/* Slot count */}
        <View style={styles.countRow}>
          <Text style={[styles.countNumber, { color: isFull ? Colors.error : color }]}>
            {available}
          </Text>
          <Text style={styles.countTotal}>/{total}</Text>
        </View>
        <Text style={styles.label}>{isFull ? 'FULL' : 'Available'}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${fillPercentage}%`,
                  backgroundColor: isFull ? Colors.error : color,
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
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
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
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
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

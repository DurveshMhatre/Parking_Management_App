import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import type { VehicleType } from '../store/parkingStore';

interface VehicleTypeSelectorProps {
  vehicleTypes: VehicleType[];
  selectedId: number | null;
  onSelect: (type: VehicleType) => void;
  availability?: { [id: number]: { available: number; total: number } };
}

const vehicleColors: { [key: string]: string } = {
  Car: Colors.car,
  Bike: Colors.bike,
  Rickshaw: Colors.rickshaw,
};

export default function VehicleTypeSelector({
  vehicleTypes,
  selectedId,
  onSelect,
  availability,
}: VehicleTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Vehicle Type</Text>
      <View style={styles.grid}>
        {vehicleTypes.map((vt) => {
          const isSelected = selectedId === vt.id;
          const color = vehicleColors[vt.name] || Colors.primary;
          const avail = availability?.[vt.id];
          const isFull = avail && avail.available <= 0;

          return (
            <TouchableOpacity
              key={vt.id}
              style={[
                styles.card,
                isSelected && { borderColor: color, borderWidth: 2 },
                isFull && styles.cardDisabled,
              ]}
              onPress={() => !isFull && onSelect(vt)}
              activeOpacity={isFull ? 1 : 0.7}
            >
              <Text style={styles.icon}>{vt.icon}</Text>
              <Text style={[styles.name, isSelected && { color }]}>{vt.name}</Text>
              <Text style={styles.rate}>₹{vt.hourly_rate}/hr</Text>
              {avail && (
                <View style={[styles.availBadge, { backgroundColor: isFull ? Colors.errorLight : Colors.successLight }]}>
                  <Text style={[styles.availText, { color: isFull ? Colors.error : Colors.success }]}>
                    {isFull ? 'FULL' : `${avail.available}/${avail.total}`}
                  </Text>
                </View>
              )}
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: color }]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    ...Shadows.sm,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  availBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  availText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: FontWeight.bold,
  },
});

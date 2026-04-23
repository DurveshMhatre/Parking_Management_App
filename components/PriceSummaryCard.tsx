import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import { formatPrice, type PricingSlot } from '../constants/pricing';

interface PriceSummaryCardProps {
  slot: PricingSlot;
  vehicleIcon: string;
  vehicleLabel: string;
}

export default function PriceSummaryCard({ slot, vehicleIcon, vehicleLabel }: PriceSummaryCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Top row: icon + duration summary */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
            {vehicleIcon} {vehicleLabel} Parking
          </Text>
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: colors.textPrimary }}>
            {slot.label} {slot.isPackage ? 'Package' : 'Parking'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: colors.textPrimary }}>
            {formatPrice(slot.price)}
          </Text>
        </View>
      </View>

      {/* Saving / Badge row */}
      {(slot.savingLabel || slot.badge || slot.isPackage) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm }}>
          {slot.savingLabel && (
            <View
              style={{
                backgroundColor: colors.successLight,
                paddingHorizontal: Spacing.sm,
                paddingVertical: 3,
                borderRadius: BorderRadius.full,
              }}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: colors.success }}>
                {slot.savingLabel}
              </Text>
            </View>
          )}
          {slot.badge && (
            <View
              style={{
                backgroundColor: colors.warningLightBg,
                paddingHorizontal: Spacing.sm,
                paddingVertical: 3,
                borderRadius: BorderRadius.full,
              }}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: colors.warning }}>
                ⭐ {slot.badge}
              </Text>
            </View>
          )}
          {slot.isPackage && (
            <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>
              Valid for {slot.displayDuration}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

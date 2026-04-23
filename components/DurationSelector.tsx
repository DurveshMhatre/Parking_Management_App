import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import CustomHourSelector from './CustomHourSelector';
import type { PricingSlot } from '../constants/pricing';

interface DurationSelectorProps {
  slots: PricingSlot[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isCustom: boolean;
  onCustomToggle: (active: boolean) => void;
  customHours: number;
  onCustomHoursChange: (hours: number) => void;
}

export default function DurationSelector({
  slots,
  selectedIndex,
  onSelect,
  isCustom,
  onCustomToggle,
  customHours,
  onCustomHoursChange,
}: DurationSelectorProps) {
  const { colors } = useTheme();
  const hourlySlots = slots.filter((s) => !s.isPackage);
  const packageSlots = slots.filter((s) => s.isPackage);

  const handleSelect = (slot: PricingSlot) => {
    const idx = slots.findIndex((s) => s.durationKey === slot.durationKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCustomToggle(false);
    onSelect(idx);
  };

  const handleCustomPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCustomToggle(true);
  };

  const renderChip = (slot: PricingSlot) => {
    const idx = slots.findIndex((s) => s.durationKey === slot.durationKey);
    const isSelected = !isCustom && idx === selectedIndex;

    return (
      <TouchableOpacity
        key={slot.durationKey}
        activeOpacity={0.7}
        onPress={() => handleSelect(slot)}
        style={{
          backgroundColor: isSelected ? colors.accent : colors.bgSurface,
          borderWidth: isSelected ? 0 : 1,
          borderColor: colors.border,
          borderRadius: BorderRadius.xl,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm + 2,
          marginRight: Spacing.sm,
          minWidth: 64,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: FontSize.md,
            fontWeight: FontWeight.semibold,
            color: isSelected ? '#FFFFFF' : colors.textMuted,
          }}
        >
          {slot.isPackage ? `✨ ${slot.label}` : slot.displayDuration}
        </Text>
        {slot.savingLabel && (
          <Text
            style={{
              fontSize: FontSize.xs,
              fontWeight: FontWeight.medium,
              color: isSelected ? 'rgba(255,255,255,0.8)' : colors.success,
              marginTop: 2,
            }}
          >
            {slot.savingLabel}
          </Text>
        )}
        {slot.badge && (
          <Text
            style={{
              fontSize: FontSize.xs,
              fontWeight: FontWeight.bold,
              color: isSelected ? '#FFFFFF' : colors.warning,
              marginTop: 2,
            }}
          >
            {slot.badge}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {/* Hourly section */}
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: Spacing.sm,
        }}
      >
        Hourly
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: Spacing.md }}
        contentContainerStyle={{ paddingRight: Spacing.md }}
      >
        {hourlySlots.map(renderChip)}

        {/* Custom chip */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCustomPress}
          style={{
            backgroundColor: isCustom ? colors.accent : colors.bgSurface,
            borderWidth: isCustom ? 0 : 1,
            borderColor: colors.border,
            borderRadius: BorderRadius.xl,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm + 2,
            marginRight: Spacing.sm,
            minWidth: 64,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: FontSize.md,
              fontWeight: FontWeight.semibold,
              color: isCustom ? '#FFFFFF' : colors.textMuted,
            }}
          >
            ✏️ Custom
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom hour stepper (shown when custom is active) */}
      {isCustom && (
        <CustomHourSelector
          hours={customHours}
          onChangeHours={onCustomHoursChange}
          maxHours={23}
        />
      )}

      {/* Packages section */}
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: Spacing.sm,
          marginTop: isCustom ? Spacing.md : 0,
        }}
      >
        Packages 📦
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: Spacing.md }}
      >
        {packageSlots.map(renderChip)}
      </ScrollView>
    </View>
  );
}

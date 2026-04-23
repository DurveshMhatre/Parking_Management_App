import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { VEHICLE_META, type VehicleType } from '../constants/pricing';

interface VehicleTypeSelectorProps {
  selectedType: VehicleType | null;
  onSelect: (type: VehicleType) => void;
}

const VEHICLE_ORDER: VehicleType[] = ['car', 'bike', 'rickshaw'];

export default function VehicleTypeSelector({ selectedType, onSelect }: VehicleTypeSelectorProps) {
  const { colors } = useTheme();

  const handleSelect = (type: VehicleType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(type);
  };

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: Spacing.md,
        }}
      >
        Select Vehicle
      </Text>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {VEHICLE_ORDER.map((type) => {
          const meta = VEHICLE_META[type];
          const isSelected = selectedType === type;

          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.7}
              onPress={() => handleSelect(type)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 110,
                backgroundColor: isSelected ? colors.bgSurface : colors.bgCard,
                borderRadius: BorderRadius.xl,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? colors.accent : colors.border,
                position: 'relative',
                ...(isSelected ? Shadows.lg : {}),
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: Spacing.xs }}>{meta.icon}</Text>
              <Text
                style={{
                  fontSize: FontSize.md,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? colors.textPrimary : colors.textMuted,
                }}
              >
                {meta.label}
              </Text>
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: FontWeight.bold }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

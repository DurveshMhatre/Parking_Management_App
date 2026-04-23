import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import VehicleTypeSelector from '../components/VehicleTypeSelector';
import DurationSelector from '../components/DurationSelector';
import PriceSummaryCard from '../components/PriceSummaryCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows, ParkingConfig } from '../constants/theme';
import {
  PRICING,
  VEHICLE_META,
  DURATION_MINUTES,
  formatPrice,
  calculateCustomPrice,
  type VehicleType,
  type DurationKey,
} from '../constants/pricing';
import { formatVehicleNumber } from '../lib/utils';

export default function EntryScreen() {
  const { colors, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [vehicleNo, setVehicleNo] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Custom hours state
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState(1);

  const currentSlots = selectedType ? PRICING[selectedType] : null;
  const currentSlot = currentSlots ? currentSlots[selectedDurationIndex] : null;
  const vehicleMeta = selectedType ? VEHICLE_META[selectedType] : null;

  // Derive price: use custom calculation when custom is active
  const customPricing = selectedType && isCustom
    ? calculateCustomPrice(selectedType, customHours)
    : null;

  const displayPrice = isCustom && customPricing
    ? customPricing.price
    : currentSlot?.price || 0;

  const displayPriceInPaise = isCustom && customPricing
    ? customPricing.priceInPaise
    : currentSlot?.priceInPaise || 0;

  const displayDurationLabel = isCustom && customPricing
    ? customPricing.label
    : currentSlot?.label || '';

  const displayDuration = isCustom
    ? `${customHours} hr${customHours !== 1 ? 's' : ''}`
    : currentSlot?.displayDuration || '';

  const durationMins = isCustom
    ? customHours * 60
    : currentSlot ? DURATION_MINUTES[currentSlot.durationKey] : 0;

  const durationKey: DurationKey = isCustom ? 'custom' : (currentSlot?.durationKey || '3hr');

  const isValid = selectedType && vehicleNo.replace(/[-\s]/g, '').length >= 6 && (isCustom || currentSlot);

  const handleProceed = () => {
    if (!selectedType || !vehicleMeta) {
      Alert.alert('Error', 'Please select a vehicle type.');
      return;
    }
    if (vehicleNo.replace(/[-\s]/g, '').length < 6) {
      Alert.alert('Error', 'Please enter a valid vehicle number (min 6 characters).');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.push({
        pathname: '/payment',
        params: {
          vehicleNo: vehicleNo.trim(),
          vehicleType: selectedType,
          vehicleTypeName: vehicleMeta.label,
          vehicleTypeIcon: vehicleMeta.icon,
          durationKey,
          durationLabel: displayDurationLabel,
          displayDuration,
          amount: displayPrice.toString(),
          amountInPaise: displayPriceInPaise.toString(),
          durationMins: durationMins.toString(),
          isPackage: (!isCustom && currentSlot?.isPackage) ? '1' : '0',
          savingLabel: (!isCustom && currentSlot?.savingLabel) || '',
          isCustom: isCustom ? '1' : '0',
          customHours: customHours.toString(),
        },
      });
    });
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
            <LinearGradient
              colors={colors.gradientAccent as any}
              style={{
                width: 36,
                height: 36,
                borderRadius: BorderRadius.md,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.sm,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: '#FFF' }}>P</Text>
            </LinearGradient>
            <Text style={{ fontSize: FontSize.xxl + 2, fontWeight: FontWeight.extrabold, color: colors.textPrimary }}>
              Smart Parking
            </Text>
          </View>
          <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>
            Powered by ParkSpace
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: Spacing.xs }}>
          <ThemeToggle />
          <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>{timeStr}</Text>
          <Text style={{ fontSize: FontSize.xs, color: colors.textMuted, marginTop: 2 }}>{dateStr}</Text>
        </View>
      </View>

      {/* Location Bar */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: BorderRadius.full,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm + 2,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: Spacing.xl,
        }}
      >
        <Text style={{ fontSize: 16, marginRight: Spacing.sm }}>📍</Text>
        <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, flex: 1 }}>
          {ParkingConfig.locationLabel}
        </Text>
      </View>

      {/* Vehicle number first — so user fills identity before selecting options */}
      <View style={{ marginBottom: Spacing.lg }}>
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
          Vehicle Number
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.bgSurface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: colors.textPrimary,
            textAlign: 'center',
            letterSpacing: 3,
            borderWidth: inputFocused ? 2 : 1,
            borderColor: inputFocused ? colors.accent : colors.border,
            fontFamily: 'monospace',
          }}
          placeholder="MH 12 AB 1234"
          placeholderTextColor={colors.textMuted}
          value={vehicleNo}
          onChangeText={(text) => setVehicleNo(formatVehicleNumber(text))}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          autoCapitalize="characters"
          maxLength={13}
        />
      </View>

      <View style={{ height: 24 }} />  {/* Section spacer */}

      {/* Vehicle Type Selector */}
      <VehicleTypeSelector selectedType={selectedType} onSelect={setSelectedType} />

      {/* Duration Selector */}
      {currentSlots && (
        <DurationSelector
          slots={currentSlots}
          selectedIndex={selectedDurationIndex}
          onSelect={setSelectedDurationIndex}
          isCustom={isCustom}
          onCustomToggle={setIsCustom}
          customHours={customHours}
          onCustomHoursChange={setCustomHours}
        />
      )}

      {/* Price Summary — show custom price or selected slot */}
      {!isCustom && currentSlot && vehicleMeta && (
        <PriceSummaryCard
          slot={currentSlot}
          vehicleIcon={vehicleMeta.icon}
          vehicleLabel={vehicleMeta.label}
        />
      )}

      {/* Custom Price Summary */}
      {isCustom && customPricing && vehicleMeta && (
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            borderWidth: 1,
            borderColor: colors.accent + '40',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Text style={{ fontSize: 24 }}>{vehicleMeta.icon}</Text>
              <View>
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: colors.textPrimary }}>
                  {vehicleMeta.label} — {customPricing.label}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                  ₹{vehicleMeta.hourlyRate}/hr × {customHours} hr{customHours !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: colors.accent }}>
              {formatPrice(customPricing.price)}
            </Text>
          </View>
        </View>
      )}

      {/* CTA Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleProceed}
          disabled={!isValid}
          style={{
            borderRadius: BorderRadius.lg,
            overflow: 'hidden',
            opacity: isValid ? 1 : 0.5,
            ...(isValid ? Shadows.glow : {}),
          }}
        >
          <LinearGradient
            colors={isValid ? (colors.gradientCTA as any) : [isDark ? '#2A2A3E' : '#D1D5DB', isDark ? '#2A2A3E' : '#D1D5DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: Spacing.lg,
              alignItems: 'center',
              borderRadius: BorderRadius.lg,
              height: 56,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: FontSize.lg,
                fontWeight: FontWeight.extrabold,
                color: isValid ? '#FFFFFF' : colors.textMuted,
              }}
            >
              {displayPrice > 0
                ? `Proceed to Pay ${formatPrice(displayPrice)}`
                : 'Select Vehicle & Duration'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

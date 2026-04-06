import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useParkingStore, VehicleType } from '../store/parkingStore';
import VehicleTypeSelector from '../components/VehicleTypeSelector';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatVehicleNumber, calculateFee } from '../lib/utils';

const DURATION_OPTIONS = [
  { label: '1 Hour', value: 60 },
  { label: '2 Hours', value: 120 },
  { label: '3 Hours', value: 180 },
  { label: '5 Hours', value: 300 },
];

export default function EntryScreen() {
  const { vehicleTypes, slotAvailability } = useParkingStore();
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [vehicleNo, setVehicleNo] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);

  const hourlyRate = selectedType?.hourly_rate || 20;
  const totalAmount = calculateFee(selectedDuration, hourlyRate);

  const availability = Object.fromEntries(
    Object.entries(slotAvailability).map(([id, val]) => [
      Number(id),
      { available: val.available, total: val.total },
    ])
  );

  const handleProceed = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a vehicle type.');
      return;
    }
    if (!vehicleNo.trim() || vehicleNo.replace(/[-\s]/g, '').length < 4) {
      Alert.alert('Error', 'Please enter a valid vehicle number.');
      return;
    }

    const avail = slotAvailability[selectedType.id];
    if (avail && avail.available <= 0) {
      Alert.alert('No Slots', `No ${selectedType.name} slots available right now.`);
      return;
    }

    // Navigate to payment with params
    router.push({
      pathname: '/payment',
      params: {
        vehicleNo: vehicleNo.trim(),
        vehicleTypeId: selectedType.id.toString(),
        vehicleTypeName: selectedType.name,
        vehicleTypeIcon: selectedType.icon,
        durationMins: selectedDuration.toString(),
        amount: totalAmount.toString(),
        hourlyRate: hourlyRate.toString(),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Vehicle Type */}
      <VehicleTypeSelector
        vehicleTypes={vehicleTypes}
        selectedId={selectedType?.id || null}
        onSelect={setSelectedType}
        availability={availability}
      />

      {/* Vehicle Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Number</Text>
        <TextInput
          style={styles.vehicleInput}
          placeholder="MH-12-AB-1234"
          placeholderTextColor={Colors.textMuted}
          value={vehicleNo}
          onChangeText={(text) => setVehicleNo(formatVehicleNumber(text))}
          autoCapitalize="characters"
          maxLength={13}
        />
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parking Duration</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.durationCard,
                selectedDuration === opt.value && styles.durationCardActive,
              ]}
              onPress={() => setSelectedDuration(opt.value)}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === opt.value && styles.durationTextActive,
                ]}
              >
                {opt.label}
              </Text>
              <Text
                style={[
                  styles.durationPrice,
                  selectedDuration === opt.value && styles.durationPriceActive,
                ]}
              >
                ₹{calculateFee(opt.value, hourlyRate)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Price Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {selectedType?.icon || '🚗'} {selectedType?.name || 'Vehicle'} × {selectedDuration / 60}hr
          </Text>
          <Text style={styles.summaryValue}>₹{totalAmount}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{totalAmount}</Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity style={styles.proceedButton} onPress={handleProceed} activeOpacity={0.85}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.proceedGradient}
        >
          <Text style={styles.proceedText}>Proceed to Pay ₹{totalAmount}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vehicleInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  durationCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  durationText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  durationTextActive: {
    color: Colors.primary,
  },
  durationPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    marginTop: 4,
  },
  durationPriceActive: {
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.success,
  },
  proceedButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  proceedGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  proceedText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
});

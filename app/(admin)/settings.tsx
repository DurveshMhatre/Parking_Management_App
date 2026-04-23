import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useParkingStore } from '../../store/parkingStore';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';

export default function SettingsScreen() {
  const { vehicleTypes, config, fetchVehicleTypes, fetchConfig } = useParkingStore();
  const [rates, setRates] = useState<{ [id: number]: string }>({});
  const [slots, setSlots] = useState<{ [id: number]: string }>({});
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const rateMap: { [id: number]: string } = {};
    const slotMap: { [id: number]: string } = {};
    vehicleTypes.forEach((vt) => {
      rateMap[vt.id] = vt.hourly_rate.toString();
      slotMap[vt.id] = vt.total_slots.toString();
    });
    setRates(rateMap);
    setSlots(slotMap);
    setIsActive(config?.is_active ?? true);
  }, [vehicleTypes, config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update vehicle types
      for (const vt of vehicleTypes) {
        const newRate = parseFloat(rates[vt.id] || '20');
        const newSlots = parseInt(slots[vt.id] || '0');

        if (isNaN(newRate) || isNaN(newSlots) || newRate < 0 || newSlots < 0) {
          Alert.alert('Error', `Invalid values for ${vt.name}`);
          setIsSaving(false);
          return;
        }

        await supabase
          .from('vehicle_types')
          .update({ hourly_rate: newRate, total_slots: newSlots })
          .eq('id', vt.id);
      }

      // Update config
      if (config) {
        await supabase
          .from('parking_config')
          .update({ is_active: isActive })
          .eq('id', config.id);
      }

      await fetchVehicleTypes();
      await fetchConfig();
      Alert.alert('✅ Saved!', 'Settings updated successfully.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Parking Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parking Status</Text>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusLabel}>Parking Lot Active</Text>
            <Text style={styles.statusDesc}>
              {isActive ? 'Accepting new vehicles' : 'Parking is closed'}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: Colors.success, false: Colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Vehicle Rates & Slots */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rates & Slots</Text>
        {vehicleTypes.map((vt) => (
          <View key={vt.id} style={styles.vehicleRow}>
            <View style={styles.vehicleHeader}>
              <Text style={styles.vehicleIcon}>{vt.icon}</Text>
              <Text style={styles.vehicleName}>{vt.name}</Text>
            </View>
            <View style={styles.inputsRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>₹ / Hour</Text>
                <TextInput
                  style={styles.input}
                  value={rates[vt.id] || ''}
                  onChangeText={(text) =>
                    setRates((prev) => ({ ...prev, [vt.id]: text }))
                  }
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Slots</Text>
                <TextInput
                  style={styles.input}
                  value={slots[vt.id] || ''}
                  onChangeText={(text) =>
                    setSlots((prev) => ({ ...prev, [vt.id]: text }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Lot Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lot Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lot Name</Text>
            <Text style={styles.infoValue}>{config?.lot_name || 'Durvesh Parking'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Operating Hours</Text>
            <Text style={styles.infoValue}>
              24/7 Open
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency</Text>
            <Text style={styles.infoValue}>{config?.currency || 'INR'}</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? '⏳ Saving...' : '💾 Save Settings'}
        </Text>
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
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statusRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  statusDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vehicleRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  vehicleIcon: {
    fontSize: 24,
  },
  vehicleName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
});

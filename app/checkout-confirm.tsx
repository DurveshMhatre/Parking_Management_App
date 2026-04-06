import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useParkingStore } from '../store/parkingStore';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDuration, formatDateTime } from '../lib/utils';

export default function CheckoutConfirmScreen() {
  const { allSessions } = useParkingStore();
  const lastCompleted = allSessions.find((s) => s.status === 'completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success animation */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        <Text style={styles.successTitle}>Checkout Complete!</Text>
        <Text style={styles.successDesc}>Thank you for parking with us</Text>
      </View>

      {/* Receipt Card */}
      {lastCompleted && (
        <View style={styles.receiptCard}>
          <Text style={styles.receiptTitle}>🧾 Receipt</Text>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Vehicle</Text>
            <Text style={styles.receiptValue}>
              {(lastCompleted.vehicle_type as any)?.icon || '🚗'} {lastCompleted.vehicle_no}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Entry</Text>
            <Text style={styles.receiptValue}>{formatDateTime(lastCompleted.entry_time)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Exit</Text>
            <Text style={styles.receiptValue}>
              {lastCompleted.exit_time ? formatDateTime(lastCompleted.exit_time) : 'N/A'}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Duration</Text>
            <Text style={styles.receiptValue}>
              {lastCompleted.duration_mins ? formatDuration(lastCompleted.duration_mins) : 'N/A'}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Ticket</Text>
            <Text style={styles.receiptValue}>{lastCompleted.ticket_code}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid</Text>
            <Text style={styles.totalValue}>₹{lastCompleted.amount_paid}</Text>
          </View>
        </View>
      )}

      {/* Park Again */}
      <TouchableOpacity style={styles.parkAgainButton} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.parkAgainGradient}
        >
          <Text style={styles.parkAgainText}>🏠 Back to Home</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reBookButton}
        onPress={() => router.push('/entry')}
      >
        <Text style={styles.reBookText}>🅿️ Park Another Vehicle</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🅿️ Durvesh Parking</Text>
        <Text style={styles.footerSubtext}>We hope to see you again!</Text>
      </View>
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
    paddingTop: Spacing.xxl + Spacing.xl,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.success,
  },
  successDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  receiptTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  receiptLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  receiptValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  parkAgainButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.glow,
  },
  parkAgainGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  parkAgainText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  reBookButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Spacing.xl,
  },
  reBookText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

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
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDuration, formatDateTime } from '../lib/utils';

export default function CheckoutConfirmScreen() {
  const { colors, isDark } = useTheme();
  const { allSessions } = useParkingStore();
  const lastCompleted = allSessions.find((s) => s.status === 'completed');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgPrimary }]} contentContainerStyle={styles.content}>
      {/* Success animation */}
      <View style={styles.successHeader}>
        <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        <Text style={[styles.successTitle, { color: colors.success }]}>Checkout Complete!</Text>
        <Text style={[styles.successDesc, { color: colors.textSecondary }]}>Thank you for parking with us</Text>
      </View>

      {/* Receipt Card */}
      {lastCompleted && (
        <View style={[styles.receiptCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
          ...(isDark ? Shadows.md : {
            shadowColor: '#000000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }),
        }]}>
          <Text style={[styles.receiptTitle, { color: colors.textPrimary }]}>🧾 Receipt</Text>

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Vehicle</Text>
            <Text style={[styles.receiptValue, { color: colors.textPrimary }]}>
              {(lastCompleted.vehicle_type as any)?.icon || '🚗'} {lastCompleted.vehicle_no}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Entry</Text>
            <Text style={[styles.receiptValue, { color: colors.textPrimary }]}>{formatDateTime(lastCompleted.entry_time)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Exit</Text>
            <Text style={[styles.receiptValue, { color: colors.textPrimary }]}>
              {lastCompleted.exit_time ? formatDateTime(lastCompleted.exit_time) : 'N/A'}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.receiptValue, { color: colors.textPrimary }]}>
              {lastCompleted.duration_mins ? formatDuration(lastCompleted.duration_mins) : 'N/A'}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Ticket</Text>
            <Text style={[styles.receiptValue, { color: colors.textPrimary }]}>{lastCompleted.ticket_code}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Amount Paid</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>₹{lastCompleted.amount_paid}</Text>
          </View>
        </View>
      )}

      {/* Park Again */}
      <TouchableOpacity style={styles.parkAgainButton} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
        <LinearGradient
          colors={colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.parkAgainGradient}
        >
          <Text style={styles.parkAgainText}>🏠 Back to Home</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reBookButton, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.accent + '30',
        }]}
        onPress={() => router.push('/entry')}
      >
        <Text style={[styles.reBookText, { color: colors.accent }]}>🅿️ Park Another Vehicle</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>🅿️ Durvesh Parking</Text>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>We hope to see you again!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  successDesc: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  receiptCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  receiptTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  receiptLabel: {
    fontSize: FontSize.md,
  },
  receiptValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  divider: {
    height: 1,
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
  },
  totalValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  reBookText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    marginTop: 4,
  },
});

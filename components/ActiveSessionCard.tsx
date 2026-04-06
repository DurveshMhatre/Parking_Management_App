import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { getElapsedMinutes, formatDuration, formatTime } from '../lib/utils';
import type { ParkingSession } from '../store/parkingStore';

interface ActiveSessionCardProps {
  session: ParkingSession;
  onCheckout?: () => void;
  onPress?: () => void;
  compact?: boolean;
}

export default function ActiveSessionCard({
  session,
  onCheckout,
  onPress,
  compact = false,
}: ActiveSessionCardProps) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(session.entry_time));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes(session.entry_time));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [session.entry_time]);

  const vehicleType = session.vehicle_type;
  const icon = vehicleType?.icon || '🚗';
  const typeName = vehicleType?.name || 'Vehicle';

  const Content = () => (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Glowing indicator */}
      <View style={styles.glowDot} />

      <View style={styles.topRow}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={styles.vehicleNo}>{session.vehicle_no}</Text>
            <Text style={styles.vehicleType}>{typeName}</Text>
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Elapsed</Text>
          <Text style={styles.timerValue}>{formatDuration(elapsed)}</Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Entry</Text>
              <Text style={styles.detailValue}>{formatTime(session.entry_time)}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Paid</Text>
              <Text style={styles.detailValue}>₹{session.amount_paid}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Ticket</Text>
              <Text style={styles.detailValue}>{session.ticket_code}</Text>
            </View>
          </View>

          {onCheckout && (
            <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
              <Text style={styles.checkoutBtnText}>Request Checkout</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Content />
      </TouchableOpacity>
    );
  }

  return <Content />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardCompact: {
    padding: Spacing.md,
  },
  glowDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    ...Shadows.glow,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  vehicleNo: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  vehicleType: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
});

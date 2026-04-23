import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
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
  const { colors, isDark } = useTheme();
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
    <View style={[styles.card, compact && styles.cardCompact, {
      backgroundColor: colors.bgSurface,
      borderColor: colors.accent + '40',
      ...(isDark ? Shadows.md : {
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }),
    }]}>
      {/* Glowing indicator */}
      <View style={[styles.glowDot, { backgroundColor: colors.success }]} />

      <View style={styles.topRow}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={[styles.vehicleNo, { color: colors.textPrimary }]}>{session.vehicle_no}</Text>
            <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>{typeName}</Text>
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Text style={[styles.timerLabel, { color: colors.textMuted }]}>Elapsed</Text>
          <Text style={[styles.timerValue, { color: colors.success }]}>{formatDuration(elapsed)}</Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={[styles.detailsRow, { borderTopColor: colors.border }]}>
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Entry</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatTime(session.entry_time)}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Paid</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>₹{session.amount_paid}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Ticket</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{session.ticket_code}</Text>
            </View>
          </View>

          {onCheckout && (
            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.accent }]} onPress={onCheckout}>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
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
  },
  vehicleType: {
    fontSize: FontSize.sm,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  checkoutBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
});

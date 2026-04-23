import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDateTime } from '../lib/utils';

interface QRTicketProps {
  ticketCode: string;
  vehicleNo: string;
  vehicleType: string;
  vehicleIcon: string;
  entryTime: string;
  amountPaid: number;
  status?: string;
}

export default function QRTicket({
  ticketCode,
  vehicleNo,
  vehicleType,
  vehicleIcon,
  entryTime,
  amountPaid,
  status = 'active',
}: QRTicketProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1E1E35', '#2A2A45'] : ['#FFFFFF', '#F4F6FA']}
        style={[styles.ticket, isDark ? Shadows.lg : {
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.lotName, { color: colors.textPrimary }]}>🅿️ Durvesh Parking</Text>
          <View style={[styles.statusBadge, status === 'active' ? { backgroundColor: colors.successLight } : { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              {status === 'active' ? '🟢 ACTIVE' : '✅ COMPLETED'}
            </Text>
          </View>
        </View>

        {/* Dashed separator */}
        <View style={[styles.dashedLine, { borderColor: colors.border }]} />

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={[styles.qrBackground, isDark ? Shadows.md : {
            shadowColor: '#000000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }]}>
            <QRCode
              value={ticketCode}
              size={160}
              backgroundColor="#FFFFFF"
              color="#1A1A2E"
            />
          </View>
          <Text style={[styles.ticketCodeLabel, { color: colors.textMuted }]}>Ticket Code</Text>
          <Text style={[styles.ticketCode, { color: colors.accent }]}>{ticketCode}</Text>
        </View>

        {/* Dashed separator */}
        <View style={[styles.dashedLine, { borderColor: colors.border }]} />

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{vehicleIcon} {vehicleNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{vehicleType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Entry Time</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDateTime(entryTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount Paid</Text>
            <Text style={[styles.amountValue, { color: colors.success }]}>₹{amountPaid}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Show this QR code at exit for checkout</Text>
        </View>
      </LinearGradient>

      {/* Ticket notches */}
      <View style={[styles.notch, styles.notchLeft, { backgroundColor: colors.bgPrimary }]} />
      <View style={[styles.notch, styles.notchRight, { backgroundColor: colors.bgPrimary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: Spacing.md,
  },
  ticket: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lotName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  qrBackground: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ticketCodeLabel: {
    fontSize: FontSize.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketCode: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 3,
    marginTop: 4,
  },
  details: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: FontSize.sm,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  amountValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },
  notch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: '50%',
    marginTop: -12,
  },
  notchLeft: {
    left: -12,
  },
  notchRight: {
    right: -12,
  },
});

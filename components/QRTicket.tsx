import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
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
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1E35', '#2A2A45']}
        style={styles.ticket}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.lotName}>🅿️ Durvesh Parking</Text>
          <View style={[styles.statusBadge, status === 'active' ? styles.activeBadge : styles.completedBadge]}>
            <Text style={styles.statusText}>
              {status === 'active' ? '🟢 ACTIVE' : '✅ COMPLETED'}
            </Text>
          </View>
        </View>

        {/* Dashed separator */}
        <View style={styles.dashedLine} />

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBackground}>
            <QRCode
              value={ticketCode}
              size={160}
              backgroundColor="#FFFFFF"
              color="#1A1A2E"
            />
          </View>
          <Text style={styles.ticketCodeLabel}>Ticket Code</Text>
          <Text style={styles.ticketCode}>{ticketCode}</Text>
        </View>

        {/* Dashed separator */}
        <View style={styles.dashedLine} />

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{vehicleIcon} {vehicleNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{vehicleType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entry Time</Text>
            <Text style={styles.detailValue}>{formatDateTime(entryTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.amountValue}>₹{amountPaid}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Show this QR code at exit for checkout</Text>
        </View>
      </LinearGradient>

      {/* Ticket notches */}
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
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
    ...Shadows.lg,
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
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  activeBadge: {
    backgroundColor: Colors.successLight,
  },
  completedBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
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
    ...Shadows.md,
  },
  ticketCodeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketCode: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
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
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  amountValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  notch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
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

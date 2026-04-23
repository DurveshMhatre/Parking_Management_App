import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDateTime } from '../lib/utils';

export default function PenaltyReceiptScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    sessionId: string;
    vehicleNo: string;
    vehicleType: string;
    expiryTime: string;
    overstayHours: string;
    penaltyAmount: string;
    paymentId: string;
    penaltyDeductedAt: string;
    customerPhone: string;
  }>();

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `🅿️ ParkSpace — Overstay Penalty Receipt\n\nVehicle: ${params.vehicleType} — ${params.vehicleNo}\nOverstay: ${params.overstayHours} hour(s)\nPenalty: ₹${params.penaltyAmount}\nPayment ID: ${params.paymentId}\n\nAuto-deducted from authorized UPI.`,
      });
    } catch {}
  };

  const rows = [
    { label: 'Vehicle', value: `${params.vehicleType || 'N/A'} — ${params.vehicleNo || 'N/A'}` },
    { label: 'Booking Expired', value: params.expiryTime ? formatDateTime(params.expiryTime) : 'N/A' },
    { label: 'Overstay', value: `${params.overstayHours || 0} hour(s)` },
    { label: 'Penalty Rate', value: '₹20 / hour' },
    { label: 'Amount Deducted', value: `₹${params.penaltyAmount || 0}`, bold: true },
    { label: 'Payment ID', value: params.paymentId || 'N/A', mono: true },
    { label: 'Deducted At', value: params.penaltyDeductedAt ? formatDateTime(params.penaltyDeductedAt) : 'N/A' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg }}
    >
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>⚠️</Text>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: colors.error }}>
          Overstay Penalty Deducted
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' }}>
          Auto-payment processed from your authorized UPI
        </Text>
      </View>

      {/* Receipt Card */}
      <View style={{
        backgroundColor: colors.bgCard,
        borderRadius: BorderRadius.xxl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: Spacing.xl,
        ...Shadows.md,
      }}>
        {/* Red strip */}
        <View style={{ height: 6, backgroundColor: colors.error }} />

        <View style={{ padding: Spacing.lg }}>
          {rows.map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm }}>
              <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>{row.label}</Text>
              <Text style={{
                fontSize: FontSize.sm,
                fontWeight: row.bold ? FontWeight.extrabold : FontWeight.semibold,
                color: row.bold ? colors.error : colors.textPrimary,
                fontFamily: row.mono ? 'monospace' : undefined,
              }}>
                {row.value}
              </Text>
            </View>
          ))}

          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: Spacing.md, paddingTop: Spacing.md }}>
            <Text style={{ fontSize: FontSize.xs, color: colors.textMuted, textAlign: 'center' }}>
              Receipt sent to WhatsApp: +91••••••{(params.customerPhone || '').slice(-4)}
            </Text>
          </View>
        </View>
      </View>

      {/* Share Receipt */}
      <TouchableOpacity
        onPress={handleShareReceipt}
        style={{
          borderWidth: 1.5,
          borderColor: colors.accent,
          borderRadius: BorderRadius.lg,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        <Text style={{ color: colors.accent, fontWeight: FontWeight.bold, fontSize: FontSize.md }}>📤 Share Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(tabs)')}
        style={{ borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center' }}
      >
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: colors.textMuted }}>
          🏠 Back to Home
        </Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

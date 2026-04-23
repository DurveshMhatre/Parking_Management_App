import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import QRTicket from '../components/QRTicket';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDateTime } from '../lib/utils';
import { calculatePenalty } from '../constants/pricing';

// ── Parking Timer Component ──────────────────────────────
function ParkingTimer({ expiryTime, penaltyDeducted, penaltyAmount }: {
  expiryTime: string;
  penaltyDeducted?: boolean;
  penaltyAmount?: number;
}) {
  const { colors } = useTheme();
  const [remaining, setRemaining] = useState(0);
  const [isOverstay, setIsOverstay] = useState(false);
  const [liveAmount, setLiveAmount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const diff = new Date(expiryTime).getTime() - Date.now();
      if (diff <= 0) {
        setIsOverstay(true);
        const min = Math.abs(Math.floor(diff / 60000));
        setLiveAmount(calculatePenalty(min).amount);
        setRemaining(Math.abs(diff));
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiryTime]);

  const hrs  = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pad  = (n: number) => String(n).padStart(2, '0');

  if (penaltyDeducted) {
    return (
      <View style={{
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: colors.error,
        backgroundColor: 'rgba(255,71,87,0.08)',
        padding: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.md,
      }}>
        <Text style={{ color: colors.error, fontWeight: FontWeight.semibold, fontSize: FontSize.md }}>
          ✅ Penalty Auto-Deducted — ₹{penaltyAmount}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: FontSize.xs, marginTop: 4 }}>
          Receipt sent to your WhatsApp
        </Text>
      </View>
    );
  }

  if (isOverstay) {
    return (
      <View style={{
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: colors.error,
        backgroundColor: 'rgba(255,71,87,0.08)',
        padding: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.md,
      }}>
        <Text style={{ color: colors.error, fontWeight: FontWeight.bold, fontSize: FontSize.sm, letterSpacing: 1 }}>
          🔴 OVERSTAY
        </Text>
        <Text style={{ color: colors.error, fontSize: 32, fontWeight: FontWeight.extrabold, marginVertical: 4 }}>
          +{pad(hrs)}:{pad(mins)}:{pad(secs)}
        </Text>
        <Text style={{ color: colors.error, fontSize: FontSize.xs, marginTop: 4 }}>
          ₹{liveAmount} will be auto-deducted from your UPI
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: FontSize.xs - 1, marginTop: 2 }}>
          You have received app warnings. Check WhatsApp for final notice.
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.success,
      padding: Spacing.md,
      alignItems: 'center',
      marginBottom: Spacing.md,
    }}>
      <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
        Time Remaining
      </Text>
      <Text style={{ color: colors.success, fontSize: 32, fontWeight: FontWeight.extrabold, marginVertical: 4 }}>
        {pad(hrs)}:{pad(mins)}:{pad(secs)}
      </Text>
    </View>
  );
}


export default function TicketScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    sessionId: string;
    ticketCode: string;
    vehicleNo: string;
    vehicleTypeName: string;
    vehicleTypeIcon: string;
    entryTime: string;
    expiryTime: string;
    amountPaid: string;
    durationLabel: string;
    displayDuration: string;
  }>();

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Mandate state (simplified — in production, fetch from DB)
  const [mandateAuthorized, setMandateAuthorized] = useState(false);
  const [mandateUrl, setMandateUrl] = useState<string | null>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Checkmark scale-in
    Animated.spring(checkScale, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Card slide up + fade in
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🅿️ ParkSpace Ticket\n\nTicket: ${params.ticketCode}\nVehicle: ${params.vehicleNo}\nType: ${params.vehicleTypeName}\nDuration: ${params.durationLabel}\nEntry: ${formatDateTime(params.entryTime || new Date().toISOString())}\nPaid: ₹${params.amountPaid}\n\nShow this QR at exit gate.`,
        title: 'ParkSpace Ticket',
      });
    } catch {}
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  const entryStr = formatDateTime(params.entryTime || new Date().toISOString());
  const expiryStr = params.expiryTime
    ? formatDateTime(params.expiryTime)
    : 'N/A';

  const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 2 }}>
      <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>{label}</Text>
      <Text
        style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: colors.textPrimary,
          fontFamily: mono ? 'monospace' : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.lg }}
    >
      {/* Success Header */}
      <Animated.View style={{ alignItems: 'center', marginBottom: Spacing.xl, transform: [{ scale: checkScale }] }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.successLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.md,
          }}
        >
          <Text style={{ fontSize: 36 }}>✅</Text>
        </View>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: colors.accent }}>
          You're Parked! 🎉
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginTop: Spacing.xs }}>
          Payment successful · Receipt generated
        </Text>
      </Animated.View>

      {/* Mandate Authorization Banner */}
      {!mandateAuthorized && (
        <View style={{
          backgroundColor: colors.bgCard,
          borderRadius: BorderRadius.xl,
          borderWidth: 1.5,
          borderColor: colors.warning,
          padding: Spacing.md,
          marginBottom: Spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        }}>
          <Text style={{ fontSize: 28 }}>🔐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: FontWeight.semibold, fontSize: FontSize.md }}>
              One-Time AutoPay Setup
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 }}>
              Authorize once. If you ever overstay, ₹20/hr is auto-deducted from your UPI — no manual payment needed.
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.accent,
              borderRadius: BorderRadius.md,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
            }}
            onPress={() => {
              if (mandateUrl) {
                Linking.openURL(mandateUrl);
              } else {
                // In production: call create-mandate edge function
                Alert.alert('AutoPay', 'Mandate authorization will be available once the backend is deployed.');
              }
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: FontWeight.semibold, fontSize: FontSize.xs }}>
              Authorize via UPI
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Live Parking Timer */}
      {params.expiryTime && (
        <ParkingTimer expiryTime={params.expiryTime} />
      )}

      {/* Ticket Card */}
      <Animated.View
        style={{
          transform: [{ translateY: cardSlide }],
          opacity: cardOpacity,
          marginBottom: Spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: BorderRadius.xxl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            ...Shadows.md,
            ...(isDark ? {} : {
              shadowColor: '#000000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }),
          }}
        >
          {/* Gradient header strip */}
          <LinearGradient
            colors={colors.gradientAccent as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 8 }}
          />

          {/* QR Section */}
          <View style={{ alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.md }}>
            <QRTicket
              ticketCode={params.ticketCode || 'DP00000000'}
              vehicleNo={params.vehicleNo || 'XX-00-XX-0000'}
              vehicleType={params.vehicleTypeName || 'Vehicle'}
              vehicleIcon={params.vehicleTypeIcon || '🚗'}
              entryTime={params.entryTime || new Date().toISOString()}
              amountPaid={parseFloat(params.amountPaid || '0')}
              status="active"
            />
          </View>

          {/* Ticket ID */}
          <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
            <Text style={{ fontSize: FontSize.sm, fontFamily: 'monospace', color: colors.textMuted, letterSpacing: 1 }}>
              #{params.ticketCode || 'DP00000000'}
            </Text>
          </View>

          {/* Dashed tear line */}
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              borderStyle: 'dashed',
              marginHorizontal: Spacing.lg,
            }}
          />

          {/* Info Rows */}
          <View style={{ padding: Spacing.lg }}>
            <InfoRow label="Vehicle" value={`${params.vehicleTypeIcon} ${params.vehicleNo}`} mono />
            <InfoRow label="Type" value={params.vehicleTypeName || 'N/A'} />
            <InfoRow label="Duration" value={params.durationLabel || params.displayDuration || 'N/A'} />
            <InfoRow label="Entry" value={entryStr} />
            <InfoRow label="Expiry" value={expiryStr} />
            <InfoRow label="Amount Paid" value={`₹${parseInt(params.amountPaid || '0').toLocaleString('en-IN')}`} />
          </View>

          {/* Show QR at exit strip */}
          <View
            style={{
              backgroundColor: colors.warningLightBg,
              paddingVertical: Spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: colors.warning }}>
              Show this QR at exit gate
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      {/* Share Ticket button — explicit text color, never inherited */}
      <TouchableOpacity
        onPress={handleShare}
        style={{
          borderWidth: 1.5,
          borderColor: colors.accent,
          borderRadius: BorderRadius.lg,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: 'transparent',
          marginBottom: Spacing.sm,
        }}
      >
        <Text style={{
          color: colors.accent,       // ← THIS must be explicitly set, never inherited
          fontSize: 16,
          fontWeight: FontWeight.bold,
        }}>
          📤 Share Ticket
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDone}
        style={{
          borderRadius: BorderRadius.lg,
          paddingVertical: Spacing.md + 2,
          alignItems: 'center',
          height: 48,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: colors.textMuted }}>
          🏠 Back to Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useParkingStore } from '../store/parkingStore';
import { smartCheckout } from '../lib/razorpay';
import { notifyTicketGenerated } from '../lib/notifications';
import { validateReferralCode } from '../lib/partners';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatPrice, DURATION_MINUTES, type DurationKey } from '../constants/pricing';

export default function PaymentScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    vehicleNo: string;
    vehicleType: string;
    vehicleTypeName: string;
    vehicleTypeIcon: string;
    durationKey: string;
    durationLabel: string;
    displayDuration: string;
    amount: string;
    amountInPaise: string;
    durationMins: string;
    isPackage: string;
    savingLabel: string;
    isCustom: string;
    customHours: string;
  }>();

  const { user } = useAuthStore();
  const { createSession } = useParkingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Referral code state
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [referralError, setReferralError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  const amount = parseInt(params.amount || '0');
  const amountInPaise = parseInt(params.amountInPaise || '0');
  const durationMins = parseInt(params.durationMins || '180');
  const isPackage = params.isPackage === '1';
  const isCustom = params.isCustom === '1';
  const customHours = parseInt(params.customHours || '1');

  // Calculate expiry
  const now = new Date();
  const expiry = new Date(now.getTime() + durationMins * 60000);
  const expiryStr = expiry.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleValidateReferral = async () => {
    if (!referralCode.trim()) {
      setReferralValid(false);
      setReferralError('');
      return;
    }
    setValidatingCode(true);
    const result = await validateReferralCode(referralCode.trim());
    setValidatingCode(false);
    if (result.valid) {
      setReferralValid(true);
      setPartnerName(result.partnerName || '');
      setPartnerId(result.partnerId || '');
      setReferralError('');
    } else {
      setReferralValid(false);
      setPartnerName('');
      setPartnerId('');
      setReferralError(result.error || 'Invalid code');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await smartCheckout({
        amount: amountInPaise,
        currency: 'INR',
        name: 'ParkSpace',
        description: `Parking — ${params.vehicleTypeName} — ${params.durationLabel}`,
        vehicleNo: params.vehicleNo,
        prefill: {
          email: user?.email || '',
          name: params.vehicleNo,
        },
      });

      if (result.success) {
        const session = await createSession({
          vehicleNo: params.vehicleNo || '',
          vehicleTypeId: params.vehicleType === 'car' ? 1 : params.vehicleType === 'bike' ? 2 : 3,
          durationMins,
          amount,
          paymentId: result.data?.razorpay_payment_id || `pay_${Date.now()}`,
          userId: user?.id,
          durationKey: params.durationKey as DurationKey,
          customHours: isCustom ? customHours : undefined,
          referralCode: referralValid ? referralCode.trim().toUpperCase() : undefined,
          partnerId: referralValid ? partnerId : undefined,
        });

        if (session) {
          await notifyTicketGenerated(params.vehicleNo || '', amount);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          router.replace({
            pathname: '/ticket',
            params: {
              sessionId: session.id,
              ticketCode: session.ticket_code,
              vehicleNo: session.vehicle_no,
              vehicleTypeName: params.vehicleTypeName,
              vehicleTypeIcon: params.vehicleTypeIcon,
              entryTime: session.entry_time,
              expiryTime: expiry.toISOString(),
              amountPaid: session.amount_paid.toString(),
              durationLabel: params.durationLabel,
              displayDuration: params.displayDuration,
            },
          });
        } else {
          Alert.alert('Error', 'Payment succeeded but failed to save the session. Please contact support.');
        }
      } else if (result.cancelled) {
        Alert.alert('Payment Cancelled', 'You cancelled the payment. Try again when ready.');
      } else {
        Alert.alert('Payment Failed', 'Could not process payment. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', `An unexpected error occurred: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const SummaryRow = ({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm + 2 }}>
      <Text style={{ fontSize: 18, width: 30 }}>{icon}</Text>
      <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, flex: 1 }}>{label}</Text>
      <Text
        style={{
          fontSize: FontSize.md,
          fontWeight: FontWeight.semibold,
          color: colors.textPrimary,
          fontFamily: mono ? 'monospace' : undefined,
          letterSpacing: mono ? 1 : 0,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }}>
          <Text style={{ fontSize: 22, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: colors.textPrimary }}>
          Booking Summary
        </Text>
      </View>

      {/* Summary Card */}
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: BorderRadius.xl,
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...(isDark ? Shadows.md : {
            shadowColor: '#000000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }),
        }}
      >
        <SummaryRow icon={params.vehicleTypeIcon || '🚗'} label="Vehicle Type" value={params.vehicleTypeName || 'Vehicle'} />
        <SummaryRow icon="🔢" label="Plate Number" value={params.vehicleNo || 'N/A'} mono />
        <SummaryRow icon="⏱️" label="Duration" value={params.durationLabel || 'N/A'} />
        <SummaryRow icon="📅" label="Valid Until" value={expiryStr} />
        <SummaryRow icon="💰" label="Amount" value={formatPrice(amount)} />
      </View>

      {/* Referral Code Section */}
      <View style={{
        backgroundColor: colors.bgCard,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: Spacing.sm,
        }}>
          Have a Partner Code? (Optional)
        </Text>
        <TextInput
          placeholder="e.g. RAVI7823"
          autoCapitalize="characters"
          maxLength={8}
          value={referralCode}
          onChangeText={(text) => {
            setReferralCode(text);
            setReferralValid(false);
            setReferralError('');
          }}
          onBlur={handleValidateReferral}
          style={{
            backgroundColor: colors.bgSurface,
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            fontSize: FontSize.md,
            fontWeight: FontWeight.semibold,
            color: colors.textPrimary,
            borderWidth: 1.5,
            borderColor: referralValid ? colors.success : referralError ? colors.error : colors.border,
            letterSpacing: 2,
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
          placeholderTextColor={colors.textMuted}
        />
        {validatingCode && (
          <Text style={{ color: colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.xs }}>
            Checking...
          </Text>
        )}
        {referralValid && (
          <Text style={{ color: colors.success, fontSize: FontSize.xs, marginTop: Spacing.xs }}>
            ✅ Partner code applied — {partnerName} will earn commission
          </Text>
        )}
        {referralError && !validatingCode && (
          <Text style={{ color: colors.error, fontSize: FontSize.xs, marginTop: Spacing.xs }}>
            ❌ {referralError}
          </Text>
        )}
      </View>

      {/* Dashed Divider */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          borderStyle: 'dashed',
          marginBottom: Spacing.lg,
        }}
      />

      {/* Payment Methods */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, marginBottom: Spacing.sm }}>Pay via</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.lg }}>
          {['📱 UPI', '💳 Card', '👛 Wallet', '🏦 NetBanking'].map((m) => (
            <Text key={m} style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>{m}</Text>
          ))}
        </View>
      </View>

      {/* Total Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.xl,
        }}
      >
        <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.textPrimary }}>
          Total Payable
        </Text>
        <Text style={{ fontSize: FontSize.xxl + 2, fontWeight: FontWeight.extrabold, color: colors.accent }}>
          {formatPrice(amount)}
        </Text>
      </View>

      {/* Pay Button — RULE: text color MUST be #FFFFFF in all states, never inherited */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePayment}
        disabled={isProcessing}
        style={{
          borderRadius: BorderRadius.lg,
          overflow: 'hidden',
          marginBottom: Spacing.sm,
          ...(isProcessing ? {} : Shadows.glow),
        }}
      >
        <LinearGradient
          colors={isProcessing ? (isDark ? ['#333', '#333'] : ['#9CA3AF', '#9CA3AF']) : (colors.gradientCTA as any)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: Spacing.lg,
            alignItems: 'center',
            borderRadius: BorderRadius.lg,
            height: 56,
            justifyContent: 'center',
          }}
        >
          {isProcessing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              {/* ✅ Text color MUST be: #FFFFFF — same as primary, never change color during loading */}
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: '#FFFFFF' }}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: '#FFFFFF' }}>
              Pay {formatPrice(amount)} Securely
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Security Note */}
      <View style={{ alignItems: 'center', marginTop: Spacing.xs }}>
        <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>
          🔒 256-bit encrypted · Powered by Razorpay
        </Text>
      </View>
    </ScrollView>
  );
}

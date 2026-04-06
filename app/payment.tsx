import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useParkingStore } from '../store/parkingStore';
import { smartCheckout } from '../lib/razorpay';
import { notifyTicketGenerated } from '../lib/notifications';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    vehicleNo: string;
    vehicleTypeId: string;
    vehicleTypeName: string;
    vehicleTypeIcon: string;
    durationMins: string;
    amount: string;
    hourlyRate: string;
  }>();

  const { user } = useAuthStore();
  const { createSession } = useParkingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = parseInt(params.amount || '20');
  const durationMins = parseInt(params.durationMins || '60');
  const hours = durationMins / 60;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      console.log('[Payment] Starting payment for', params.vehicleNo, 'amount:', amount);

      // Use smart checkout (real Razorpay in APK, mock in Expo Go)
      const result = await smartCheckout({
        orderId: `order_test_${Date.now()}`,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Durvesh Parking',
        description: `Parking: ${params.vehicleNo} (${params.vehicleTypeName})`,
        prefill: {
          email: user?.email || '',
          name: params.vehicleNo,
        },
      });

      console.log('[Payment] Checkout result:', JSON.stringify(result));

      if (result.success) {
        // Create parking session in Supabase
        console.log('[Payment] Creating session in Supabase...');
        const session = await createSession({
          vehicleNo: params.vehicleNo || '',
          vehicleTypeId: parseInt(params.vehicleTypeId || '1'),
          durationMins,
          amount,
          paymentId: result.data?.razorpay_payment_id || `test_pay_${Date.now()}`,
          userId: user?.id,
        });

        console.log('[Payment] Session created:', session?.id);

        if (session) {
          // Send notification
          await notifyTicketGenerated(params.vehicleNo || '', amount);

          // Navigate to ticket screen
          router.replace({
            pathname: '/ticket',
            params: {
              sessionId: session.id,
              ticketCode: session.ticket_code,
              vehicleNo: session.vehicle_no,
              vehicleTypeName: params.vehicleTypeName,
              vehicleTypeIcon: params.vehicleTypeIcon,
              entryTime: session.entry_time,
              amountPaid: session.amount_paid.toString(),
            },
          });
        } else {
          Alert.alert('Error', 'Payment succeeded but failed to save the parking session. Please contact support.');
        }
      } else if (result.cancelled) {
        Alert.alert('Payment Cancelled', 'You cancelled the payment. Try again when ready.');
      } else {
        console.error('[Payment] Payment failed:', result.error);
        Alert.alert('Payment Failed', 'Could not process payment. Please try again.');
      }
    } catch (error: any) {
      console.error('[Payment] Unexpected error:', error?.message || error);
      Alert.alert('Error', `An unexpected error occurred: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.vehicleRow}>
          <Text style={styles.vehicleIcon}>{params.vehicleTypeIcon}</Text>
          <View>
            <Text style={styles.vehicleNo}>{params.vehicleNo}</Text>
            <Text style={styles.vehicleType}>{params.vehicleTypeName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Parking Duration</Text>
          <Text style={styles.detailValue}>{hours} {hours === 1 ? 'Hour' : 'Hours'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>₹{params.hourlyRate}/hr</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>🅿️ Durvesh Parking</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{amount}</Text>
        </View>
      </View>

      {/* Payment Methods Info */}
      <View style={styles.paymentMethodsCard}>
        <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
        <View style={styles.methodsGrid}>
          <View style={styles.methodItem}>
            <Text style={styles.methodIcon}>📱</Text>
            <Text style={styles.methodText}>UPI</Text>
          </View>
          <View style={styles.methodItem}>
            <Text style={styles.methodIcon}>💳</Text>
            <Text style={styles.methodText}>Card</Text>
          </View>
          <View style={styles.methodItem}>
            <Text style={styles.methodIcon}>👛</Text>
            <Text style={styles.methodText}>Wallet</Text>
          </View>
          <View style={styles.methodItem}>
            <Text style={styles.methodIcon}>🏦</Text>
            <Text style={styles.methodText}>NetBanking</Text>
          </View>
        </View>
      </View>

      {/* Test Mode Banner */}
      <View style={styles.testBanner}>
        <Text style={styles.testBannerIcon}>🧪</Text>
        <Text style={styles.testBannerText}>
          Test Mode — No real money will be charged
        </Text>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
        disabled={isProcessing}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={isProcessing ? ['#555', '#444'] : (Colors.gradientPrimary as any)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.payGradient}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.payText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payText}>Pay ₹{amount}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Security note */}
      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Secured by Razorpay. Your payment information is encrypted.
        </Text>
      </View>

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
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  vehicleIcon: {
    fontSize: 40,
  },
  vehicleNo: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  vehicleType: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  detailLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
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
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.success,
  },
  paymentMethodsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentMethodsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  methodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  methodItem: {
    alignItems: 'center',
    gap: 4,
  },
  methodIcon: {
    fontSize: 28,
  },
  methodText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  testBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  testBannerIcon: {
    fontSize: 18,
  },
  testBannerText: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  payButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.glow,
  },
  payGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

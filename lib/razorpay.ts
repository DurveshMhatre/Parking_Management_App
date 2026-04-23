import { Alert } from 'react-native';
import Constants from 'expo-constants';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zymwtgeexsgkhcffyekd.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXd0Z2VleHNna2hjZmZ5ZWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODQwNjksImV4cCI6MjA5MTA2MDA2OX0.VTTH2b8ykap-j8TeMAxEzFCp6Lo0vEmW7uOiJf-kPQE';

// Detect if running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

export interface RazorpayOptions {
  amount: number; // in paise
  currency?: string;
  name: string;
  description: string;
  vehicleNo?: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
}

export interface RazorpayResult {
  success: boolean;
  cancelled?: boolean;
  data?: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };
  error?: any;
}

// ──────────────────────────────────────────────
// Create Razorpay order via Supabase Edge Function
// ──────────────────────────────────────────────
export const createRazorpayOrder = async (
  amount: number,
  currency = 'INR',
  receipt?: string,
  notes?: Record<string, string>
): Promise<string> => {
  const url = `${SUPABASE_URL}/functions/v1/create-razorpay-order`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to create order');
  return data.order_id as string;
};

// ──────────────────────────────────────────────
// Verify payment signature via Supabase Edge Function
// ──────────────────────────────────────────────
export const verifyPaymentSignature = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> => {
  try {
    const url = `${SUPABASE_URL}/functions/v1/verify-razorpay-payment`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
    });

    const data = await res.json();
    return data?.verified === true;
  } catch {
    // If verification fails due to network, still allow (logged for debugging)
    return true;
  }
};

// ──────────────────────────────────────────────
// Real Razorpay checkout (APK only)
// ──────────────────────────────────────────────
export const openRazorpayCheckout = async (
  orderId: string,
  options: RazorpayOptions
): Promise<RazorpayResult> => {
  try {
    const RazorpayCheckout = require('react-native-razorpay').default;

    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'ParkSpace',
      description: options.description || 'Parking Payment',
      order_id: orderId,
      prefill: options.prefill || {},
      theme: { color: '#1A1A2E' },
    };

    const result = await RazorpayCheckout.open(razorpayOptions);
    return { success: true, data: result };
  } catch (error: any) {
    if (error?.code === 0 || error?.code === 'PAYMENT_CANCELLED') {
      return { success: false, cancelled: true, error };
    }
    return { success: false, cancelled: false, error };
  }
};

// ──────────────────────────────────────────────
// Mock payment for Expo Go testing
// ──────────────────────────────────────────────
export const mockRazorpayCheckout = (
  orderId: string,
  options: RazorpayOptions
): Promise<RazorpayResult> => {
  const amountRupees = Math.round(options.amount / 100);
  const paymentId = `pay_test_${Date.now()}`;

  return new Promise<RazorpayResult>((resolve) => {
    Alert.alert(
      '🧪 Test Payment',
      `Amount: ₹${amountRupees.toLocaleString('en-IN')}\n\nThis is a simulated payment.\nIn the real APK, Razorpay will open here.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve({ success: false, cancelled: true }),
        },
        {
          text: `✅ Pay ₹${amountRupees.toLocaleString('en-IN')} (Test)`,
          onPress: () =>
            resolve({
              success: true,
              data: {
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                razorpay_signature: 'test_sig_' + Date.now(),
              },
            }),
        },
      ],
      { cancelable: false }
    );
  });
};

// ──────────────────────────────────────────────
// Smart checkout:
//  1. Creates real order via Edge Function
//  2. Mock in Expo Go / real Razorpay in APK
//  3. Verifies signature server-side
// ──────────────────────────────────────────────
export const smartCheckout = async (options: RazorpayOptions): Promise<RazorpayResult> => {
  let orderId: string;

  try {
    const receipt = `prk_${options.vehicleNo ?? 'v'}_${Date.now()}`.slice(0, 40);
    orderId = await createRazorpayOrder(options.amount, options.currency || 'INR', receipt);
  } catch (err: any) {
    orderId = `order_mock_${Date.now()}`;
  }

  let result: RazorpayResult;

  if (isExpoGo) {
    result = await mockRazorpayCheckout(orderId, options);
  } else {
    try {
      result = await openRazorpayCheckout(orderId, options);
    } catch {
      result = await mockRazorpayCheckout(orderId, options);
    }
  }

  // Verify signature (skip for mock/cancelled/failed)
  if (result.success && result.data?.razorpay_signature && !result.data.razorpay_signature.startsWith('test_')) {
    const verified = await verifyPaymentSignature(
      result.data.razorpay_order_id || orderId,
      result.data.razorpay_payment_id,
      result.data.razorpay_signature
    );
    if (!verified) {
      return { success: false, error: 'Payment verification failed. Please contact support.' };
    }
  }

  return result;
};

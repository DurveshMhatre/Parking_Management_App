import { Alert } from 'react-native';
import Constants from 'expo-constants';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SaGS0yWW91NFkD';

// Detect if running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

export interface RazorpayOptions {
  orderId: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
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

// Real Razorpay checkout (only works in APK builds)
export const openRazorpayCheckout = async (options: RazorpayOptions): Promise<RazorpayResult> => {
  try {
    const RazorpayCheckout = require('react-native-razorpay').default;

    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'Durvesh Parking',
      description: options.description || 'Parking Payment',
      order_id: options.orderId,
      prefill: options.prefill || {},
      theme: { color: '#6C63FF' },
    };

    const result = await RazorpayCheckout.open(razorpayOptions);
    return { success: true, data: result };
  } catch (error: any) {
    if (error?.code === 'PAYMENT_CANCELLED') {
      return { success: false, cancelled: true, error };
    }
    return { success: false, cancelled: false, error };
  }
};

// Mock payment for Expo Go testing
export const mockRazorpayCheckout = (options: RazorpayOptions): Promise<RazorpayResult> => {
  const amountRupees = Math.round(options.amount / 100);
  const paymentId = `pay_test_${Date.now()}`;

  return new Promise<RazorpayResult>((resolve) => {
    Alert.alert(
      '🧪 Test Payment',
      `Amount: ₹${amountRupees}\n\nThis is a simulated payment.\nIn the real APK, Razorpay will open here.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            resolve({ success: false, cancelled: true });
          },
        },
        {
          text: '✅ Pay ₹' + amountRupees + ' (Test)',
          onPress: () => {
            resolve({
              success: true,
              data: {
                razorpay_payment_id: paymentId,
                razorpay_order_id: options.orderId,
                razorpay_signature: 'test_sig_' + Date.now(),
              },
            });
          },
        },
      ],
      { cancelable: false }
    );
  });
};

// Smart checkout — always uses mock in Expo Go, real Razorpay in APK
export const smartCheckout = async (options: RazorpayOptions): Promise<RazorpayResult> => {
  // In Expo Go, native modules are NOT available — always use mock
  if (isExpoGo) {
    console.log('[Payment] Running in Expo Go — using mock payment');
    return mockRazorpayCheckout(options);
  }

  // In APK/dev build, try real Razorpay
  try {
    return await openRazorpayCheckout(options);
  } catch (e) {
    console.log('[Payment] Razorpay failed, falling back to mock:', e);
    return mockRazorpayCheckout(options);
  }
};

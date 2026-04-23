// ParkSpace — Centralized Pricing Table (Patch V3)
// All prices are fixed — never calculate amounts on the fly

export type VehicleType = 'car' | 'bike' | 'rickshaw';

export type DurationKey =
  | '3hr' | '6hr' | '9hr' | '12hr' | '24hr'
  | 'weekly' | 'monthly' | 'custom';

export const CUSTOM_DURATION_KEY = 'custom' as const;

export interface PricingSlot {
  label: string;
  durationKey: DurationKey;
  displayDuration: string;
  price: number;          // in INR (full rupees)
  priceInPaise: number;   // price × 100, for Razorpay
  savingLabel?: string;
  badge?: string;
  isPackage: boolean;
}

export const PRICING: Record<VehicleType, PricingSlot[]> = {
  car: [
    { label: '3 Hours',  durationKey: '3hr',     displayDuration: '3 hrs',   price: 180,   priceInPaise: 18000,   isPackage: false },
    { label: '6 Hours',  durationKey: '6hr',     displayDuration: '6 hrs',   price: 249,   priceInPaise: 24900,   savingLabel: 'Save ₹111',    isPackage: false },
    { label: '9 Hours',  durationKey: '9hr',     displayDuration: '9 hrs',   price: 199,   priceInPaise: 19900,   savingLabel: 'Save ₹341',    isPackage: false },
    { label: '12 Hours', durationKey: '12hr',    displayDuration: '12 hrs',  price: 399,   priceInPaise: 39900,   savingLabel: 'Save ₹321',    isPackage: false },
    { label: '24 Hours', durationKey: '24hr',    displayDuration: '24 hrs',  price: 1199,  priceInPaise: 119900,  badge: '20% off',            isPackage: false },
    { label: 'Weekly',   durationKey: 'weekly',  displayDuration: '7 Days',  price: 3000,  priceInPaise: 300000,  badge: 'Limited Offer', isPackage: true  },
    { label: 'Monthly',  durationKey: 'monthly', displayDuration: '30 Days', price: 10000, priceInPaise: 1000000, badge: 'Limited Offer', isPackage: true  },
  ],
  bike: [
    { label: '3 Hours',  durationKey: '3hr',     displayDuration: '3 hrs',   price: 120,   priceInPaise: 12000,   isPackage: false },
    { label: '6 Hours',  durationKey: '6hr',     displayDuration: '6 hrs',   price: 149,   priceInPaise: 14900,   savingLabel: 'Save ₹91',     isPackage: false },
    { label: '9 Hours',  durationKey: '9hr',     displayDuration: '9 hrs',   price: 129,   priceInPaise: 12900,   savingLabel: 'Save ₹231',    isPackage: false },
    { label: '12 Hours', durationKey: '12hr',    displayDuration: '12 hrs',  price: 249,   priceInPaise: 24900,   savingLabel: 'Save ₹231',    isPackage: false },
    { label: '24 Hours', durationKey: '24hr',    displayDuration: '24 hrs',  price: 799,   priceInPaise: 79900,   badge: '17% off',            isPackage: false },
    { label: 'Weekly',   durationKey: 'weekly',  displayDuration: '7 Days',  price: 1000,  priceInPaise: 100000,  badge: 'Limited Offer', isPackage: true  },
    { label: 'Monthly',  durationKey: 'monthly', displayDuration: '30 Days', price: 5000,  priceInPaise: 500000,  badge: 'Limited Offer', isPackage: true  },
  ],
  rickshaw: [
    { label: '3 Hours',  durationKey: '3hr',     displayDuration: '3 hrs',   price: 150,   priceInPaise: 15000,   isPackage: false },
    { label: '6 Hours',  durationKey: '6hr',     displayDuration: '6 hrs',   price: 199,   priceInPaise: 19900,   savingLabel: 'Save ₹101',    isPackage: false },
    { label: '9 Hours',  durationKey: '9hr',     displayDuration: '9 hrs',   price: 150,   priceInPaise: 15000,   savingLabel: 'Save ₹300',    isPackage: false },
    { label: '12 Hours', durationKey: '12hr',    displayDuration: '12 hrs',  price: 499,   priceInPaise: 49900,   savingLabel: 'Save ₹101',    isPackage: false },
    { label: '24 Hours', durationKey: '24hr',    displayDuration: '24 hrs',  price: 999,   priceInPaise: 99900,   badge: '17% off',            isPackage: false },
    { label: 'Weekly',   durationKey: 'weekly',  displayDuration: '7 Days',  price: 500,   priceInPaise: 50000,   badge: 'Limited Offer', isPackage: true  },
    { label: 'Monthly',  durationKey: 'monthly', displayDuration: '30 Days', price: 3000,  priceInPaise: 300000,  badge: 'Limited Offer', isPackage: true  },
  ],
};

export const VEHICLE_META: Record<VehicleType, { icon: string; label: string; color: string; hourlyRate: number }> = {
  car:      { icon: '🚗', label: 'Car',      color: '#2563EB', hourlyRate: 60 },
  bike:     { icon: '🏍️', label: 'Bike',     color: '#16A34A', hourlyRate: 40 },
  rickshaw: { icon: '🛺', label: 'Rickshaw', color: '#D97706', hourlyRate: 50 },
};

// Helper: format price in Indian style
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Duration in minutes for each slot (used when storing parking sessions)
export const DURATION_MINUTES: Record<DurationKey, number> = {
  '3hr':    180,
  '6hr':    360,
  '9hr':    540,
  '12hr':   720,
  '24hr':   1440,
  'weekly': 10080,   // 7 × 24 × 60
  'monthly': 43200,  // 30 × 24 × 60
  'custom': 0,       // calculated dynamically
};

// ──────────────────────────────────────────────
// Custom Hour Pricing
// ──────────────────────────────────────────────
export function calculateCustomPrice(vehicleType: VehicleType, hours: number) {
  const rate  = VEHICLE_META[vehicleType].hourlyRate;
  const price = Math.ceil(hours) * rate;
  return { price, priceInPaise: price * 100, label: `${hours} Hour${hours !== 1 ? 's' : ''}` };
}

// ──────────────────────────────────────────────
// Overstay Penalty Constants
// ──────────────────────────────────────────────
export const PENALTY_RATE_PER_HOUR = 20;    // ₹20/hr — all vehicle types
export const PENALTY_GRACE_MINUTES = 10;    // 10-min grace — no action in this window

// Warning schedule (minutes after grace period ends):
export const WARNING_SCHEDULE = {
  push1:    0,   // immediately after grace (10 min post-expiry)
  push2:    20,  // 30 min post-expiry
  push3:    40,  // 50 min post-expiry
  push4:    60,  // 70 min post-expiry
  whatsapp: 70,  // 80 min post-expiry — final WhatsApp warning
  debit:    75,  // 85 min post-expiry — auto-debit fires
};

export function calculatePenalty(overstayMinutes: number): {
  billableMinutes: number;
  hours:           number;
  amount:          number;
  amountInPaise:   number;
} {
  const billable = Math.max(0, overstayMinutes - PENALTY_GRACE_MINUTES);
  if (billable <= 0) return { billableMinutes: 0, hours: 0, amount: 0, amountInPaise: 0 };

  const hours  = Math.ceil(billable / 60);
  const amount = hours * PENALTY_RATE_PER_HOUR;
  return { billableMinutes: billable, hours, amount, amountInPaise: amount * 100 };
}

// ──────────────────────────────────────────────
// Commission Rates (Partner System)
// ──────────────────────────────────────────────
export const COMMISSION_RATES: Record<string, number> = {
  '3hr':    18,
  '6hr':    18,
  '9hr':    18,
  '12hr':   15,
  '24hr':   15,
  'weekly': 20,
  'monthly':25,
  'custom': 18,
};

export function getCommissionRate(durationKey: string): number {
  return COMMISSION_RATES[durationKey] ?? 8;
}

export function calculateCommission(saleAmount: number, rate: number): number {
  return parseFloat(((saleAmount * rate) / 100).toFixed(2));
}

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { generateTicketCode, calculateFee } from '../lib/utils';

export interface VehicleType {
  id: number;
  name: string;
  icon: string;
  total_slots: number;
  hourly_rate: number;
}

export interface ParkingSession {
  id: string;
  vehicle_no: string;
  vehicle_type_id: number;
  vehicle_type?: VehicleType;
  phone: string | null;
  user_id: string | null;
  entry_time: string;
  exit_time: string | null;
  duration_mins: number | null;
  amount_paid: number;
  payment_id: string | null;
  ticket_code: string;
  status: 'active' | 'completed' | 'cancelled' | 'overstay';
  created_at: string;
  // Patch V3 columns
  customer_phone?: string | null;
  referral_code?: string | null;
  partner_id?: string | null;
  commission_id?: string | null;
  duration_key?: string | null;
  custom_hours?: number | null;
  expiry_time?: string | null;
  razorpay_mandate_id?: string | null;
  mandate_status?: string | null;
  overstay_start?: string | null;
  overstay_minutes?: number;
  overstay_hours?: number;
  penalty_amount?: number;
  penalty_deducted?: boolean;
  penalty_payment_id?: string | null;
  penalty_deducted_at?: string | null;
  push_warning_count?: number;
  whatsapp_warning_sent?: boolean;
  whatsapp_receipt_sent?: boolean;
  expo_push_token?: string | null;
}

interface ParkingConfig {
  id: number;
  lot_name: string;
  hourly_rate: number;
  open_time: string;
  close_time: string;
  currency: string;
  is_active: boolean;
}

interface SlotAvailability {
  [vehicleTypeId: number]: {
    total: number;
    used: number;
    available: number;
  };
}

interface ParkingState {
  vehicleTypes: VehicleType[];
  config: ParkingConfig | null;
  activeSessions: ParkingSession[];
  allSessions: ParkingSession[];
  currentSession: ParkingSession | null;
  slotAvailability: SlotAvailability;
  isLoading: boolean;

  // Actions
  fetchVehicleTypes: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  fetchActiveSessions: () => Promise<void>;
  fetchAllSessions: () => Promise<void>;
  fetchSlotAvailability: () => Promise<void>;
  fetchUserActiveSessions: (userId: string) => Promise<void>;
  createSession: (params: {
    vehicleNo: string;
    vehicleTypeId: number;
    durationMins: number;
    amount: number;
    paymentId: string;
    userId?: string;
    durationKey?: string;
    customHours?: number;
    referralCode?: string;
    partnerId?: string;
    customerPhone?: string;
  }) => Promise<ParkingSession | null>;
  checkoutSession: (sessionId: string) => Promise<ParkingSession | null>;
  checkoutByTicketCode: (ticketCode: string) => Promise<ParkingSession | null>;
  setCurrentSession: (session: ParkingSession | null) => void;
}

export const useParkingStore = create<ParkingState>((set, get) => ({
  vehicleTypes: [],
  config: null,
  activeSessions: [],
  allSessions: [],
  currentSession: null,
  slotAvailability: {},
  isLoading: false,

  fetchVehicleTypes: async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('id');
      
      if (!error && data) {
        set({ vehicleTypes: data });
      }
    } catch (e) {
      console.error('Error fetching vehicle types:', e);
      // Fallback to local config
      set({
        vehicleTypes: [
          { id: 1, name: 'Car', icon: '🚗', total_slots: 2, hourly_rate: 100 },
          { id: 2, name: 'Bike', icon: '🏍️', total_slots: 5, hourly_rate: 50 },
          { id: 3, name: 'Rickshaw', icon: '🛺', total_slots: 2, hourly_rate: 30 },
        ],
      });
    }
  },

  fetchConfig: async () => {
    try {
      const { data, error } = await supabase
        .from('parking_config')
        .select('*')
        .single();
      
      if (!error && data) {
        set({ config: data });
      }
    } catch (e) {
      console.error('Error fetching config:', e);
      set({
        config: {
          id: 1,
          lot_name: 'Durvesh Parking',
          hourly_rate: 20,
          open_time: '10:00',
          close_time: '20:00',
          currency: 'INR',
          is_active: true,
        },
      });
    }
  },

  fetchActiveSessions: async () => {
    try {
      const { data, error } = await supabase
        .from('parking_sessions')
        .select('*, vehicle_type:vehicle_types(*)')
        .eq('status', 'active')
        .order('entry_time', { ascending: false });
      
      if (!error && data) {
        set({ activeSessions: data });
      }
    } catch (e) {
      console.error('Error fetching active sessions:', e);
    }
  },

  fetchAllSessions: async () => {
    try {
      const { data, error } = await supabase
        .from('parking_sessions')
        .select('*, vehicle_type:vehicle_types(*)')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!error && data) {
        set({ allSessions: data });
      }
    } catch (e) {
      console.error('Error fetching all sessions:', e);
    }
  },

  fetchSlotAvailability: async () => {
    const { vehicleTypes } = get();
    const availability: SlotAvailability = {};

    for (const vt of vehicleTypes) {
      try {
        const { count } = await supabase
          .from('parking_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('vehicle_type_id', vt.id)
          .eq('status', 'active');

        availability[vt.id] = {
          total: vt.total_slots,
          used: count || 0,
          available: vt.total_slots - (count || 0),
        };
      } catch {
        availability[vt.id] = {
          total: vt.total_slots,
          used: 0,
          available: vt.total_slots,
        };
      }
    }
    set({ slotAvailability: availability });
  },

  fetchUserActiveSessions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('parking_sessions')
        .select('*, vehicle_type:vehicle_types(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('entry_time', { ascending: false });
      
      if (!error && data && data.length > 0) {
        set({ currentSession: data[0] });
      }
    } catch (e) {
      console.error('Error fetching user sessions:', e);
    }
  },

  createSession: async ({ vehicleNo, vehicleTypeId, durationMins, amount, paymentId, userId, durationKey, customHours, referralCode, partnerId, customerPhone }) => {
    try {
      const ticketCode = generateTicketCode();
      const expiryTime = new Date(Date.now() + durationMins * 60000).toISOString();
      
      const { data, error } = await supabase
        .from('parking_sessions')
        .insert({
          vehicle_no: vehicleNo,
          vehicle_type_id: vehicleTypeId,
          duration_mins: durationMins,
          amount_paid: amount,
          payment_id: paymentId,
          ticket_code: ticketCode,
          user_id: userId || null,
          status: 'active',
          duration_key: durationKey || null,
          custom_hours: customHours || null,
          referral_code: referralCode || null,
          partner_id: partnerId || null,
          customer_phone: customerPhone || null,
          expiry_time: expiryTime,
        })
        .select('*, vehicle_type:vehicle_types(*)')
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      set({ currentSession: data });
      // Refresh availability
      await get().fetchSlotAvailability();
      await get().fetchActiveSessions();
      return data;
    } catch (e) {
      console.error('Error creating session:', e);
      return null;
    }
  },

  checkoutSession: async (sessionId) => {
    try {
      const exitTime = new Date().toISOString();
      
      // Get the session first
      const { data: session } = await supabase
        .from('parking_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) return null;

      const entryTime = new Date(session.entry_time);
      const actualDuration = Math.ceil((new Date(exitTime).getTime() - entryTime.getTime()) / 60000);

      const { data, error } = await supabase
        .from('parking_sessions')
        .update({
          exit_time: exitTime,
          duration_mins: actualDuration,
          status: 'completed',
        })
        .eq('id', sessionId)
        .select('*, vehicle_type:vehicle_types(*)')
        .single();

      if (error) {
        console.error('Checkout error:', error);
        return null;
      }

      set({ currentSession: null });
      await get().fetchSlotAvailability();
      await get().fetchActiveSessions();
      return data;
    } catch (e) {
      console.error('Checkout error:', e);
      return null;
    }
  },

  checkoutByTicketCode: async (ticketCode) => {
    try {
      const { data: session } = await supabase
        .from('parking_sessions')
        .select('*')
        .eq('ticket_code', ticketCode)
        .eq('status', 'active')
        .single();

      if (!session) return null;
      return get().checkoutSession(session.id);
    } catch (e) {
      console.error('Checkout by ticket error:', e);
      return null;
    }
  },

  setCurrentSession: (session) => set({ currentSession: session }),
}));

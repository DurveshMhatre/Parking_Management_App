import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'owner' | 'partner';
  created_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInAsGuest: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  setRole: (role: 'customer' | 'owner' | 'partner') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isGuest: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ session, user: session.user, isGuest: session.user.is_anonymous || false });
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth init error:', error);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ 
        session, 
        user: session?.user || null,
        isGuest: session?.user?.is_anonymous || false,
      });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };

      // Create user profile
      if (data.user) {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role: 'customer',
        });
      }
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  },

  signInAsGuest: async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) return { error: error.message };
      set({ isGuest: true });
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, isGuest: false });
  },

  fetchProfile: async (userId) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        set({ profile: data as UserProfile });
      }
    } catch {
      // Profile might not exist for guest users
    }
  },

  setRole: (role) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, role } : null,
    }));
  },
}));

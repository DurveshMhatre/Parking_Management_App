import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useParkingStore } from '../../store/parkingStore';
import SlotAvailabilityCard from '../../components/SlotAvailabilityCard';
import ActiveSessionCard from '../../components/ActiveSessionCard';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { getGreeting } from '../../lib/utils';

const vehicleColors: { [key: string]: string } = {
  Car: Colors.car,
  Bike: Colors.bike,
  Rickshaw: Colors.rickshaw,
};

export default function HomeScreen() {
  const { user, profile, isGuest, session } = useAuthStore();
  const {
    vehicleTypes,
    slotAvailability,
    currentSession,
    config,
    fetchVehicleTypes,
    fetchSlotAvailability,
    fetchUserActiveSessions,
  } = useParkingStore();
  const [refreshing, setRefreshing] = React.useState(false);



  const loadData = async () => {
    await fetchVehicleTypes();
    await fetchSlotAvailability();
    if (user?.id) {
      await fetchUserActiveSessions(user.id);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // If not logged in at all, redirect to auth
  useEffect(() => {
    if (!session && !isGuest) {
      // Give time for initialization
      const timer = setTimeout(() => {
        const authState = useAuthStore.getState();
        if (!authState.session && !authState.isLoading) {
          router.replace('/(auth)/login');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const greeting = getGreeting();
  const displayName = profile?.full_name || (isGuest ? 'Guest' : 'User');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        {profile?.role === 'owner' && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/(admin)/dashboard')}
          >
            <Text style={styles.adminButtonText}>🔧 Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Parking Status Banner */}
      <LinearGradient
        colors={['#1a3a2a', '#0F0F1A'] as any}
        style={styles.statusBanner}
      >
        <View style={styles.statusDot}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.lotName}>🅿️ Durvesh Parking</Text>
          <Text style={[styles.statusText, { color: Colors.success }]}>
            OPEN 24/7
          </Text>
          <Text style={styles.hours}>
            Always Open
          </Text>
        </View>
        <Text style={styles.rateTag}>₹{vehicleTypes[0]?.hourly_rate || 20}/hr</Text>
      </LinearGradient>

      {/* Active Session */}
      {currentSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Active Parking</Text>
          <ActiveSessionCard
            session={currentSession}
            onPress={() => router.push('/(tabs)/active')}
            compact
          />
        </View>
      )}

      {/* Slot Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Slot Availability</Text>
        <View style={styles.slotsGrid}>
          {vehicleTypes.map((vt) => {
            const avail = slotAvailability[vt.id];
            return (
              <SlotAvailabilityCard
                key={vt.id}
                icon={vt.icon}
                name={vt.name}
                available={avail?.available ?? vt.total_slots}
                total={avail?.total ?? vt.total_slots}
                color={vehicleColors[vt.name] || Colors.primary}
              />
            );
          })}
        </View>
      </View>

      {/* Park Vehicle Button */}
      <TouchableOpacity
        style={styles.parkButton}
        onPress={() => router.push('/entry')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.parkGradient}
        >
          <Text style={styles.parkButtonIcon}>🅿️</Text>
          <Text style={styles.parkButtonText}>Park My Vehicle</Text>
          <Text style={styles.parkButtonArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Info */}
      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💳</Text>
          <Text style={styles.infoTitle}>Digital Payment</Text>
          <Text style={styles.infoDesc}>UPI, Cards, Wallets</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🎫</Text>
          <Text style={styles.infoTitle}>QR Ticket</Text>
          <Text style={styles.infoDesc}>Instant digital ticket</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoTitle}>Secure</Text>
          <Text style={styles.infoDesc}>Verified payments</Text>
        </View>
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
    paddingTop: Spacing.xxl + Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  adminButton: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  adminButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statusBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    marginRight: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusInfo: {
    flex: 1,
  },
  lotName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  hours: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  rateTag: {
    backgroundColor: Colors.primary + '20',
    color: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    overflow: 'hidden',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  parkButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.glow,
  },
  parkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  parkButtonIcon: {
    fontSize: 24,
  },
  parkButtonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  parkButtonArrow: {
    fontSize: FontSize.xl,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  infoCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  infoTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: FontSize.xs - 1,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

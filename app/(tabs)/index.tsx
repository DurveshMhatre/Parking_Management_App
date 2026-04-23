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
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { getGreeting } from '../../lib/utils';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
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

  const vehicleColors: { [key: string]: string } = {
    Car: colors.car,
    Bike: colors.bike,
    Rickshaw: colors.rickshaw,
  };

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
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting} 👋</Text>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
        </View>
        {profile?.role === 'owner' && (
          <TouchableOpacity
            style={[styles.adminButton, {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.accent + '40',
            }]}
            onPress={() => router.push('/(admin)/dashboard')}
          >
            <Text style={[styles.adminButtonText, { color: colors.accent }]}>🔧 Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Parking Status Banner */}
      <LinearGradient
        colors={isDark ? ['#1a3a2a', '#0F0F1A'] as any : ['#E8F5E9', '#F4F6FA'] as any}
        style={[styles.statusBanner, { borderColor: colors.border }]}
      >
        <View style={styles.statusDot}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
        </View>
        <View style={styles.statusInfo}>
          <Text style={[styles.lotName, { color: colors.textPrimary }]}>🅿️ Durvesh Parking</Text>
          <Text style={[styles.statusText, { color: colors.success }]}>
            OPEN 24/7
          </Text>
          <Text style={[styles.hours, { color: colors.textMuted }]}>
            Always Open
          </Text>
        </View>
        <Text style={[styles.rateTag, {
          backgroundColor: colors.accent + '20',
          color: colors.accent,
        }]}>₹{vehicleTypes[0]?.hourly_rate || 20}/hr</Text>
      </LinearGradient>

      {/* Active Session */}
      {currentSession && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🟢 Active Parking</Text>
          <ActiveSessionCard
            session={currentSession}
            onPress={() => router.push('/(tabs)/active')}
            compact
          />
        </View>
      )}

      {/* Slot Availability */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📊 Slot Availability</Text>
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
                color={vehicleColors[vt.name] || colors.accent}
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
          colors={colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.parkGradient}
        >
          <Text style={styles.parkButtonIcon}>🅿️</Text>
          <Text style={styles.parkButtonText}>Park My Vehicle</Text>
          <Text style={styles.parkButtonArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Partner Program */}
      {!isGuest && session && profile?.role !== 'owner' && (
        <TouchableOpacity
          style={[styles.partnerBanner, { backgroundColor: colors.bgCard, borderColor: colors.accent + '40' }]}
          onPress={() => router.push(profile?.role === 'partner' ? '/partner-dashboard' : '/partner-register')}
        >
          <View style={styles.partnerBannerContent}>
            <Text style={styles.partnerBannerIcon}>🤝</Text>
            <View style={{ flex: 1, paddingHorizontal: Spacing.sm }}>
              <Text style={[styles.partnerBannerTitle, { color: colors.textPrimary }]}>
                {profile?.role === 'partner' ? 'Partner Dashboard' : 'Earn with ParkSpace'}
              </Text>
              <Text style={[styles.partnerBannerDesc, { color: colors.textSecondary }]}>
                {profile?.role === 'partner' 
                  ? 'Track your sales and commissions' 
                  : 'Join our partner program and earn on every referral'}
              </Text>
            </View>
            <Text style={[styles.partnerBannerArrow, { color: colors.accent }]}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Info */}
      <View style={styles.infoCards}>
        <View style={[styles.infoCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }]}>
          <Text style={styles.infoIcon}>💳</Text>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Digital Payment</Text>
          <Text style={[styles.infoDesc, { color: colors.textMuted }]}>UPI, Cards, Wallets</Text>
        </View>
        <View style={[styles.infoCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }]}>
          <Text style={styles.infoIcon}>🎫</Text>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>QR Ticket</Text>
          <Text style={[styles.infoDesc, { color: colors.textMuted }]}>Instant digital ticket</Text>
        </View>
        <View style={[styles.infoCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }]}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Secure</Text>
          <Text style={[styles.infoDesc, { color: colors.textMuted }]}>Verified payments</Text>
        </View>
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    marginTop: 2,
  },
  adminButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  adminButtonText: {
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
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  hours: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  rateTag: {
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
  partnerBanner: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  partnerBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerBannerIcon: {
    fontSize: 28,
  },
  partnerBannerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  partnerBannerDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  partnerBannerArrow: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  infoCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  infoTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: FontSize.xs - 1,
    textAlign: 'center',
  },
});

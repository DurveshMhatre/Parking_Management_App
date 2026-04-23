import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useParkingStore } from '../../store/parkingStore';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';

export default function AdminDashboard() {
  const {
    activeSessions,
    allSessions,
    vehicleTypes,
    slotAvailability,
    fetchActiveSessions,
    fetchAllSessions,
    fetchSlotAvailability,
  } = useParkingStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchActiveSessions();
      fetchAllSessions();
      fetchSlotAvailability();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchActiveSessions(), fetchAllSessions(), fetchSlotAvailability()]);
    setRefreshing(false);
  };

  const today = new Date().toDateString();
  const todaySessions = allSessions.filter(
    (s) => new Date(s.created_at).toDateString() === today
  );
  const todayRevenue = todaySessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount_paid || 0), 0);

  const totalSlots = vehicleTypes.reduce((sum, vt) => sum + vt.total_slots, 0);
  const usedSlots = Object.values(slotAvailability).reduce((sum, a) => sum + a.used, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
          <Text style={styles.statValue}>{activeSessions.length}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
          <Text style={[styles.statValue, { color: Colors.success }]}>₹{todayRevenue}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.accent }]}>
          <Text style={styles.statValue}>{todaySessions.length}</Text>
          <Text style={styles.statLabel}>Today's Entries</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.warning }]}>
          <Text style={styles.statValue}>{usedSlots}/{totalSlots}</Text>
          <Text style={styles.statLabel}>Slots Used</Text>
        </View>
      </View>

      {/* Slot Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Slot Breakdown</Text>
        {vehicleTypes.map((vt) => {
          const avail = slotAvailability[vt.id];
          const used = avail?.used || 0;
          const total = avail?.total || vt.total_slots;
          const pct = total > 0 ? (used / total) * 100 : 0;

          return (
            <View key={vt.id} style={styles.slotRow}>
              <Text style={styles.slotIcon}>{vt.icon}</Text>
              <Text style={styles.slotName}>{vt.name}</Text>
              <View style={styles.slotBarBg}>
                <View
                  style={[
                    styles.slotBarFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? Colors.error : Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.slotCount}>{used}/{total}</Text>
            </View>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/scan')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>Scan QR{'\n'}Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/sessions')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>All{'\n'}Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/settings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Parking{'\n'}Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.actionIcon}>🏠</Text>
            <Text style={styles.actionText}>Customer{'\n'}View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Colors.accent + '60' }]}
            onPress={() => router.push('/(admin)/manage-partners')}
          >
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={styles.actionText}>Manage{'\n'}Partners</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: Colors.error + '60' }]}
            onPress={() => {/* Navigate to penalties list — future enhancement */}}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionText}>Penalty{'\n'}History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Vehicles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Vehicles ({activeSessions.length})</Text>
        {activeSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active vehicles right now</Text>
          </View>
        ) : (
          activeSessions.slice(0, 5).map((session) => (
            <View key={session.id} style={styles.vehicleCard}>
              <Text style={styles.vehicleIcon}>
                {(session.vehicle_type as any)?.icon || '🚗'}
              </Text>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleNo}>{session.vehicle_no}</Text>
                <Text style={styles.vehicleTime}>
                  Entry: {new Date(session.entry_time).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.vehicleAmount}>₹{session.amount_paid}</Text>
            </View>
          ))
        )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
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
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  slotIcon: {
    fontSize: 20,
  },
  slotName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    width: 70,
  },
  slotBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  slotBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  slotCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    width: 35,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNo: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  vehicleTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vehicleAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
});

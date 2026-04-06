import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useParkingStore, ParkingSession } from '../../store/parkingStore';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { formatDateTime, formatDuration } from '../../lib/utils';

type FilterType = 'all' | 'active' | 'completed';

export default function SessionsScreen() {
  const { allSessions, fetchAllSessions, checkoutSession } = useParkingStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAllSessions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllSessions();
    setRefreshing(false);
  };

  const filteredSessions = allSessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleForceCheckout = (session: ParkingSession) => {
    Alert.alert(
      'Force Checkout',
      `Vehicle: ${session.vehicle_no}\nTicket: ${session.ticket_code}\n\nAre you sure you want to force checkout this vehicle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          style: 'destructive',
          onPress: async () => {
            await checkoutSession(session.id);
            fetchAllSessions();
          },
        },
      ]
    );
  };

  const renderSession = ({ item }: { item: ParkingSession }) => {
    const isActive = item.status === 'active';
    const vt = item.vehicle_type as any;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionLeft}>
            <Text style={styles.sessionIcon}>{vt?.icon || '🚗'}</Text>
            <View>
              <Text style={styles.sessionVehicle}>{item.vehicle_no}</Text>
              <Text style={styles.sessionTime}>{formatDateTime(item.entry_time)}</Text>
            </View>
          </View>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeCompleted]}>
            <Text style={[styles.badgeText, { color: isActive ? Colors.success : Colors.primary }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.sessionMeta}>
          <Text style={styles.meta}>💰 ₹{item.amount_paid}</Text>
          <Text style={styles.meta}>🎫 {item.ticket_code}</Text>
          {item.duration_mins && <Text style={styles.meta}>⏱ {formatDuration(item.duration_mins)}</Text>}
        </View>

        {isActive && (
          <TouchableOpacity
            style={styles.forceCheckoutBtn}
            onPress={() => handleForceCheckout(item)}
          >
            <Text style={styles.forceCheckoutText}>Force Checkout</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? `All (${allSessions.length})` :
               f === 'active' ? `Active (${allSessions.filter(s => s.status === 'active').length})` :
               `Done (${allSessions.filter(s => s.status === 'completed').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionVehicle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sessionTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeActive: {
    backgroundColor: Colors.successLight,
  },
  badgeCompleted: {
    backgroundColor: Colors.primary + '20',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  forceCheckoutBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  forceCheckoutText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
  emptyState: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});

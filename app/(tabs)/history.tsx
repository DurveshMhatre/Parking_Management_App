import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useParkingStore, ParkingSession } from '../../store/parkingStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';
import { formatDateTime, formatDuration } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const [sessions, setSessions] = React.useState<ParkingSession[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('parking_sessions')
        .select('*, vehicle_type:vehicle_types(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) setSessions(data as ParkingSession[]);
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const totalSpent = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount_paid || 0), 0);

  const renderSession = ({ item }: { item: ParkingSession }) => {
    const vt = item.vehicle_type;
    const isActive = item.status === 'active';

    return (
      <View style={[styles.sessionCard, {
        backgroundColor: colors.bgSurface,
        borderColor: colors.border,
        ...(isDark ? Shadows.sm : {
          shadowColor: '#000000',
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }),
      }]}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionVehicle}>
            <Text style={styles.sessionIcon}>{vt?.icon || '🚗'}</Text>
            <View>
              <Text style={[styles.sessionVehicleNo, { color: colors.textPrimary }]}>{item.vehicle_no}</Text>
              <Text style={[styles.sessionType, { color: colors.textSecondary }]}>{vt?.name || 'Vehicle'}</Text>
            </View>
          </View>
          <View style={[
            styles.statusTag,
            { backgroundColor: isActive ? colors.successLight : colors.accent + '20' },
          ]}>
            <Text style={[
              styles.statusTagText,
              { color: isActive ? colors.success : colors.accent },
            ]}>
              {isActive ? 'Active' : 'Completed'}
            </Text>
          </View>
        </View>

        <View style={[styles.sessionDetails, { borderTopColor: colors.border }]}>
          <View style={styles.sessionDetail}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Entry</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDateTime(item.entry_time)}</Text>
          </View>
          {item.exit_time && (
            <View style={styles.sessionDetail}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Exit</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDateTime(item.exit_time)}</Text>
            </View>
          )}
          {item.duration_mins && (
            <View style={styles.sessionDetail}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Duration</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDuration(item.duration_mins)}</Text>
            </View>
          )}
          <View style={styles.sessionDetail}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: colors.success }]}>₹{item.amount_paid}</Text>
          </View>
        </View>

        <Text style={[styles.ticketCode, { color: colors.textMuted }]}>Ticket: {item.ticket_code}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Parking History</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{sessions.length} sessions</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{sessions.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Visits</Text>
        </View>
        <View style={[styles.statCard, {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>₹{totalSpent}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Spent</Text>
        </View>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No History Yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Your parking history will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  sessionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sessionVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sessionIcon: {
    fontSize: 28,
  },
  sessionVehicleNo: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  sessionType: {
    fontSize: FontSize.xs,
  },
  statusTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  sessionDetail: {},
  detailLabel: {
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  ticketCode: {
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  emptyDesc: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
});

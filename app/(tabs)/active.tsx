import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useParkingStore } from '../../store/parkingStore';
import ActiveSessionCard from '../../components/ActiveSessionCard';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { router } from 'expo-router';
import { notifyCheckoutComplete } from '../../lib/notifications';
import { formatDuration } from '../../lib/utils';
import { Alert } from 'react-native';

export default function ActiveScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { currentSession, activeSessions, fetchUserActiveSessions, fetchActiveSessions, checkoutSession } = useParkingStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchUserActiveSessions(user.id);
      }
      fetchActiveSessions();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) await fetchUserActiveSessions(user.id);
    await fetchActiveSessions();
    setRefreshing(false);
  };

  const handleCheckout = (sessionId: string, vehicleNo: string) => {
    Alert.alert(
      'Confirm Checkout',
      `Are you sure you want to checkout vehicle ${vehicleNo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: async () => {
            const result = await checkoutSession(sessionId);
            if (result) {
              await notifyCheckoutComplete(vehicleNo, formatDuration(result.duration_mins || 0));
              router.push('/checkout-confirm');
            } else {
              Alert.alert('Error', 'Failed to checkout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>Active Parking</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your current parking sessions</Text>

      {currentSession ? (
        <View style={styles.section}>
          <ActiveSessionCard
            session={currentSession}
            onCheckout={() => handleCheckout(currentSession.id, currentSession.vehicle_no)}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🅿️</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Active Parking</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            You don't have any active parking sessions.{'\n'}Tap "Park My Vehicle" on the home screen to get started.
          </Text>
        </View>
      )}
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
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});

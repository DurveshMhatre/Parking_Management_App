import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { getAllPartners, updatePartnerStatus } from '../../lib/partners';

export default function ManagePartnersScreen() {
  const [partners, setPartners] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPartners = async () => {
    try {
      const data = await getAllPartners();
      setPartners(data);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to fetch partners');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPartners();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartners();
    setRefreshing(false);
  };

  const handleApprove = async (partnerId: string, name: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updatePartnerStatus(partnerId, 'active');
      Alert.alert('Success', `${name} is now an active partner!`);
      fetchPartners();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = { 
      pending: Colors.warning, 
      active: Colors.success, 
      rejected: Colors.error 
    };
    return (
      <View style={{ backgroundColor: (statusColors[status] || Colors.textMuted) + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 }}>
        <Text style={{ fontSize: FontSize.xs, color: statusColors[status] || Colors.textMuted, fontWeight: FontWeight.semibold, textTransform: 'capitalize' }}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Partners</Text>
      </View>

      {partners.length === 0 && !refreshing ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No partners registered yet.</Text>
        </View>
      ) : (
        partners.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.partnerName}>{p.full_name}</Text>
                <Text style={styles.partnerCode}>Code: {p.referral_code}</Text>
              </View>
              <StatusBadge status={p.status} />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{p.phone}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{p.email}</Text>
            </View>
            
            {p.upi_id ? (
              <View style={styles.detailsRow}>
                <Text style={styles.label}>UPI:</Text>
                <Text style={styles.value}>{p.upi_id}</Text>
              </View>
            ) : null}

            {p.status === 'pending' && (
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(p.id, p.full_name)}
              >
                <Text style={styles.approveBtnText}>Approve & Activate</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
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
    paddingTop: Spacing.xxl + Spacing.sm,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  backBtn: {
    marginBottom: Spacing.sm,
  },
  backBtnText: {
    fontSize: FontSize.md,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  partnerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  partnerCode: {
    fontSize: FontSize.md,
    color: Colors.accent,
    fontFamily: 'monospace',
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  approveBtn: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  approveBtnText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});

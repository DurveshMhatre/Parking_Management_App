import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Clipboard,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { getPartnerProfile, getPartnerCommissions, getPartnerPayouts, requestPayout } from '../lib/partners';
import { formatPrice } from '../constants/pricing';

type TabKey = 'overview' | 'sales' | 'payouts' | 'profile';

export default function PartnerDashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [partner, setPartner] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const p = await getPartnerProfile(user.id);
      setPartner(p);
      if (p?.id) {
        const c = await getPartnerCommissions(p.id);
        setCommissions(c);
        const po = await getPartnerPayouts(p.id);
        setPayouts(po);
      }
    } catch {} finally { setIsLoading(false); }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleCopyCode = () => {
    if (partner?.referral_code) {
      Clipboard.setString(partner.referral_code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied!', `Referral code ${partner.referral_code} copied to clipboard.`);
    }
  };

  const handleShareCode = async () => {
    if (partner?.referral_code) {
      await Share.share({
        message: `Use my ParkSpace partner code ${partner.referral_code} when booking parking and get great deals! 🅿️`,
      });
    }
  };

  const handleRequestPayout = async () => {
    if (!partner || partner.pending_balance < 100) {
      Alert.alert('Minimum ₹100', 'You need at least ₹100 pending balance to request a payout.');
      return;
    }
    try {
      await requestPayout({
        partnerId: partner.id,
        amount: partner.pending_balance,
        method: partner.upi_id ? 'upi' : 'bank_transfer',
        upiId: partner.upi_id,
        bankAccountNo: partner.bank_account_no,
        bankIfsc: partner.bank_ifsc,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Payout Requested!', `₹${partner.pending_balance} payout has been submitted for processing.`);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (!partner && !isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🤝</Text>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: colors.textPrimary, marginBottom: Spacing.sm }}>Not a Partner Yet</Text>
        <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }}>
          Register to become a ParkSpace partner and earn commission
        </Text>
        <TouchableOpacity onPress={() => router.push('/partner-register')} style={{ backgroundColor: colors.accent, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md }}>
          <Text style={{ color: '#FFF', fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>Register Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = { pending: colors.warning, approved: colors.accent, paid: colors.success, rejected: colors.error, completed: colors.success, processing: colors.accent };
    return (
      <View style={{ backgroundColor: (statusColors[status] || colors.textMuted) + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 }}>
        <Text style={{ fontSize: FontSize.xs, color: statusColors[status] || colors.textMuted, fontWeight: FontWeight.semibold, textTransform: 'capitalize' }}>{status}</Text>
      </View>
    );
  };

  const TabButton = ({ tab, label }: { tab: TabKey; label: string }) => (
    <TouchableOpacity
      onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      style={{
        flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? colors.accent : 'transparent',
      }}
    >
      <Text style={{ fontSize: FontSize.sm, fontWeight: activeTab === tab ? FontWeight.bold : FontWeight.medium, color: activeTab === tab ? colors.accent : colors.textMuted }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const thisMonth = commissions.filter((c) => new Date(c.created_at).getMonth() === new Date().getMonth());
  const monthEarned = thisMonth.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgPrimary }} contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.xxl + Spacing.md }}>
      <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: colors.textPrimary, marginBottom: Spacing.lg }}>
        Partner Dashboard
      </Text>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: Spacing.lg }}>
        <TabButton tab="overview" label="Overview" />
        <TabButton tab="sales" label="Sales" />
        <TabButton tab="payouts" label="Payouts" />
        <TabButton tab="profile" label="Profile" />
      </View>

      {/* Overview */}
      {activeTab === 'overview' && partner && (
        <View>
          {/* Referral Code Card */}
          <View style={{ backgroundColor: colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: colors.accent + '40', marginBottom: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: Spacing.sm }}>Your Referral Code</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <Text style={{ fontSize: FontSize.xxl + 4, fontWeight: FontWeight.extrabold, color: colors.accent, letterSpacing: 3, fontFamily: 'monospace' }}>
                {partner.referral_code}
              </Text>
              <TouchableOpacity onPress={handleCopyCode} style={{ backgroundColor: colors.bgSurface, borderRadius: BorderRadius.md, padding: Spacing.sm }}>
                <Text style={{ fontSize: 16 }}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareCode} style={{ backgroundColor: colors.bgSurface, borderRadius: BorderRadius.md, padding: Spacing.sm }}>
                <Text style={{ fontSize: 16 }}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
            <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>💰 Pending</Text>
              <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: colors.accent, marginTop: 4 }}>
                {formatPrice(partner.pending_balance || 0)}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>📊 This Month</Text>
              <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: colors.textPrimary, marginTop: 4 }}>
                {formatPrice(monthEarned)}
              </Text>
              <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>{thisMonth.length} sales</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
            <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>📈 Total Earned</Text>
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.success, marginTop: 4 }}>{formatPrice(partner.total_earned || 0)}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>🏧 Withdrawn</Text>
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.textPrimary, marginTop: 4 }}>{formatPrice(partner.total_withdrawn || 0)}</Text>
            </View>
          </View>

          {/* Payout Button */}
          <TouchableOpacity
            onPress={handleRequestPayout}
            style={{ backgroundColor: colors.accent, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFF', fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>
              Request Payout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <View>
          {commissions.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: Spacing.xxl }}>No sales yet</Text>
          ) : (
            commissions.map((c) => (
              <View key={c.id} style={{ backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: colors.textPrimary }}>
                      {formatPrice(c.sale_amount)} sale
                    </Text>
                    <Text style={{ fontSize: FontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN')} · {c.commission_rate}% rate
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.success }}>
                      +{formatPrice(c.commission_amount)}
                    </Text>
                    <StatusBadge status={c.status} />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <View>
          <View style={{ backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: colors.accent + '40' }}>
            <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>Available for Payout</Text>
            <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: colors.accent }}>{formatPrice(partner?.pending_balance || 0)}</Text>
          </View>
          {payouts.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: Spacing.xl }}>No payout history</Text>
          ) : (
            payouts.map((p) => (
              <View key={p.id} style={{ backgroundColor: colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: colors.textPrimary }}>{formatPrice(p.amount)}</Text>
                    <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>{p.method === 'upi' ? '📱 UPI' : '🏦 Bank'} · {new Date(p.requested_at).toLocaleDateString('en-IN')}</Text>
                  </View>
                  <StatusBadge status={p.status} />
                </View>
                {p.rejection_reason && <Text style={{ fontSize: FontSize.xs, color: colors.error, marginTop: 4 }}>Reason: {p.rejection_reason}</Text>}
              </View>
            ))
          )}
        </View>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && partner && (
        <View>
          <View style={{ backgroundColor: colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: Spacing.lg }}>
            {[
              { label: 'Name', value: partner.full_name },
              { label: 'Phone', value: partner.phone },
              { label: 'Email', value: partner.email },
              { label: 'Referral Code', value: partner.referral_code },
              { label: 'Status', value: partner.status },
              { label: 'Commission Rate', value: `${partner.commission_rate}%` },
              { label: 'UPI ID', value: partner.upi_id || '—' },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>{row.label}</Text>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: colors.textPrimary }}>{row.value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => { signOut(); router.replace('/(auth)/login'); }}
            style={{ borderWidth: 1, borderColor: colors.error, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center' }}
          >
            <Text style={{ color: colors.error, fontWeight: FontWeight.bold, fontSize: FontSize.md }}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

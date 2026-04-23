import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Light',  value: 'light',  icon: '☀️' },
  { label: 'Dark',   value: 'dark',   icon: '🌙' },
  { label: 'System', value: 'system', icon: '📱' },
];

export default function ProfileScreen() {
  const { colors, mode, setMode, isDark } = useTheme();
  const { user, profile, isGuest, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSwitchToAdmin = () => {
    router.push('/(admin)/dashboard');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgPrimary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>

      {/* User Card */}
      <View style={[styles.userCard, {
        backgroundColor: colors.bgSurface,
        borderColor: colors.border,
        ...(isDark ? Shadows.md : {
          shadowColor: '#000000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }),
      }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent + '30' }]}>
          <Text style={[styles.avatarText, { color: colors.accent }]}>
            {isGuest ? '👤' : (profile?.full_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          {isGuest ? (
            <>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>Guest User</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>No account linked</Text>
            </>
          ) : (
            <>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile?.full_name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.roleText, { color: colors.accent }]}>
                  {profile?.role === 'owner' ? '👑 Owner' : '🚗 Customer'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* APPEARANCE — Theme Selector (Change 4) */}
      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE</Text>
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOptionRow,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderWidth: isSelected ? 1.5 : 1,
                },
              ]}
              onPress={() => setMode(option.value)}
            >
              <Text style={styles.themeOptionIcon}>{option.icon}</Text>
              <Text style={[styles.themeOptionLabel, { color: colors.textPrimary }]}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={[styles.selectedDot, { backgroundColor: colors.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Menu Items */}
      <View style={[styles.menuSection, {
        backgroundColor: colors.bgSurface,
        borderColor: colors.border,
      }]}>
        {profile?.role === 'owner' && (
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleSwitchToAdmin}>
            <Text style={styles.menuIcon}>🔧</Text>
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Admin Dashboard</Text>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>→</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Parking History</Text>
          <Text style={[styles.menuArrow, { color: colors.textMuted }]}>→</Text>
        </TouchableOpacity>

        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>App Version</Text>
          <Text style={[styles.menuValue, { color: colors.textMuted }]}>1.0.0</Text>
        </View>
      </View>

      {/* Guest upgrade CTA */}
      {isGuest && (
        <TouchableOpacity
          style={[styles.upgradeCard, {
            backgroundColor: colors.accent + '15',
            borderColor: colors.accent + '30',
          }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[styles.upgradeTitle, { color: colors.accent }]}>Create an Account</Text>
          <Text style={[styles.upgradeDesc, { color: colors.textSecondary }]}>
            Save your parking history and get personalized features
          </Text>
        </TouchableOpacity>
      )}

      {/* Sign Out */}
      <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.errorLight }]} onPress={handleSignOut}>
        <Text style={[styles.signOutText, { color: colors.error }]}>
          {isGuest ? '← Exit Guest Mode' : '← Sign Out'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>🅿️ Durvesh Parking</Text>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>Smart Parking Management</Text>
      </View>
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
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  userEmail: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'DM_Sans_600SemiBold',
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  themeOptionIcon: { fontSize: 20 },
  themeOptionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DM_Sans_500Medium',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuSection: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  menuArrow: {
    fontSize: FontSize.md,
  },
  menuValue: {
    fontSize: FontSize.sm,
  },
  upgradeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  upgradeTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  upgradeDesc: {
    fontSize: FontSize.sm,
  },
  signOutButton: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    marginTop: 4,
  },
});

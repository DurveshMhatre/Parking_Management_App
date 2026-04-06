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
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {isGuest ? '👤' : (profile?.full_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          {isGuest ? (
            <>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>No account linked</Text>
            </>
          ) : (
            <>
              <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {profile?.role === 'owner' ? '👑 Owner' : '🚗 Customer'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {profile?.role === 'owner' && (
          <TouchableOpacity style={styles.menuItem} onPress={handleSwitchToAdmin}>
            <Text style={styles.menuIcon}>🔧</Text>
            <Text style={styles.menuText}>Admin Dashboard</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>Parking History</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>App Version</Text>
          <Text style={styles.menuValue}>1.0.0</Text>
        </View>
      </View>

      {/* Guest upgrade CTA */}
      {isGuest && (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.upgradeTitle}>Create an Account</Text>
          <Text style={styles.upgradeDesc}>
            Save your parking history and get personalized features
          </Text>
        </TouchableOpacity>
      )}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>
          {isGuest ? '← Exit Guest Mode' : '← Sign Out'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🅿️ Durvesh Parking</Text>
        <Text style={styles.footerSubtext}>Smart Parking Management</Text>
      </View>
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
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  menuArrow: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  menuValue: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  upgradeCard: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  upgradeTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  upgradeDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  signOutButton: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

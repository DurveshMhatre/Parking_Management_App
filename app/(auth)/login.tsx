import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { GuestLoginButton } from '../../components/GuestLoginButton';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { validateIndianPhone } from '../../lib/validation';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInAsGuest } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    if (!phone.trim() || !validateIndianPhone(phone.trim())) {
      setPhoneError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setPhoneError('');
    setIsLoading(true);
    const { error } = await signIn(email.trim(), password.trim());
    setIsLoading(false);
    if (error) {
      Alert.alert('Login Failed', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGuestCheckout = async () => {
    setIsLoading(true);
    const { error } = await signInAsGuest();
    setIsLoading(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handlePhoneBlur = () => {
    if (phone.trim() && !validateIndianPhone(phone.trim())) {
      setPhoneError('Enter a valid 10-digit Indian mobile number');
    } else {
      setPhoneError('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.parkingIcon}>🅿️</Text>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Durvesh Parking</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Smart Parking Management</Text>
        </View>

        {/* Guest Login — ABOVE the login card (Change 3) */}
        <GuestLoginButton onPress={handleGuestCheckout} />

        {/* Login form */}
        <View style={[styles.formContainer, {
          backgroundColor: colors.bgSurface,
          ...(isDark ? Shadows.md : {
            shadowColor: '#000000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }),
        }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Sign in to manage your parking</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surfaceElevated,
                color: colors.textPrimary,
                borderColor: colors.border,
              }]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surfaceElevated,
                color: colors.textPrimary,
                borderColor: colors.border,
              }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Phone Number — Mandatory */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number *</Text>
            <View style={styles.phoneRow}>
              <View style={[styles.countryCode, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, {
                  backgroundColor: colors.surfaceElevated,
                  color: colors.textPrimary,
                  borderColor: phoneError ? colors.error : colors.border,
                }]}
                placeholder="9876543210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/\D/g, ''));
                  setPhoneError('');
                }}
                onBlur={handlePhoneBlur}
              />
            </View>
            {phoneError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {isLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loginButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={[styles.registerLinkText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={[styles.registerLinkHighlight, { color: colors.accent }]}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  parkingIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  formContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    borderWidth: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryCode: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
  },
  countryCodeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  phoneInput: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    borderWidth: 1,
    letterSpacing: 2,
  },
  errorText: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  loginButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  loginGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  // RULE: Never use style={{ color: undefined }} or rely on color inheritance.
  // Every Text inside a Button MUST have an explicit color value.
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  registerLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: FontSize.sm,
  },
  registerLinkHighlight: {
    fontWeight: FontWeight.bold,
  },
});

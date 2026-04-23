import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { validateIndianPhone, validateEmail } from '../lib/validation';
import { generateReferralCode } from '../lib/generateReferralCode';
import { registerPartner } from '../lib/partners';

export default function PartnerRegisterScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [useBank, setUseBank] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for each input to manage focus
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const upiRef = useRef<TextInput>(null);
  const bankNameRef = useRef<TextInput>(null);
  const bankAccRef = useRef<TextInput>(null);
  const ifscRef = useRef<TextInput>(null);

  const inputStyle = {
    backgroundColor: colors.bgSurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const labelStyle = {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium as any,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  };

  const handleRegister = async () => {
    if (!fullName.trim()) { Alert.alert('Error', 'Please enter your full name.'); return; }
    if (!phone.trim() || !validateIndianPhone(phone.trim())) { Alert.alert('Error', 'Enter a valid 10-digit mobile number.'); return; }
    if (!email.trim() || !validateEmail(email.trim())) { Alert.alert('Error', 'Enter a valid email address.'); return; }
    if (!useBank && !upiId.trim()) { Alert.alert('Error', 'Enter your UPI ID.'); return; }
    if (useBank && (!bankAccountNo.trim() || !bankIfsc.trim())) { Alert.alert('Error', 'Enter bank account details.'); return; }
    if (!agreedToTerms) { Alert.alert('Error', 'Please agree to the terms.'); return; }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const referralCode = generateReferralCode(fullName.trim());
      await registerPartner({
        userId: user?.id || '',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        referralCode,
        upiId: upiId.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNo: bankAccountNo.trim() || undefined,
        bankIfsc: bankIfsc.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '🎉 Application Submitted!',
        `Your referral code is: ${referralCode}\n\nYour application is pending approval. You'll be notified once approved.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.xxl }}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
    >
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: Spacing.lg }}>
        <Text style={{ color: colors.accent, fontSize: FontSize.md }}>← Back</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: colors.textPrimary, marginBottom: Spacing.xs }}>
        🤝 Partner Registration
      </Text>
      <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, marginBottom: Spacing.xl }}>
        Join the ParkSpace Partner Programme and earn commission on every sale
      </Text>

      <View style={{
        backgroundColor: colors.bgCard,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: Spacing.lg,
      }}>

        {/* Full Name */}
        <View style={styles.fieldWrap}>
          <Text style={labelStyle}>Full Name *</Text>
          <TextInput
            style={inputStyle}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ravi Kumar"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        {/* Phone */}
        <View style={styles.fieldWrap}>
          <Text style={labelStyle}>Mobile Number *</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <View style={{
              backgroundColor: colors.bgSurface,
              borderRadius: BorderRadius.md,
              paddingHorizontal: Spacing.md,
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={{ fontSize: FontSize.md, color: colors.textPrimary, fontWeight: FontWeight.semibold }}>🇮🇳 +91</Text>
            </View>
            <TextInput
              ref={phoneRef}
              style={[inputStyle, { flex: 1, letterSpacing: 2 }]}
              placeholder="9876543210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={labelStyle}>Email *</Text>
          <TextInput
            ref={emailRef}
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder="partner@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => upiRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        {/* Payment Method Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
          <Text style={{ fontSize: FontSize.md, color: colors.textPrimary }}>Use Bank Transfer</Text>
          <Switch value={useBank} onValueChange={setUseBank} trackColor={{ false: colors.border, true: colors.accent }} />
        </View>

        {/* UPI or Bank fields */}
        {!useBank ? (
          <View style={styles.fieldWrap}>
            <Text style={labelStyle}>UPI ID *</Text>
            <TextInput
              ref={upiRef}
              style={inputStyle}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="name@upi"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </View>
        ) : (
          <>
            <View style={styles.fieldWrap}>
              <Text style={labelStyle}>Bank Name</Text>
              <TextInput
                ref={bankNameRef}
                style={inputStyle}
                value={bankName}
                onChangeText={setBankName}
                placeholder="State Bank of India"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => bankAccRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={labelStyle}>Account Number *</Text>
              <TextInput
                ref={bankAccRef}
                style={inputStyle}
                value={bankAccountNo}
                onChangeText={setBankAccountNo}
                placeholder="0000000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => ifscRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={labelStyle}>IFSC Code *</Text>
              <TextInput
                ref={ifscRef}
                style={inputStyle}
                value={bankIfsc}
                onChangeText={setBankIfsc}
                placeholder="SBIN0000001"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>
          </>
        )}

        {/* Terms */}
        <TouchableOpacity
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm }}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 6, borderWidth: 2,
            borderColor: agreedToTerms ? colors.accent : colors.border,
            backgroundColor: agreedToTerms ? colors.accent : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {agreedToTerms && <Text style={{ color: '#FFF', fontSize: 14 }}>✓</Text>}
          </View>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, flex: 1 }}>
            I agree to the ParkSpace Partner Programme terms and conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        activeOpacity={0.85}
        style={{ borderRadius: BorderRadius.lg, overflow: 'hidden', ...(isLoading ? {} : Shadows.glow) }}
      >
        <LinearGradient
          colors={colors.gradientCTA as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.lg, height: 56, justifyContent: 'center' }}
        >
          {isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: '#FFFFFF' }}>Submitting...</Text>
            </View>
          ) : (
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: '#FFFFFF' }}>
              Submit Application
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 16,
  },
});

// src/components/GuestLoginButton.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onPress: () => void;
}

export function GuestLoginButton({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>

      {/* Warning Note — shown ABOVE the button */}
      <View style={[styles.warningBox, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={[styles.warningText, { color: colors.warningText }]}>
          <Text style={styles.warningBold}>Important: </Text>
          If you log out while an Active Parking Session is running, we are{' '}
          <Text style={styles.warningBold}>not responsible</Text> for any loss of ticket,
          session data, or parking disputes. Please save your ticket QR before logging out.
        </Text>
      </View>

      {/* Guest Button */}
      <TouchableOpacity
        style={[styles.guestBtn, { borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={[styles.guestLabel, { color: colors.textSecondary }]}>
          Continue as Guest
        </Text>
        <Text style={[styles.guestArrow, { color: colors.textMuted }]}>›</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    gap: 10,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  warningIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'DM_Sans_400Regular',
  },
  warningBold: {
    fontFamily: 'DM_Sans_600SemiBold',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  guestIcon: {
    fontSize: 18,
  },
  guestLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DM_Sans_500Medium',
  },
  guestArrow: {
    fontSize: 20,
    fontFamily: 'DM_Sans_400Regular',
  },
});

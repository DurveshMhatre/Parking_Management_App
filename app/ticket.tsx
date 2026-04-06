import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import QRTicket from '../components/QRTicket';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../constants/theme';
import { formatDateTime } from '../lib/utils';

export default function TicketScreen() {
  const params = useLocalSearchParams<{
    sessionId: string;
    ticketCode: string;
    vehicleNo: string;
    vehicleTypeName: string;
    vehicleTypeIcon: string;
    entryTime: string;
    amountPaid: string;
  }>();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🅿️ Durvesh Parking Ticket\n\nTicket: ${params.ticketCode}\nVehicle: ${params.vehicleNo}\nType: ${params.vehicleTypeName}\nEntry: ${formatDateTime(params.entryTime || new Date().toISOString())}\nPaid: ₹${params.amountPaid}\n\nShow this code at exit for checkout.`,
        title: 'Durvesh Parking Ticket',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successDesc}>Your parking ticket has been generated</Text>
      </View>

      {/* QR Ticket */}
      <QRTicket
        ticketCode={params.ticketCode || 'DP00000000'}
        vehicleNo={params.vehicleNo || 'XX-00-XX-0000'}
        vehicleType={params.vehicleTypeName || 'Vehicle'}
        vehicleIcon={params.vehicleTypeIcon || '🚗'}
        entryTime={params.entryTime || new Date().toISOString()}
        amountPaid={parseFloat(params.amountPaid || '0')}
        status="active"
      />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📋 Instructions</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>Keep this ticket handy</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>Show QR code to parking staff at exit</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>You can also checkout from the app</Text>
        </View>
      </View>

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.85}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.doneGradient}
        >
          <Text style={styles.doneText}>Go to Home 🏠</Text>
        </LinearGradient>
      </TouchableOpacity>

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
    paddingTop: Spacing.xxl + Spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successEmoji: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.success,
  },
  successDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  instructionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    overflow: 'hidden',
  },
  instructionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  doneButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  doneGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  doneText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
});

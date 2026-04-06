import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useParkingStore } from '../../store/parkingStore';
import { notifyCheckoutComplete } from '../../lib/notifications';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../constants/theme';
import { formatDuration, formatDateTime } from '../../lib/utils';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const { checkoutByTicketCode } = useParkingStore();

  const handleCheckout = async (ticketCode: string) => {
    if (!ticketCode.trim()) {
      Alert.alert('Error', 'Please enter or scan a ticket code.');
      return;
    }

    setIsProcessing(true);
    try {
      const session = await checkoutByTicketCode(ticketCode.trim());
      if (session) {
        await notifyCheckoutComplete(session.vehicle_no, formatDuration(session.duration_mins || 0));
        Alert.alert(
          '✅ Checkout Successful',
          `Vehicle: ${session.vehicle_no}\nDuration: ${formatDuration(session.duration_mins || 0)}\nPaid: ₹${session.amount_paid}`,
          [{ text: 'OK' }]
        );
        setScannedCode('');
        setManualCode('');
      } else {
        Alert.alert('Not Found', 'No active parking session found with this ticket code.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedCode === data || isProcessing) return;
    setScannedCode(data);
    handleCheckout(data);
  };

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'manual' && styles.modeActive]}
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>
            ⌨️ Manual Entry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'camera' && styles.modeActive]}
          onPress={() => {
            if (!permission?.granted) {
              requestPermission();
            }
            setMode('camera');
          }}
        >
          <Text style={[styles.modeText, mode === 'camera' && styles.modeTextActive]}>
            📷 Scan QR
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'camera' ? (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarCodeScanned}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <Text style={styles.scanText}>Point camera at customer's QR ticket</Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionText}>
                Camera permission is required to scan QR codes
              </Text>
              <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                <Text style={styles.permissionBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.manualContainer}>
          <Text style={styles.manualTitle}>Enter Ticket Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="e.g., DPAB12CD34"
            placeholderTextColor={Colors.textMuted}
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
            maxLength={12}
          />
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => handleCheckout(manualCode)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>✅ Process Checkout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Scanned result */}
      {scannedCode ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Last Scanned</Text>
          <Text style={styles.resultCode}>{scannedCode}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  modeActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  permissionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  manualContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  manualTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  checkoutButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  resultCode: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 2,
  },
});

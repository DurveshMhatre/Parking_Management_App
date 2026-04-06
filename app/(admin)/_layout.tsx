import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: '🔧 Admin Dashboard' }} />
      <Stack.Screen name="scan" options={{ title: '📷 Scan QR Code' }} />
      <Stack.Screen name="sessions" options={{ title: '📋 All Sessions' }} />
      <Stack.Screen name="settings" options={{ title: '⚙️ Settings' }} />
    </Stack>
  );
}

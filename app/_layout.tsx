import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { useParkingStore } from '../store/parkingStore';
import { requestNotificationPermissions } from '../lib/notifications';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const fetchVehicleTypes = useParkingStore((s) => s.fetchVehicleTypes);
  const fetchConfig = useParkingStore((s) => s.fetchConfig);

  useEffect(() => {
    initialize();
    fetchVehicleTypes();
    fetchConfig();
    requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry"
          options={{
            headerShown: true,
            title: 'Park Vehicle',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.textPrimary,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="payment"
          options={{
            headerShown: true,
            title: 'Payment',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="ticket"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="checkout-confirm"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

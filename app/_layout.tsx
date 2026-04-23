import React, { useEffect, useState, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/authStore';
import { useParkingStore } from '../store/parkingStore';
import {
  requestNotificationPermissions,
  registerForPushNotifications,
  saveTokenToSupabase,
} from '../lib/notifications';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootLayoutInner() {
  const { colors, isDark } = useTheme();
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const fetchVehicleTypes = useParkingStore((s) => s.fetchVehicleTypes);
  const fetchConfig = useParkingStore((s) => s.fetchConfig);
  const [appReady, setAppReady] = useState(false);

  const notificationResponseRef = useRef<Notifications.Subscription | null>(null);

  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    initialize();
    fetchVehicleTypes();
    fetchConfig();
    requestNotificationPermissions();
  }, []);

  // Register push token after user is logged in (Patch V3)
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await saveTokenToSupabase(user.id, token);
      }
    })();
  }, [user?.id]);

  // Handle notification tap — navigate to relevant screen (Patch V3)
  useEffect(() => {
    notificationResponseRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === 'penalty_receipt' && data?.sessionId) {
          router.push({
            pathname: '/penalty-receipt',
            params: { sessionId: data.sessionId as string },
          });
        }
      }
    );
    return () => notificationResponseRef.current?.remove();
  }, []);

  // Don't block the app if fonts fail — proceed after 2 seconds regardless
  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
      return;
    }
    const timeout = setTimeout(() => {
      setAppReady(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!appReady) {
    return null; // Expo splash screen stays visible until layout renders
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
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
            headerStyle: { backgroundColor: colors.bgCard },
            headerTintColor: colors.textPrimary,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="payment"
          options={{
            headerShown: false,
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
        <Stack.Screen
          name="partner-register"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="partner-dashboard"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="penalty-receipt"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

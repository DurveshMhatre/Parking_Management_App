import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Schedule a local notification
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

// Notification templates
export const notifyTicketGenerated = async (vehicleNo: string, amount: number) => {
  await sendLocalNotification(
    '🎫 Parking Ticket Generated!',
    `Vehicle: ${vehicleNo}\nAmount Paid: ₹${amount}\nYour parking session is now active.`,
    { type: 'ticket_generated' }
  );
};

export const notifyCheckoutComplete = async (vehicleNo: string, duration: string) => {
  await sendLocalNotification(
    '✅ Checkout Complete!',
    `Vehicle: ${vehicleNo}\nDuration: ${duration}\nThank you for parking with Durvesh Parking!`,
    { type: 'checkout_complete' }
  );
};

export const notifyParkingExpiring = async (vehicleNo: string, minsLeft: number) => {
  await sendLocalNotification(
    '⏰ Parking Expiring Soon!',
    `Vehicle: ${vehicleNo} — Only ${minsLeft} minutes left.\nExtend your parking to avoid overstay charges.`,
    { type: 'parking_expiring' }
  );
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    return false;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

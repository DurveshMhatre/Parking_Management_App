// supabase/functions/shared/push.ts
// Expo Push Notification Service

interface PushPayload {
  title: string;
  body:  string;
  data?: Record<string, unknown>;
}

export async function sendExpoPushNotification(
  token:   string,
  payload: PushPayload
): Promise<void> {
  if (!token || !token.startsWith('ExponentPushToken')) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      to:    token,
      title: payload.title,
      body:  payload.body,
      data:  payload.data || {},
      sound: 'default',
      priority: 'high',
      channelId: 'parking-alerts',
    }),
  });
}

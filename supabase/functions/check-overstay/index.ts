// supabase/functions/check-overstay/index.ts
// Cron job: runs every 5 minutes to process overstayed parking sessions
// Schedule in Supabase: */5 * * * *

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendExpoPushNotification } from '../shared/push.ts';
import { sendWhatsAppWarning, sendWhatsAppReceipt } from '../shared/whatsapp.ts';

const PENALTY_RATE_PER_HOUR = 20;
const PENALTY_GRACE_MINUTES = 10;

const WARNING_SCHEDULE = {
  push1:    0,
  push2:    20,
  push3:    40,
  push4:    60,
  whatsapp: 70,
  debit:    75,
};

function calculatePenalty(overstayMinutes: number) {
  const billable = Math.max(0, overstayMinutes - PENALTY_GRACE_MINUTES);
  if (billable <= 0) return { billableMinutes: 0, hours: 0, amount: 0, amountInPaise: 0 };
  const hours  = Math.ceil(billable / 60);
  const amount = hours * PENALTY_RATE_PER_HOUR;
  return { billableMinutes: billable, hours, amount, amountInPaise: amount * 100 };
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const now = new Date();

  const { data: expired } = await supabase
    .from('parking_sessions')
    .select('*')
    .in('status', ['active', 'overstay'])
    .lt('expiry_time', now.toISOString())
    .eq('penalty_deducted', false);

  if (!expired?.length) return new Response('No overstays', { status: 200 });

  for (const session of expired) {
    const expiryTime  = new Date(session.expiry_time);
    const overstayMs  = now.getTime() - expiryTime.getTime();
    const overstayMin = Math.floor(overstayMs / 60000);
    const { amount, hours, billableMinutes } = calculatePenalty(overstayMin);

    // Mark as overstay on first detection
    if (session.status !== 'overstay') {
      await supabase.from('parking_sessions').update({
        status:        'overstay',
        overstay_start: expiryTime.toISOString(),
      }).eq('id', session.id);
    }

    // Still in grace period — do nothing
    if (billableMinutes <= 0) continue;

    // Minutes elapsed since grace period ended
    const minSinceGrace = overstayMin - 10;

    const pushCount = session.push_warning_count || 0;

    // ── IN-APP PUSH WARNINGS (4 total) ───────────────────────────

    const PUSH_MESSAGES = [
      {
        triggerMin: WARNING_SCHEDULE.push1,
        title:      '⏰ Parking Time Expired',
        body:       `Your ${session.vehicle_type} (${session.vehicle_no}) booking has expired. Move your vehicle or a ₹20/hr penalty will apply.`,
        data:       { type: 'overstay_warning', count: 1, sessionId: session.id },
      },
      {
        triggerMin: WARNING_SCHEDULE.push2,
        title:      '⚠️ Penalty Accruing — ₹' + amount,
        body:       `Still parked beyond your booking time. Current penalty: ₹${amount}. Move your vehicle to stop charges.`,
        data:       { type: 'overstay_warning', count: 2, sessionId: session.id },
      },
      {
        triggerMin: WARNING_SCHEDULE.push3,
        title:      '🚨 Penalty Growing — ₹' + amount,
        body:       `You have been overstaying for ${minSinceGrace}+ minutes. Current penalty: ₹${amount}. Act now.`,
        data:       { type: 'overstay_warning', count: 3, sessionId: session.id },
      },
      {
        triggerMin: WARNING_SCHEDULE.push4,
        title:      '🔴 Final App Warning — Auto-Debit Soon',
        body:       `Last chance. Penalty ₹${amount} will be auto-deducted in ~15 minutes. Tap to extend or pay now.`,
        data:       { type: 'overstay_warning', count: 4, sessionId: session.id },
      },
    ];

    // Determine which push notification to send next
    const nextPush = PUSH_MESSAGES[pushCount];
    const shouldSendPush =
      pushCount < 4 &&
      nextPush &&
      minSinceGrace >= nextPush.triggerMin &&
      session.expo_push_token;

    if (shouldSendPush) {
      await sendExpoPushNotification(session.expo_push_token, {
        title:   nextPush.title,
        body:    nextPush.body,
        data:    nextPush.data,
      });

      await supabase.from('parking_sessions').update({
        push_warning_count: pushCount + 1,
        last_push_at:       now.toISOString(),
      }).eq('id', session.id);
    }

    // ── WHATSAPP FINAL WARNING (1 message, sent once) ───────────
    const shouldSendWhatsAppWarning =
      !session.whatsapp_warning_sent &&
      minSinceGrace >= WARNING_SCHEDULE.whatsapp &&
      session.customer_phone;

    if (shouldSendWhatsAppWarning) {
      await sendWhatsAppWarning(session.customer_phone, {
        vehicleType:    session.vehicle_type || 'vehicle',
        vehicleNo:      session.vehicle_no,
        penaltyAmount:  amount,
        minutesUntilDebit: 5,
      });

      await supabase.from('parking_sessions').update({
        whatsapp_warning_sent: true,
      }).eq('id', session.id);
    }

    // ── AUTO-DEBIT via Razorpay Mandate ─────────────────────────
    const shouldDebit =
      minSinceGrace >= WARNING_SCHEDULE.debit &&
      session.mandate_status === 'authorized' &&
      session.razorpay_mandate_id &&
      !session.penalty_deducted;

    if (shouldDebit) {
      try {
        const authHeader = btoa(
          `${Deno.env.get('RAZORPAY_KEY_ID')}:${Deno.env.get('RAZORPAY_KEY_SECRET')}`
        );

        const chargeRes = await fetch('https://api.razorpay.com/v1/subscriptions/charge', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription_id: session.razorpay_mandate_id,
            amount:          amount * 100,
            currency:        'INR',
            description:     `Overstay penalty — ${session.vehicle_no} — ${hours} hr(s)`,
            notes: {
              parking_session_id: session.id,
              vehicle_no:         session.vehicle_no,
              overstay_hours:     hours,
            },
          }),
        });

        const charge = await chargeRes.json();

        if (charge.id) {
          // Debit successful
          await supabase.from('parking_sessions').update({
            penalty_amount:      amount,
            penalty_deducted:    true,
            penalty_payment_id:  charge.id,
            penalty_deducted_at: now.toISOString(),
            overstay_minutes:    overstayMin,
            overstay_hours:      hours,
            status:              'completed',
          }).eq('id', session.id);

          await supabase.from('penalty_transactions').insert({
            parking_session_id:  session.id,
            vehicle_no:          session.vehicle_no,
            vehicle_type:        session.vehicle_type || 'unknown',
            customer_phone:      session.customer_phone,
            overstay_minutes:    overstayMin,
            penalty_hours:       hours,
            penalty_amount:      amount,
            razorpay_payment_id: charge.id,
            mandate_id:          session.razorpay_mandate_id,
            deduction_status:    'success',
          });

          // WhatsApp receipt
          await sendWhatsAppReceipt(session.customer_phone, {
            vehicleNo:      session.vehicle_no,
            vehicleType:    session.vehicle_type || 'vehicle',
            entryTime:      session.entry_time,
            expiryTime:     session.expiry_time,
            overstayHours:  hours,
            penaltyAmount:  amount,
            paymentId:      charge.id,
          });

          await supabase.from('parking_sessions').update({
            whatsapp_receipt_sent: true,
          }).eq('id', session.id);

          // Push: deduction confirmation
          if (session.expo_push_token) {
            await sendExpoPushNotification(session.expo_push_token, {
              title: '✅ Penalty Deducted',
              body:  `₹${amount} overstay penalty auto-deducted from your UPI. Check WhatsApp for your receipt.`,
              data:  { type: 'penalty_receipt', sessionId: session.id },
            });
          }

        } else {
          // Charge failed
          await supabase.from('penalty_transactions').insert({
            parking_session_id: session.id,
            vehicle_no:         session.vehicle_no,
            vehicle_type:       session.vehicle_type || 'unknown',
            customer_phone:     session.customer_phone,
            overstay_minutes:   overstayMin,
            penalty_hours:      hours,
            penalty_amount:     amount,
            mandate_id:         session.razorpay_mandate_id,
            deduction_status:   'failed',
            failure_reason:     charge.error?.description || 'Unknown',
          });

          if (session.expo_push_token) {
            await sendExpoPushNotification(session.expo_push_token, {
              title: '❌ Payment Failed',
              body:  `Auto-deduction of ₹${amount} penalty failed. Please contact the parking owner to resolve.`,
              data:  { type: 'penalty_failed', sessionId: session.id },
            });
          }
        }

      } catch (err) {
        console.error('Mandate charge error:', session.id, err);
      }
    }
  }

  return new Response(`Processed ${expired.length} sessions`, { status: 200 });
});

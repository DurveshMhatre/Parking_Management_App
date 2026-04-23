// supabase/functions/shared/whatsapp.ts
// WhatsApp service via Meta Business API (NOT Twilio)

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

// ── FINAL WARNING (sent once, ~5 min before auto-debit) ──────────

interface WarningParams {
  vehicleType:       string;
  vehicleNo:         string;
  penaltyAmount:     number;
  minutesUntilDebit: number;
}

export async function sendWhatsAppWarning(
  phone:  string,
  params: WarningParams
): Promise<void> {
  const message = `
🔴 *ParkSpace — Final Warning*

Your *${params.vehicleType.toUpperCase()} (${params.vehicleNo})* is still parked beyond your booking time.

⏱ *₹${params.penaltyAmount}* will be *auto-deducted from your UPI* in approximately *${params.minutesUntilDebit} minutes*.

This is your last chance to:
• Move your vehicle immediately, OR
• Open the ParkSpace app to extend your booking

After deduction, a receipt will be sent to this WhatsApp number.

— ParkSpace Parking Management
  `.trim();

  await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `91${phone.replace(/\D/g, '')}`,
      type: 'text',
      text: { body: message },
    }),
  });
}

// ── RECEIPT / INVOICE (sent after auto-debit succeeds) ───────────

interface ReceiptParams {
  vehicleNo:     string;
  vehicleType:   string;
  entryTime:     string;
  expiryTime:    string;
  overstayHours: number;
  penaltyAmount: number;
  paymentId:     string;
}

export async function sendWhatsAppReceipt(
  phone:  string,
  params: ReceiptParams
): Promise<void> {
  const entry  = new Date(params.entryTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const expiry = new Date(params.expiryTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const message = `
🅿️ *ParkSpace — Overstay Penalty Receipt*
━━━━━━━━━━━━━━━━━━━━

*Vehicle:*         ${params.vehicleType.toUpperCase()} — ${params.vehicleNo}
*Entry Time:*      ${entry}
*Booking Expired:* ${expiry}
*Overstay:*        ${params.overstayHours} hour(s)

*Penalty Rate:*    ₹20 / hour
*Total Charged:*   ₹${params.penaltyAmount}
*Payment ID:*      ${params.paymentId}

━━━━━━━━━━━━━━━━━━━━
✅ Auto-deducted from your authorized UPI.
Keep this message as your receipt.

— ParkSpace Parking Management
  `.trim();

  await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `91${phone.replace(/\D/g, '')}`,
      type: 'text',
      text: { body: message },
    }),
  });
}

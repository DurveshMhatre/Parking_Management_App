// supabase/functions/create-mandate/index.ts
// Creates a Razorpay UPI AutoPay mandate at booking time

import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { customerPhone, customerName, maxAmount } = await req.json();

    const authHeader = btoa(
      `${Deno.env.get('RAZORPAY_KEY_ID')}:${Deno.env.get('RAZORPAY_KEY_SECRET')}`
    );

    // Create Razorpay customer (idempotent)
    const customerRes = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:          customerName || 'ParkSpace Customer',
        contact:       `+91${customerPhone}`,
        fail_existing: 0,
      }),
    });
    const customer = await customerRes.json();

    // Create UPI recurring mandate payment link
    const mandateRes = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:        'upi',
        amount:      maxAmount || 50000,   // ₹500 cap
        currency:    'INR',
        description: 'ParkSpace Overstay Protection — AutoPay Authorization',
        customer_id: customer.id,
        notify: {
          sms:      false,
          email:    false,
          whatsapp: true,
        },
        reminder_enable: true,
        notes: { purpose: 'parking_overstay_mandate' },
        callback_url:    `${Deno.env.get('API_BASE_URL')}/mandate-callback`,
        callback_method: 'get',
      }),
    });

    const mandate = await mandateRes.json();

    return new Response(
      JSON.stringify({ mandateId: mandate.id, mandateUrl: mandate.short_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

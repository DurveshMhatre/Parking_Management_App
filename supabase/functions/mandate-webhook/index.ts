// supabase/functions/mandate-webhook/index.ts
// Webhook for Razorpay mandate activation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.text();
    // TODO: Verify Razorpay HMAC signature before processing

    const event = JSON.parse(body);
    if (event.event === 'subscription.activated' || event.event === 'payment_link.paid') {
      const mandateId = event.payload.payment_link?.entity?.id;
      if (mandateId) {
        await supabase
          .from('parking_sessions')
          .update({ mandate_status: 'authorized', razorpay_mandate_id: mandateId })
          .eq('razorpay_mandate_id', mandateId);
      }
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Mandate webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

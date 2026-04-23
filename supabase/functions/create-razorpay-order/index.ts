// Supabase Edge Function: create-razorpay-order
// Runs on Deno — securely creates a Razorpay order using the Key Secret
// Deploy: supabase functions deploy create-razorpay-order

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body;

    // Validate required fields
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a positive number in paise." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate API keys are set
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay API keys are not configured in environment variables.");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Basic Auth header for Razorpay
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    // Build the order payload
    const orderPayload: Record<string, unknown> = {
      amount,           // already in paise (e.g. ₹50 → 5000)
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
    };
    if (notes) {
      orderPayload.notes = notes;
    }

    console.log(`[create-razorpay-order] Creating order: amount=${amount} currency=${currency}`);

    // Call Razorpay Orders API
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const razorpayData = await razorpayRes.json();

    if (!razorpayRes.ok) {
      console.error("[create-razorpay-order] Razorpay error:", JSON.stringify(razorpayData));
      return new Response(
        JSON.stringify({
          error: razorpayData?.error?.description ?? "Failed to create order.",
          razorpay_error: razorpayData,
        }),
        {
          status: razorpayRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[create-razorpay-order] Order created: ${razorpayData.id}`);

    // Return the order to the client (only safe fields — no secret exposed)
    return new Response(
      JSON.stringify({
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        receipt: razorpayData.receipt,
        status: razorpayData.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[create-razorpay-order] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

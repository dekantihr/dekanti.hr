import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreatePaymentRequest {
  amount: number;            // Amount in EUR
  order_reference: string;   // Reference / future order number
  description?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CreatePaymentRequest = await req.json();
    const { amount, order_reference, description } = body;

    if (!amount || amount <= 0) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }
    if (!order_reference) {
      return jsonResponse({ error: 'Missing order_reference' }, 400);
    }

    // Convert amount to cents — Revolut uses cents in payment links
    const amountCents = Math.round(amount * 100);

    // Revolut.me username (e.g. "dekantihr")
    const revolutUsername = Deno.env.get('REVOLUT_USERNAME') || 'dekantihr';

    // Build the link.
    // Format: https://revolut.me/{username}/{amount_in_cents}
    // (e.g. https://revolut.me/dekantihr/1000 = 10.00 EUR)
    const paymentLink = `https://revolut.me/${revolutUsername}/${amountCents}`;

    // QR code via free QR service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(paymentLink)}`;

    console.log('[create-revolut-payment] link generated', {
      order_reference,
      amount,
      amountCents,
      paymentLink,
      description,
    });

    return jsonResponse({
      success: true,
      payment_link: paymentLink,
      qr_code_url: qrCodeUrl,
      amount_cents: amountCents,
      amount_eur: amount,
      order_reference,
    }, 200);
  } catch (error) {
    console.error('[create-revolut-payment] error', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

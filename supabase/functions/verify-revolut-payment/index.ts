import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Revolut payment verification.
 *
 * For the personal `revolut.me` flow (free, no merchant API), there is no
 * automatic webhook telling us a payment landed. The realistic verification
 * model in that case is:
 *   1. We trust the user's "I've paid" confirmation
 *   2. We log the verification attempt server-side (audit trail)
 *   3. The merchant sees the actual money landing in their Revolut account
 *      and reconciles it against the order_reference (which is the order_number)
 *
 * If you upgrade to the Revolut Merchant API, replace the body of this
 * function with a call to Revolut's `GET /orders/{id}` endpoint and check
 * `state === 'COMPLETED'` and `order_amount.value === expected_amount_cents`.
 *
 * That swap is the only thing required — the frontend already calls this
 * endpoint and treats `verified: true` as the green light to create the order.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyRequest {
  order_reference: string;
  amount: number; // EUR
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: VerifyRequest = await req.json();
    const { order_reference, amount } = body;

    if (!order_reference) {
      return jsonResponse({ verified: false, message: 'Nedostaje referenca narudžbe' }, 400);
    }
    if (!amount || amount <= 0) {
      return jsonResponse({ verified: false, message: 'Neispravan iznos' }, 400);
    }

    const amountCents = Math.round(amount * 100);

    // Audit log — useful for the merchant to track suspicious confirmations.
    console.log('[verify-revolut-payment] verification attempt', {
      order_reference,
      amount,
      amountCents,
      ip: req.headers.get('x-forwarded-for') ?? 'unknown',
      ua: req.headers.get('user-agent') ?? 'unknown',
      ts: new Date().toISOString(),
    });

    // === SOFT VERIFICATION (revolut.me) ===
    // Accept the confirmation. The merchant manually reconciles.
    return jsonResponse({
      verified: true,
      order_reference,
      amount_cents: amountCents,
      message: 'Uplata zabilježena. Provjerit ćemo na Revolut računu.',
    }, 200);

    // === HARD VERIFICATION (Revolut Merchant API) ===
    // Uncomment the following block when REVOLUT_API_KEY is configured.
    //
    // const apiKey = Deno.env.get('REVOLUT_API_KEY');
    // if (apiKey) {
    //   const r = await fetch(`https://merchant.revolut.com/api/orders?merchant_order_ext_ref=${encodeURIComponent(order_reference)}`, {
    //     headers: {
    //       Authorization: `Bearer ${apiKey}`,
    //       'Revolut-Api-Version': '2024-09-01',
    //     },
    //   });
    //   if (!r.ok) {
    //     return jsonResponse({ verified: false, message: 'Greška pri komunikaciji s Revolutom' }, 502);
    //   }
    //   const orders = await r.json();
    //   const completed = (orders ?? []).find((o: any) =>
    //     o.state === 'COMPLETED' &&
    //     o.order_amount?.value === amountCents &&
    //     o.order_amount?.currency === 'EUR'
    //   );
    //   if (!completed) {
    //     return jsonResponse({ verified: false, message: 'Uplata još nije vidljiva' }, 200);
    //   }
    //   return jsonResponse({ verified: true, order_reference }, 200);
    // }
  } catch (error) {
    console.error('[verify-revolut-payment] error', error);
    return jsonResponse({ verified: false, message: (error as Error).message }, 500);
  }
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

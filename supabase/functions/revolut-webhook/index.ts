import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevolutWebhookPayload {
  event: string;
  order_id: string;
  merchant_order_ext_ref: string; // Our order number
  amount: number; // Amount in cents
  currency: string;
  state: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse webhook payload
    const payload: RevolutWebhookPayload = await req.json();
    
    console.log('Revolut webhook received:', payload);

    // Verify webhook signature (if Revolut provides one)
    // const signature = req.headers.get('X-Revolut-Signature');
    // TODO: Implement signature verification for production

    // Only process COMPLETED payments
    if (payload.event === 'ORDER_COMPLETED' && payload.state === 'COMPLETED') {
      const orderNumber = payload.merchant_order_ext_ref;
      
      // Find the order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !order) {
        console.error('Order not found:', orderNumber, orderError);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Verify amount matches (convert from cents to euros)
      const expectedAmountCents = Math.round(order.ukupno * 100);
      if (payload.amount !== expectedAmountCents) {
        console.error('Amount mismatch:', {
          expected: expectedAmountCents,
          received: payload.amount,
          orderNumber
        });
        return new Response(
          JSON.stringify({ error: 'Amount mismatch' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Mark order as paid
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          placeno: true,
          datum_placanja: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update order' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Order marked as paid:', orderNumber);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Payment confirmed',
          order_number: orderNumber
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // For other events, just acknowledge
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook received',
        event: payload.event
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

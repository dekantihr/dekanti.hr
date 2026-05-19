# Revolut Payment Implementation

## Overview
This document describes the implementation of Revolut payment integration with proper amount handling (cents), payment validation, and order creation flow.

## Key Features

### 1. **Amount in Cents**
- Revolut payment links use amount in cents (e.g., 10 EUR = 1000 cents)
- The system automatically converts EUR to cents: `Math.round(amount * 100)`
- Example: For 10.50 EUR order, the link will be `revolut.me/dekantihr/1050`

### 2. **Payment Validation**
- Orders are created immediately but marked as unpaid (`placeno: false`)
- Payment status is tracked via:
  - **Automatic polling**: Frontend checks payment status every 3 seconds
  - **Webhook validation**: Backend receives Revolut webhook when payment completes
  - **Manual check**: User can click "Provjerio sam uplatu" button

### 3. **Order Creation Flow**

```
User submits order
    ↓
Order created in database (placeno: false)
    ↓
Revolut payment link generated with amount in cents
    ↓
User pays via Revolut
    ↓
Webhook receives payment confirmation
    ↓
Order marked as paid (placeno: true, datum_placanja: now)
    ↓
Frontend detects payment via polling
    ↓
Order confirmation shown
```

## Implementation Details

### Database Schema

```sql
-- orders table columns
placeno BOOLEAN NOT NULL DEFAULT FALSE
datum_placanja TIMESTAMPTZ
```

### Edge Functions

#### 1. `create-revolut-payment`
Creates a Revolut payment link with proper amount formatting.

**Request:**
```json
{
  "order_number": "HR-2026-123456",
  "amount": 10.50,
  "description": "Narudžba HR-2026-123456"
}
```

**Response:**
```json
{
  "success": true,
  "payment_link": "https://revolut.me/dekantihr/1050",
  "amount_cents": 1050,
  "amount_eur": 10.50,
  "order_number": "HR-2026-123456",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=..."
}
```

#### 2. `revolut-webhook`
Receives payment confirmations from Revolut and marks orders as paid.

**Webhook Payload:**
```json
{
  "event": "ORDER_COMPLETED",
  "order_id": "revolut-order-id",
  "merchant_order_ext_ref": "HR-2026-123456",
  "amount": 1050,
  "currency": "EUR",
  "state": "COMPLETED",
  "created_at": "2026-05-19T12:00:00Z",
  "updated_at": "2026-05-19T12:00:30Z"
}
```

**Validation:**
- Verifies order exists
- Checks amount matches order total (in cents)
- Only processes COMPLETED payments
- Updates order: `placeno: true, datum_placanja: now()`

### Frontend Implementation

#### Payment Modal Features
1. **QR Code**: Automatically generated for easy mobile payment
2. **Payment Link**: Direct link with amount pre-filled
3. **Copy Button**: One-click copy of payment link
4. **Automatic Polling**: Checks payment status every 3 seconds
5. **Manual Check**: Button to manually verify payment

#### Payment Status Polling
```typescript
const startPaymentPolling = (orderNum: string) => {
  const pollInterval = setInterval(async () => {
    const status = await api.checkPaymentStatus(orderNum);
    if (status.placeno) {
      clearInterval(pollInterval);
      // Show success and redirect
    }
  }, 3000);
  
  // Stop after 10 minutes
  setTimeout(() => clearInterval(pollInterval), 600000);
};
```

## API Methods

### `api.createRevolutPayment(orderNumber, amount)`
Creates a Revolut payment link for an order.

### `api.checkPaymentStatus(orderNumber)`
Checks if an order has been paid.

### `api.markOrderPaid(orderNumber)`
Manually marks an order as paid (admin only).

## Configuration

### Environment Variables

Add to `.env`:
```bash
REVOLUT_USERNAME=dekantihr
```

### Revolut Account Setup

1. **Create Revolut Business Account**
2. **Enable Revolut.me payments**
3. **Configure webhook URL**: `https://your-project.supabase.co/functions/v1/revolut-webhook`
4. **Set merchant reference**: Use order number as reference

## Deployment

### 1. Deploy Edge Functions

```bash
# Deploy payment creation function
supabase functions deploy create-revolut-payment

# Deploy webhook function
supabase functions deploy revolut-webhook
```

### 2. Set Environment Variables

```bash
supabase secrets set REVOLUT_USERNAME=dekantihr
```

### 3. Configure Revolut Webhook

In Revolut Business Dashboard:
- Go to Settings → Webhooks
- Add webhook URL: `https://your-project.supabase.co/functions/v1/revolut-webhook`
- Select events: `ORDER_COMPLETED`
- Save and test

## Testing

### Test Payment Flow

1. Create a test order
2. Use Revolut sandbox/test environment
3. Complete payment
4. Verify webhook is received
5. Check order is marked as paid
6. Confirm frontend updates automatically

### Manual Testing

```bash
# Test payment link creation
curl -X POST https://your-project.supabase.co/functions/v1/create-revolut-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"order_number":"HR-2026-123456","amount":10.50}'

# Test webhook (simulate Revolut)
curl -X POST https://your-project.supabase.co/functions/v1/revolut-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event":"ORDER_COMPLETED",
    "merchant_order_ext_ref":"HR-2026-123456",
    "amount":1050,
    "currency":"EUR",
    "state":"COMPLETED"
  }'
```

## Security Considerations

1. **Webhook Signature Verification**: Implement Revolut signature verification in production
2. **Amount Validation**: Always verify payment amount matches order total
3. **Order State**: Prevent duplicate payments by checking order status
4. **HTTPS Only**: All payment links and webhooks must use HTTPS
5. **Rate Limiting**: Implement rate limiting on payment creation endpoint

## Troubleshooting

### Payment Not Confirmed
- Check webhook logs in Supabase Functions
- Verify webhook URL is correct in Revolut dashboard
- Check order number matches exactly
- Verify amount in cents is correct

### Polling Not Working
- Check browser console for errors
- Verify API endpoint is accessible
- Check payment status in database directly

### Amount Mismatch
- Ensure amount is converted to cents correctly
- Check for rounding errors (use `Math.round()`)
- Verify currency is EUR

## Future Enhancements

1. **Refund Support**: Implement refund handling via Revolut API
2. **Partial Payments**: Support split payments
3. **Payment Expiry**: Add expiry time for payment links
4. **Email Notifications**: Send payment confirmation emails
5. **Admin Dashboard**: Show payment status in admin panel
6. **Analytics**: Track payment success rates and timing

## References

- [Revolut Business API Documentation](https://developer.revolut.com/docs/business/payments)
- [Revolut.me Payment Links](https://www.revolut.com/business/online-payments)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

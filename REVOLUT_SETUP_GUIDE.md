# Revolut Payment Setup Guide

## ✅ Completed Steps

### 1. Edge Functions Deployed
- ✅ `create-revolut-payment` - Creates payment links with amount in cents
- ✅ `revolut-webhook` - Receives payment confirmations from Revolut

### 2. Environment Variables Set
- ✅ `REVOLUT_USERNAME=dekantihr` - Your Revolut.me username

### 3. Frontend Updated
- ✅ Payment modal shows QR code for easy scanning
- ✅ Amount is properly formatted in cents (e.g., 10 EUR = 1000)
- ✅ Automatic payment status polling every 3 seconds
- ✅ Manual payment verification button

### 4. Database Ready
- ✅ `placeno` column tracks payment status
- ✅ `datum_placanja` records payment timestamp

## 🔧 Remaining Setup Steps

### Step 1: Configure Revolut Business Account

1. **Log in to Revolut Business Dashboard**
   - Go to https://business.revolut.com

2. **Enable Revolut.me Payments**
   - Navigate to: Merchant → Payment Links
   - Enable Revolut.me feature
   - Set your username to: `dekantihr`

3. **Configure Webhook**
   - Go to: Settings → Webhooks → Add Webhook
   - **Webhook URL**: `https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/revolut-webhook`
   - **Events to subscribe**:
     - ✅ `ORDER_COMPLETED`
     - ✅ `ORDER_CANCELLED` (optional)
     - ✅ `ORDER_FAILED` (optional)
   - **Save and Test** the webhook

4. **Get Webhook Secret** (for production)
   - Copy the webhook signing secret
   - Set it in Supabase:
     ```bash
     supabase secrets set REVOLUT_WEBHOOK_SECRET=your_secret_here
     ```

### Step 2: Test the Payment Flow

#### Test Order Creation
1. Go to your website checkout
2. Add items to cart
3. Fill in delivery details
4. Select "Revolut" as payment method
5. Submit order

#### Verify Payment Link
- Check that the payment link format is correct:
  - ✅ Format: `https://revolut.me/dekantihr/1050` (for 10.50 EUR)
  - ✅ Amount is in cents
  - ✅ QR code is displayed

#### Test Payment
1. Click "Otvori Revolut i plati" button
2. Complete payment in Revolut app
3. Return to website
4. Verify automatic confirmation (within 3-10 seconds)

#### Verify Database
```sql
-- Check order payment status
SELECT order_number, placeno, datum_placanja, ukupno
FROM orders
WHERE order_number = 'HR-2026-XXXXXX';
```

### Step 3: Monitor and Debug

#### Check Edge Function Logs
```bash
# View create-revolut-payment logs
supabase functions logs create-revolut-payment

# View webhook logs
supabase functions logs revolut-webhook
```

#### Test Webhook Manually
```bash
curl -X POST https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/revolut-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ORDER_COMPLETED",
    "merchant_order_ext_ref": "HR-2026-123456",
    "amount": 1050,
    "currency": "EUR",
    "state": "COMPLETED",
    "created_at": "2026-05-19T12:00:00Z",
    "updated_at": "2026-05-19T12:00:30Z"
  }'
```

## 📋 Payment Flow Checklist

### For Each Order:

1. **Order Creation**
   - [ ] Order created with `placeno: false`
   - [ ] Order number generated (HR-YYYY-XXXXXX)
   - [ ] Order items saved
   - [ ] Stock reduced

2. **Payment Link Generation**
   - [ ] Amount converted to cents correctly
   - [ ] Payment link created: `revolut.me/dekantihr/{amount_cents}`
   - [ ] QR code generated
   - [ ] Link displayed to customer

3. **Customer Payment**
   - [ ] Customer clicks link or scans QR
   - [ ] Revolut app opens with pre-filled amount
   - [ ] Customer completes payment
   - [ ] Customer adds order number in description

4. **Payment Confirmation**
   - [ ] Revolut sends webhook to your server
   - [ ] Webhook validates amount and order
   - [ ] Order marked as paid: `placeno: true`
   - [ ] Frontend detects payment via polling
   - [ ] Success message shown to customer

5. **Order Fulfillment**
   - [ ] Admin sees paid order in dashboard
   - [ ] Order is packed and shipped
   - [ ] Tracking number added
   - [ ] Customer receives shipping notification

## 🔒 Security Checklist

- [ ] Webhook signature verification enabled (production)
- [ ] HTTPS enforced on all endpoints
- [ ] Amount validation in webhook
- [ ] Order state validation (prevent double payment)
- [ ] Rate limiting on payment creation
- [ ] Proper error handling and logging

## 🐛 Common Issues and Solutions

### Issue: Payment link shows wrong amount
**Solution**: Check amount conversion to cents
```typescript
// Correct
const amountCents = Math.round(amount * 100);

// Wrong
const amountCents = amount * 100; // May have decimals
```

### Issue: Webhook not received
**Solutions**:
1. Check webhook URL in Revolut dashboard
2. Verify webhook is enabled
3. Check Edge Function logs for errors
4. Test webhook manually with curl

### Issue: Payment confirmed but order not updated
**Solutions**:
1. Check webhook logs for errors
2. Verify order number matches exactly
3. Check database permissions
4. Verify amount matches (in cents)

### Issue: Polling not detecting payment
**Solutions**:
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check if webhook updated the database
4. Try manual "Provjerio sam uplatu" button

## 📊 Monitoring

### Key Metrics to Track
- Payment link creation success rate
- Webhook delivery success rate
- Average time from payment to confirmation
- Failed payment attempts
- Amount mismatch errors

### Database Queries

```sql
-- Orders awaiting payment
SELECT order_number, created_at, ukupno
FROM orders
WHERE nacin_placanja = 'revolut' AND placeno = false
ORDER BY created_at DESC;

-- Recent paid orders
SELECT order_number, datum_placanja, ukupno
FROM orders
WHERE placeno = true
ORDER BY datum_placanja DESC
LIMIT 10;

-- Payment time analysis
SELECT 
  order_number,
  created_at,
  datum_placanja,
  EXTRACT(EPOCH FROM (datum_placanja - created_at)) / 60 as minutes_to_pay
FROM orders
WHERE placeno = true AND nacin_placanja = 'revolut'
ORDER BY created_at DESC;
```

## 🚀 Next Steps

1. **Test in Production**
   - Create real test order
   - Complete payment with small amount
   - Verify entire flow works

2. **Update Admin Panel**
   - Show payment status in order list
   - Add manual payment confirmation button
   - Display payment timestamp

3. **Customer Communication**
   - Update order confirmation email
   - Add payment instructions
   - Include payment link in email

4. **Analytics**
   - Track payment conversion rate
   - Monitor payment times
   - Identify drop-off points

## 📞 Support

If you encounter issues:
1. Check Edge Function logs
2. Review webhook delivery in Revolut dashboard
3. Test with manual curl commands
4. Check database order status directly

## 🎉 Success Criteria

Your Revolut payment integration is working correctly when:
- ✅ Payment links show amount in cents
- ✅ QR codes are generated and scannable
- ✅ Webhooks are received and processed
- ✅ Orders are automatically marked as paid
- ✅ Frontend updates without manual refresh
- ✅ Customers receive confirmation
- ✅ Admin can see payment status

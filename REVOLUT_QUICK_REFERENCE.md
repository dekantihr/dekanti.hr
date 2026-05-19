# Revolut Payment - Quick Reference Card

## 🚀 Quick Start

### 1. Configure Revolut (One-time setup)
```
Revolut Business Dashboard → Settings → Webhooks
Add: https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/revolut-webhook
Subscribe to: ORDER_COMPLETED
```

### 2. Test Payment
```
1. Create order on website
2. Select Revolut payment
3. Check payment link format: revolut.me/dekantihr/{amount_in_cents}
4. Complete payment
5. Verify auto-confirmation
```

## 💡 Key Concepts

### Amount Format
```
10 EUR    → 1000 cents
10.50 EUR → 1050 cents
0.99 EUR  → 99 cents
```

### Payment Flow
```
Order Created (unpaid) → Payment Link → User Pays → Webhook → Order Paid ✓
```

### Validation Methods
1. **Automatic Polling** - Every 3 seconds
2. **Webhook** - Instant notification from Revolut
3. **Manual Check** - User clicks button

## 🔧 Useful Commands

### View Logs
```bash
# Payment creation logs
supabase functions logs create-revolut-payment

# Webhook logs
supabase functions logs revolut-webhook
```

### Test Webhook
```bash
curl -X POST https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/revolut-webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"ORDER_COMPLETED","merchant_order_ext_ref":"HR-2026-123456","amount":1050,"state":"COMPLETED"}'
```

### Check Order Status
```sql
SELECT order_number, placeno, datum_placanja, ukupno
FROM orders
WHERE order_number = 'HR-2026-XXXXXX';
```

## 📋 Checklist for Each Order

- [ ] Payment link shows amount in cents
- [ ] QR code is displayed
- [ ] User completes payment
- [ ] Webhook received (check logs)
- [ ] Order marked as paid
- [ ] Frontend shows confirmation

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Wrong amount | Check cents conversion: `Math.round(amount * 100)` |
| No webhook | Verify URL in Revolut dashboard |
| Not updating | Check polling in browser console |
| Amount mismatch | Verify order total matches payment |

## 📊 Monitor These

```sql
-- Unpaid Revolut orders
SELECT COUNT(*) FROM orders 
WHERE nacin_placanja = 'revolut' AND placeno = false;

-- Average payment time
SELECT AVG(EXTRACT(EPOCH FROM (datum_placanja - created_at)) / 60) as avg_minutes
FROM orders 
WHERE placeno = true AND nacin_placanja = 'revolut';
```

## 🎯 Success Indicators

✅ Payment link format: `revolut.me/dekantihr/{cents}`  
✅ QR code visible and scannable  
✅ Webhook logs show "Payment confirmed"  
✅ Order `placeno = true` within 10 seconds  
✅ Frontend updates automatically  

## 📞 Need Help?

1. Check `REVOLUT_SETUP_GUIDE.md` for detailed steps
2. Review `REVOLUT_PAYMENT_IMPLEMENTATION.md` for technical details
3. Check Edge Function logs for errors
4. Verify webhook configuration in Revolut dashboard

## 🔗 Important URLs

- **Webhook**: `https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/revolut-webhook`
- **Payment Creation**: `https://rfstxhlbnsdsiovtrroj.supabase.co/functions/v1/create-revolut-payment`
- **Revolut Dashboard**: `https://business.revolut.com`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/rfstxhlbnsdsiovtrroj`

---

**Remember**: Amount must be in cents! 10 EUR = 1000 cents

# 🚀 Quick Start — Test Supabase in 5 Minutes

## Step 1: Start Dev Server

```bash
npm run dev
```

## Step 2: Open Test Page

Go to: **http://localhost:5173/test-supabase**

## Step 3: Run Tests

Click any button to test:

### 🎯 Must-Test Features

1. **📦 Get All Products** — Should return 10 products
2. **🎟️ Valid Coupon** — Test DOBRODOSLI10 coupon
3. **🛒 Create Order** — Creates a test order
4. **🔍 Get Order** — Fetches the created order

## Step 4: Check Results

- ✅ **Green** = Success
- ❌ **Red** = Failed
- Check browser console (`F12`) for detailed logs
- Results show full JSON data

## Step 5: Verify in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/editor

**Check Orders Table:**
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
```

**Check Order Items:**
```sql
SELECT 
  o.order_number,
  oi.naziv_proizvoda,
  oi.cijena,
  oi.kolicina
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY o.created_at DESC;
```

---

## ✅ Expected Results

| Test | Expected | Time |
|------|----------|------|
| Get Products | 10 products | ~500ms |
| Valid Coupon | valid: true, 10% discount | ~200ms |
| Create Order | Order number HR-2026-XXXXXX | ~800ms |
| Get Order | Full order with items | ~400ms |

---

## 🐛 If Something Fails

### 1. Check Environment Variables
```bash
cat .env
# Should show VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 2. Restart Dev Server
```bash
# Ctrl+C to stop
npm run dev
```

### 3. Check Supabase Connection
Open browser console and run:
```javascript
import { supabase } from './src/utils/supabase';
const { data } = await supabase.from('products').select('count');
console.log('Connected:', data);
```

### 4. View Detailed Logs
- Open browser console (`F12`)
- Look for error messages
- Check Network tab for failed requests

---

## 🎯 What Each Test Does

### Products Tests
- **Get All Products** → Fetches all 10 products with brands and sizes
- **Get Featured** → Returns only featured products (5)
- **Get by Slug** → Fetches Dior Sauvage by slug
- **Filter Muški** → Returns only men's fragrances
- **Search** → Searches for "Sauvage"

### Coupon Tests
- **Valid Coupon** → Tests DOBRODOSLI10 (10% off, min 15€)
- **Invalid Coupon** → Tests fake coupon code
- **Below Min** → Tests coupon with order below 15€

### Order Tests
- **Create Order** → Creates order with 2 items
- **Get Order** → Fetches order by order number

### Other Tests
- **Get Brands** → Returns 5 brands
- **Get Categories** → Returns 10 categories
- **Newsletter** → Subscribes random email

---

## 📊 Success Criteria

✅ All tests show green checkmarks  
✅ Orders appear in Supabase dashboard  
✅ No errors in browser console  
✅ Toast notifications appear  
✅ JSON results display correctly  

---

## 🎉 Next Steps

Once all tests pass:

1. **Integrate into CatalogPage** — Replace static data with `api.getProducts()`
2. **Update CheckoutPage** — Use `api.createOrder()` for real orders
3. **Add Real-time Updates** — Subscribe to order status changes
4. **Implement Authentication** — Use Supabase Auth

---

## 📚 Full Documentation

- **Complete Testing Guide**: `TESTING_GUIDE.md`
- **Supabase Setup**: `SUPABASE_SETUP_COMPLETE.md`
- **API Service**: `src/services/api.ts`

---

**That's it! You're ready to test! 🚀**

Open http://localhost:5173/test-supabase and start clicking buttons!

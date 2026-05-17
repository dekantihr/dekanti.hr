# 🧪 Test Orders RIGHT NOW

## 🎯 Quick Test: Create Real Supabase Order

### Step 1: Open Test Page
Go to: **http://localhost:5173/test-supabase**

### Step 2: Click "Create Order" Button
This will create a **REAL order in Supabase**

### Step 3: Check Supabase Dashboard
Go to: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/editor

Click **orders** table → You'll see your new order!

---

## 📊 Current Situation

### ❌ Old Orders (Mock Data)
The orders you see in AdminPanel are **fake/static** data:
- HR-2024-000001 (Ivan Perić)
- HR-2024-000002 (Maja Novak)
- HR-2024-000003 (Tomislav Babić)
- HR-2024-000004 (Petra Šimić)

These are hardcoded in `src/store/cartStore.ts` and **NOT in Supabase**.

### ✅ Real Orders (Supabase)
You already have **1 real order** in Supabase:
- **HR-2026-466867** (Test Korisnik) — Created from test page!

---

## 🔄 How to See REAL Orders in AdminPanel

### Option 1: Quick Test (See Real Orders Now)

Open browser console (`F12`) and run:

```javascript
// Import API
import { api } from './src/services/api';

// Fetch real orders from Supabase
const realOrders = await api.getUserOrders(3); // User ID 3 = Ivan Perić
console.log('Real Supabase orders:', realOrders);
```

### Option 2: Update AdminPanel (Connect to Supabase)

I'll create an updated AdminPanel that shows **real Supabase orders** instead of mock data.

---

## 🧪 Create More Test Orders

### Method 1: Use Test Page
1. Go to http://localhost:5173/test-supabase
2. Click **"Create Order"** button
3. Check Supabase dashboard → New order appears!

### Method 2: Use Browser Console
```javascript
import { api } from './src/services/api';

const order = await api.createOrder({
  user_id: null,
  ime: 'Novi',
  prezime: 'Kupac',
  email: 'novi@test.com',
  telefon: '+385911111111',
  adresa: 'Nova ulica 1',
  grad: 'Zagreb',
  postanski_broj: '10000',
  nacin_dostave: 'hp_posta24',
  nacin_placanja: 'pouzecem',
  cijena_dostave: 4.50,
  subtotal: 25.99,
  popust_iznos: 0,
  ukupno: 30.49,
  items: [
    {
      product_size_id: 1,
      naziv_proizvoda: 'Dior Sauvage EDP',
      brand_naziv: 'Dior',
      ml: 5,
      cijena: 8.99,
      kolicina: 1
    }
  ]
});

console.log('Order created:', order.order_number);
```

---

## 📋 Verify Orders in Supabase

### SQL Query to See All Orders
```sql
SELECT 
  order_number,
  ime || ' ' || prezime as kupac,
  email,
  status,
  ukupno,
  created_at
FROM orders 
ORDER BY created_at DESC;
```

### SQL Query to See Order Items
```sql
SELECT 
  o.order_number,
  oi.naziv_proizvoda,
  oi.brand_naziv,
  oi.ml,
  oi.cijena,
  oi.kolicina
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY o.created_at DESC;
```

---

## ✅ Next Steps

1. **Create test orders** using test page
2. **Verify in Supabase** dashboard
3. **Update AdminPanel** to show real orders (I'll do this next)

---

**Want me to update AdminPanel to show REAL Supabase orders instead of mock data?**

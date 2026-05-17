# 🧪 Complete Supabase Testing Guide — AromaHR

## 🎯 Overview

This guide will walk you through testing **every single feature** of your Supabase integration, from products to orders to coupons.

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open the Test Page

Navigate to: **http://localhost:5173/test-supabase**

### 3. Open Browser Console

Press `F12` or `Ctrl+Shift+I` to see detailed logs.

---

## 📋 Test Categories

### ✅ Products (5 Tests)

#### 1. **Get All Products**
- **What it tests**: Fetches all active products with brands and sizes
- **Expected result**: 10 products returned
- **What to check**:
  - Each product has `naziv`, `slug`, `koncentracija`, `spol`
  - Each product has `brands` object with `naziv` and `logo_url`
  - Each product has `product_sizes` array with prices

**Example Result:**
```json
[
  {
    "id": 1,
    "naziv": "Sauvage EDP",
    "slug": "dior-sauvage-edp",
    "koncentracija": "EDP",
    "spol": "muški",
    "featured": true,
    "brands": {
      "naziv": "Dior",
      "logo_url": "/images/brands/dior-logo.png"
    },
    "product_sizes": [
      { "velicina_ml": 5, "cijena": 8.99, "zaliha": 25 },
      { "velicina_ml": 10, "cijena": 15.99, "zaliha": 20 }
    ]
  }
]
```

#### 2. **Get Featured Products**
- **What it tests**: Fetches only featured products (limit 5)
- **Expected result**: 5 featured products
- **What to check**: All products have `featured: true`

#### 3. **Get Product by Slug**
- **What it tests**: Fetches single product by slug
- **Expected result**: Dior Sauvage EDP product
- **What to check**:
  - Product has complete details
  - Brand information included
  - All sizes with prices

#### 4. **Filter Products (Muški)**
- **What it tests**: Filters products by gender
- **Expected result**: Only muški products
- **What to check**: All products have `spol: "muški"`

#### 5. **Search Products**
- **What it tests**: Searches products by name
- **Expected result**: Products matching "Sauvage"
- **What to check**: Product names contain "Sauvage"

---

### ✅ Brands & Categories (2 Tests)

#### 6. **Get All Brands**
- **What it tests**: Fetches all active brands
- **Expected result**: 5 brands (Dior, Chanel, Tom Ford, Creed, Maison Margiela)
- **What to check**: Each brand has `naziv`, `opis`, `logo_url`

**Example Result:**
```json
[
  {
    "id": 1,
    "naziv": "Dior",
    "opis": "Christian Dior — jedan od najprepoznatljivijih luksuznih modnih kuća na svijetu.",
    "logo_url": "/images/brands/dior-logo.png",
    "active": true
  }
]
```

#### 7. **Get All Categories**
- **What it tests**: Fetches all active categories
- **Expected result**: 10 categories
- **What to check**: Categories ordered by `sort_order`

---

### ✅ Coupons (3 Tests)

#### 8. **Valid Coupon (DOBRODOSLI10)**
- **What it tests**: Validates a valid coupon code
- **Expected result**: `valid: true` with discount calculation
- **What to check**:
  - `valid: true`
  - `coupon.kod: "DOBRODOSLI10"`
  - `coupon.tip: "postotak"`
  - `coupon.vrijednost: 10`
  - `popust_iznos` calculated correctly (10% of 50€ = 5€)

**Example Result:**
```json
{
  "valid": true,
  "coupon": {
    "id": 1,
    "kod": "DOBRODOSLI10",
    "tip": "postotak",
    "vrijednost": 10,
    "popust_iznos": 5
  }
}
```

#### 9. **Invalid Coupon**
- **What it tests**: Validates an invalid coupon code
- **Expected result**: `valid: false` with error message
- **What to check**:
  - `valid: false`
  - `error: "Kupon nije pronađen"`

#### 10. **Coupon Below Min Amount**
- **What it tests**: Validates coupon with order below minimum
- **Expected result**: `valid: false` with min amount error
- **What to check**:
  - `valid: false`
  - Error mentions minimum amount (15€)

---

### ✅ Orders (2 Tests)

#### 11. **Create Test Order**
- **What it tests**: Creates a complete order with items
- **Expected result**: Order created successfully
- **What to check**:
  - Order has `order_number` (format: `HR-2026-XXXXXX`)
  - Order has `status: "nova"`
  - Order has all customer details
  - Order has correct totals

**Example Result:**
```json
{
  "id": 1,
  "order_number": "HR-2026-123456",
  "status": "nova",
  "ime": "Test",
  "prezime": "Korisnik",
  "email": "test@aromahr.hr",
  "telefon": "+385911234567",
  "adresa": "Testna ulica 123",
  "grad": "Zagreb",
  "postanski_broj": "10000",
  "subtotal": 43.98,
  "cijena_dostave": 4.50,
  "popust_iznos": 0,
  "ukupno": 48.48,
  "created_at": "2026-05-05T12:00:00Z"
}
```

#### 12. **Get Order by Number**
- **What it tests**: Fetches order with all items
- **Expected result**: Complete order with items
- **What to check**:
  - Order details match
  - `order_items` array included
  - Each item has product details

---

### ✅ Newsletter (1 Test)

#### 13. **Subscribe to Newsletter**
- **What it tests**: Subscribes email to newsletter
- **Expected result**: Subscription successful
- **What to check**:
  - `success: true`
  - Email saved to database

---

## 🔍 Manual Testing in Supabase Dashboard

### 1. View Created Orders

Go to: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/editor

**SQL Query:**
```sql
SELECT 
  o.order_number,
  o.status,
  o.ime,
  o.prezime,
  o.email,
  o.ukupno,
  o.created_at,
  COUNT(oi.id) as num_items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.status, o.ime, o.prezime, o.email, o.ukupno, o.created_at
ORDER BY o.created_at DESC;
```

### 2. View Order Items

```sql
SELECT 
  oi.naziv_proizvoda,
  oi.brand_naziv,
  oi.ml,
  oi.cijena,
  oi.kolicina,
  o.order_number
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY o.created_at DESC;
```

### 3. Check Product Inventory

```sql
SELECT 
  p.naziv,
  ps.velicina_ml,
  ps.cijena,
  ps.zaliha,
  CASE 
    WHEN ps.zaliha = 0 THEN '❌ Out of Stock'
    WHEN ps.zaliha < 5 THEN '⚠️ Low Stock'
    ELSE '✅ In Stock'
  END as status
FROM product_sizes ps
JOIN products p ON p.id = ps.product_id
ORDER BY ps.zaliha ASC;
```

### 4. View Newsletter Subscribers

```sql
SELECT 
  email,
  subscribed,
  created_at
FROM newsletter
WHERE subscribed = true
ORDER BY created_at DESC;
```

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Complete Order Flow

**Steps:**
1. Get all products → Select a product
2. Validate coupon → Apply discount
3. Create order → Get order number
4. Fetch order by number → Verify details

**Test Code:**
```typescript
// 1. Get products
const products = await api.getProducts();
const product = products[0];

// 2. Validate coupon
const couponResult = await api.validateCoupon('DOBRODOSLI10', 50);
const discount = couponResult.valid ? couponResult.coupon.popust_iznos : 0;

// 3. Create order
const order = await api.createOrder({
  user_id: null,
  ime: 'Test',
  prezime: 'User',
  email: 'test@example.com',
  telefon: '+385911234567',
  adresa: 'Test 123',
  grad: 'Zagreb',
  postanski_broj: '10000',
  nacin_dostave: 'hp_posta24',
  nacin_placanja: 'pouzecem',
  cijena_dostave: 4.50,
  subtotal: 50,
  popust_iznos: discount,
  kupon_id: couponResult.valid ? couponResult.coupon.id : null,
  ukupno: 50 - discount + 4.50,
  items: [
    {
      product_size_id: product.product_sizes[0].id,
      naziv_proizvoda: product.naziv,
      brand_naziv: product.brands.naziv,
      ml: product.product_sizes[0].velicina_ml,
      cijena: product.product_sizes[0].cijena,
      kolicina: 1
    }
  ]
});

// 4. Fetch order
const fetchedOrder = await api.getOrderByNumber(order.order_number);
console.log('Order created and fetched:', fetchedOrder);
```

### Scenario 2: Product Search & Filter

**Steps:**
1. Search for "Sauvage"
2. Filter by gender (muški)
3. Filter by brand (Dior)
4. Get featured only

**Test Code:**
```typescript
// Search
const searchResults = await api.getProducts({ search: 'Sauvage' });
console.log('Search results:', searchResults.length);

// Filter by gender
const muskiProducts = await api.getProducts({ spol: 'muški' });
console.log('Muški products:', muskiProducts.length);

// Filter by brand
const diorProducts = await api.getProducts({ brand: 'Dior' });
console.log('Dior products:', diorProducts.length);

// Featured only
const featured = await api.getFeaturedProducts();
console.log('Featured products:', featured.length);
```

### Scenario 3: Coupon Validation Edge Cases

**Test Cases:**
1. ✅ Valid coupon with sufficient amount
2. ❌ Invalid coupon code
3. ❌ Coupon below minimum amount
4. ❌ Expired coupon (if any)
5. ❌ Coupon usage limit reached

**Test Code:**
```typescript
// Valid
const valid = await api.validateCoupon('DOBRODOSLI10', 50);
console.log('Valid:', valid.valid); // true

// Invalid code
const invalid = await api.validateCoupon('FAKE123', 50);
console.log('Invalid:', invalid.valid); // false

// Below minimum
const belowMin = await api.validateCoupon('DOBRODOSLI10', 10);
console.log('Below min:', belowMin.valid); // false
```

---

## 📊 Expected Test Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Get All Products | 10 products | ✅ |
| Get Featured | 5 products | ✅ |
| Get by Slug | 1 product | ✅ |
| Filter Muški | 4-5 products | ✅ |
| Search Sauvage | 1-2 products | ✅ |
| Get Brands | 5 brands | ✅ |
| Get Categories | 10 categories | ✅ |
| Valid Coupon | valid: true | ✅ |
| Invalid Coupon | valid: false | ✅ |
| Below Min Amount | valid: false | ✅ |
| Create Order | Order created | ✅ |
| Get Order | Order fetched | ✅ |
| Newsletter | Subscribed | ✅ |

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
```bash
# Check .env file exists
cat .env

# Restart dev server
npm run dev
```

### Issue: "Error fetching products"

**Solution:**
1. Check Supabase dashboard is accessible
2. Verify API keys in `.env`
3. Check browser console for detailed error
4. Run SQL query directly in Supabase SQL Editor

### Issue: "Order creation fails"

**Solution:**
1. Check `product_size_id` exists in database
2. Verify all required fields are provided
3. Check order number is unique
4. View Supabase logs for detailed error

### Issue: "Coupon validation always fails"

**Solution:**
1. Check coupon code is uppercase
2. Verify coupon is active (`aktivan: true`)
3. Check expiry date (`vrijedi_do`)
4. Verify minimum amount requirement

---

## 🎯 Next Steps After Testing

### 1. Integrate API into Existing Pages

**CatalogPage.tsx:**
```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Update CheckoutPage to Use API

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const order = await api.createOrder({
      user_id: user?.id || null,
      ime: form.ime,
      prezime: form.prezime,
      email: form.email,
      telefon: form.telefon,
      adresa: form.adresa,
      grad: form.grad,
      postanski_broj: form.postanskiBroj,
      napomena: form.napomena,
      nacin_dostave: form.nacinDostave,
      nacin_placanja: form.nacinPlacanja,
      cijena_dostave: dostava,
      subtotal,
      popust_iznos: popust,
      kupon_id: coupon?.id,
      ukupno,
      items: items.map(item => ({
        product_size_id: item.sizeId,
        naziv_proizvoda: item.naziv,
        brand_naziv: item.brand,
        ml: item.ml,
        cijena: item.cijena,
        kolicina: item.kolicina
      }))
    });

    toast.success(`Narudžba kreirana: ${order.order_number}`);
    navigate(`/pracenje?order=${order.order_number}`);
  } catch (error) {
    toast.error('Greška pri kreiranju narudžbe');
  }
};
```

### 3. Implement Real-time Features

```typescript
// Subscribe to order updates
useEffect(() => {
  const subscription = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `order_number=eq.${orderNumber}`
    }, (payload) => {
      console.log('Order updated:', payload.new);
      setOrder(payload.new);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [orderNumber]);
```

---

## ✅ Testing Checklist

- [ ] All 13 tests pass on test page
- [ ] Orders visible in Supabase dashboard
- [ ] Order items correctly linked
- [ ] Coupons validate correctly
- [ ] Products fetch with all data
- [ ] Newsletter subscriptions work
- [ ] Browser console shows no errors
- [ ] Toast notifications appear
- [ ] JSON results display correctly

---

## 📚 Resources

- **Test Page**: http://localhost:5173/test-supabase
- **Supabase Dashboard**: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld
- **API Service**: `src/services/api.ts`
- **Supabase Client**: `src/utils/supabase.ts`

---

**Happy Testing! 🚀**

If all tests pass, your Supabase integration is **fully working** and ready for production use!

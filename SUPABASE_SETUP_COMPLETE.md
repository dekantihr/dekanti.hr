# ✅ Supabase Setup Complete — AromaHR

## 🎉 Connection Status: ACTIVE

Your AromaHR project is now fully connected to Supabase!

---

## 📊 Database Overview

### ✅ What's Been Set Up

1. **Complete Schema** — All 16 tables created with proper relationships
2. **Performance Indexes** — 40+ indexes for optimal query performance
3. **Sample Data** — 10 products, 5 users, 3 coupons, 6 newsletter subscribers
4. **Views** — Aggregate views for ratings, sales stats, and daily revenue
5. **Triggers** — Auto-update timestamps on data changes
6. **Extensions** — UUID support and full-text search (pg_trgm)

### 📋 Database Tables

| Table | Rows | Description |
|-------|------|-------------|
| **brands** | 5 | Dior, Chanel, Tom Ford, Creed, Maison Margiela |
| **products** | 10 | Luxury fragrance decants |
| **product_sizes** | 40 | 4 sizes per product (5ml, 10ml, 20ml, 30ml) |
| **product_categories** | 20 | Product-category relationships |
| **categories** | 10 | Muški, Ženski, Unisex, Bestselleri, etc. |
| **fragrance_notes** | 45 | Top, heart, and base notes |
| **users** | 5 | 2 admins + 3 test customers |
| **coupons** | 3 | DOBRODOSLI10, LJETO15, PROMO20 |
| **newsletter** | 6 | Newsletter subscribers |
| **orders** | 0 | Ready for orders |
| **order_items** | 0 | Ready for order items |
| **wishlist** | 0 | Ready for wishlists |
| **reviews** | 0 | Ready for reviews |
| **product_images** | 0 | Ready for images |
| **product_notes** | 0 | Ready for fragrance notes |
| **admin_logs** | 0 | Ready for admin actions |

---

## 🔑 Connection Details

### Supabase Project
- **URL**: `https://gqmvyggenreowrpprpld.supabase.co`
- **Region**: Auto-selected
- **Database**: PostgreSQL 15+

### API Keys (Already in `.env`)
```env
VITE_SUPABASE_URL=https://gqmvyggenreowrpprpld.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test Users

#### Admin Accounts
```
Email: admin@aromahr.hr
Password: Admin123!
Role: admin

Email: superadmin@aromahr.hr
Password: Admin123!
Role: admin
```

#### Customer Accounts
```
Email: ivan.peric@email.com
Password: Kupac123!
Role: kupac

Email: maja.novak@email.com
Password: Kupac123!
Role: kupac

Email: tomislav.babic@email.com
Password: Kupac123!
Role: kupac
```

---

## 🚀 How to Use Supabase in Your App

### 1. Import the Supabase Client

```typescript
import { supabase } from './utils/supabase';
```

### 2. Fetch Products

```typescript
// Get all active products
const { data: products, error } = await supabase
  .from('products')
  .select(`
    *,
    brands (naziv, logo_url),
    product_sizes (velicina_ml, cijena, zaliha)
  `)
  .eq('active', true)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching products:', error);
} else {
  console.log('Products:', products);
}
```

### 3. Get Product by Slug

```typescript
const { data: product, error } = await supabase
  .from('products')
  .select(`
    *,
    brands (naziv, logo_url),
    product_sizes (id, velicina_ml, cijena, zaliha, sku)
  `)
  .eq('slug', 'dior-sauvage-edp')
  .single();
```

### 4. Filter Products

```typescript
// Filter by brand and gender
const { data: products, error } = await supabase
  .from('products')
  .select('*, brands (naziv)')
  .eq('active', true)
  .eq('spol', 'muški')
  .in('brand_id', [1, 4]) // Dior and Creed
  .order('featured', { ascending: false });
```

### 5. Search Products

```typescript
// Full-text search
const { data: products, error } = await supabase
  .from('products')
  .select('*, brands (naziv)')
  .textSearch('naziv', 'sauvage', { type: 'websearch' });
```

### 6. Create Order

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    user_id: userId, // or null for guest
    order_number: `HR-${new Date().getFullYear()}-${Math.random().toString().slice(2, 8)}`,
    status: 'nova',
    ime: 'Ivan',
    prezime: 'Perić',
    email: 'ivan@example.com',
    telefon: '+385981234567',
    adresa: 'Vukovarska 23',
    grad: 'Split',
    postanski_broj: '21000',
    nacin_dostave: 'hp_posta24',
    nacin_placanja: 'pouzecem',
    cijena_dostave: 4.50,
    subtotal: 43.98,
    popust_iznos: 0,
    ukupno: 48.48
  })
  .select()
  .single();
```

### 7. Validate Coupon

```typescript
const { data: coupon, error } = await supabase
  .from('coupons')
  .select('*')
  .eq('kod', 'DOBRODOSLI10')
  .eq('aktivan', true)
  .single();

if (coupon) {
  // Check if coupon is valid
  const isValid = 
    (!coupon.vrijedi_do || new Date(coupon.vrijedi_do) > new Date()) &&
    (!coupon.max_koristenja || coupon.broj_koristenja < coupon.max_koristenja);
  
  if (isValid) {
    // Calculate discount
    const discount = coupon.tip === 'postotak'
      ? subtotal * (coupon.vrijednost / 100)
      : coupon.vrijednost;
    
    console.log('Discount:', discount);
  }
}
```

### 8. Authentication (Future)

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      ime: 'Ivan',
      prezime: 'Perić'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## 📁 Files Created

### 1. `.env` — Environment Variables
Contains Supabase URL and API keys.

### 2. `src/utils/supabase.ts` — Supabase Client
Exports configured Supabase client and TypeScript types.

### 3. Database Migrations
- `create_aromahr_schema` — All tables, types, triggers, views
- `create_aromahr_indexes` — Performance indexes
- `seed_brands_categories_notes` — Brands, categories, fragrance notes
- `seed_users_coupons` — Users, coupons, newsletter
- Products seeded via direct SQL

---

## 🔄 Migration from Static Data to Supabase

### Current State
- ✅ Static data in `src/data/products.ts`
- ✅ localStorage for cart, wishlist, auth
- ✅ Custom hooks in `src/store/cartStore.ts`

### Migration Strategy (Phase 1)

#### Step 1: Create API Service Layer
```typescript
// src/services/api.ts
import { supabase } from '../utils/supabase';
import type { Product } from '../data/products';

export const api = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (naziv, logo_url),
        product_sizes (id, velicina_ml, cijena, zaliha)
      `)
      .eq('active', true);
    
    if (error) throw error;
    return data;
  },

  async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (naziv, logo_url),
        product_sizes (id, velicina_ml, cijena, zaliha, sku)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Orders
  async createOrder(orderData: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Coupons
  async validateCoupon(kod: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('kod', kod.toUpperCase())
      .eq('aktivan', true)
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

#### Step 2: Update Product Hooks
```typescript
// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}
```

#### Step 3: Update Components
```typescript
// Before (static data)
import { PRODUCTS } from '../data/products';

// After (Supabase)
import { useProducts } from '../hooks/useProducts';

function CatalogPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 🛠️ Supabase Dashboard

### Access Your Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `gqmvyggenreowrpprpld`
3. Navigate to:
   - **Table Editor** — View/edit data
   - **SQL Editor** — Run custom queries
   - **Database** — Manage schema
   - **API Docs** — Auto-generated API documentation

### Useful SQL Queries

#### Get All Products with Brands
```sql
SELECT 
  p.id, 
  p.naziv, 
  p.slug, 
  b.naziv as brand,
  p.koncentracija,
  p.spol,
  p.featured,
  COUNT(ps.id) as num_sizes
FROM products p
JOIN brands b ON b.id = p.brand_id
LEFT JOIN product_sizes ps ON ps.product_id = p.id
GROUP BY p.id, p.naziv, p.slug, b.naziv, p.koncentracija, p.spol, p.featured
ORDER BY p.featured DESC, p.created_at DESC;
```

#### Check Product Inventory
```sql
SELECT 
  p.naziv,
  ps.velicina_ml,
  ps.cijena,
  ps.zaliha,
  CASE 
    WHEN ps.zaliha = 0 THEN 'Out of Stock'
    WHEN ps.zaliha < 5 THEN 'Low Stock'
    ELSE 'In Stock'
  END as status
FROM product_sizes ps
JOIN products p ON p.id = ps.product_id
ORDER BY ps.zaliha ASC;
```

#### Get User Orders
```sql
SELECT 
  o.order_number,
  o.status,
  o.ukupno,
  o.created_at,
  u.email,
  u.ime,
  u.prezime
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
ORDER BY o.created_at DESC;
```

---

## 🔐 Security & RLS (Row Level Security)

### Current State
- ✅ RLS is **disabled** for development
- ✅ All tables are publicly accessible via anon key

### Production Setup (Future)

#### Enable RLS
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

#### Create Policies
```sql
-- Public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (active = true);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 📊 Next Steps

### Immediate (Phase 1)
1. ✅ **Database Setup** — COMPLETE
2. ⏳ **Create API Service Layer** — `src/services/api.ts`
3. ⏳ **Update Product Hooks** — Replace static data with Supabase
4. ⏳ **Test Product Fetching** — Verify data loads correctly

### Short-term (Phase 2)
5. ⏳ **Implement Authentication** — Supabase Auth
6. ⏳ **Order Management** — Create/track orders
7. ⏳ **Wishlist Sync** — Move from localStorage to database
8. ⏳ **Review System** — Enable product reviews

### Long-term (Phase 3)
9. ⏳ **Real-time Features** — WebSocket for order updates
10. ⏳ **Image Upload** — Supabase Storage for product images
11. ⏳ **Email Notifications** — Order confirmations
12. ⏳ **Payment Integration** — Stripe or CorvusPay

---

## 🐛 Troubleshooting

### Connection Issues
```typescript
// Test connection
import { supabase } from './utils/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('products')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase!');
  }
}

testConnection();
```

### CORS Issues
- Supabase automatically handles CORS
- If issues persist, check Supabase Dashboard → Settings → API

### Environment Variables Not Loading
```bash
# Restart Vite dev server
npm run dev
```

---

## 📚 Resources

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Supabase Dashboard
- **Project URL**: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld
- **Table Editor**: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/editor
- **SQL Editor**: https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/sql

### Support
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## ✅ Summary

Your AromaHR project is now **fully connected to Supabase**! 🎉

**What's Working:**
- ✅ Database schema created (16 tables)
- ✅ Sample data seeded (10 products, 5 users, 3 coupons)
- ✅ Performance indexes applied
- ✅ Supabase client configured
- ✅ Environment variables set
- ✅ TypeScript types defined

**Next Action:**
Start migrating from static data to Supabase by creating the API service layer in `src/services/api.ts`.

**Need Help?**
Check the examples above or refer to the Supabase documentation.

---

**Happy coding! 🚀**

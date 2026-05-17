---
title: AromaHR API Integration Guide
inclusion: auto
---

# API Integration Guide

## Current State
**No backend API** — All data is static (PRODUCTS array in src/data/products.ts)

## Future Backend Integration

### Authentication Endpoints

#### POST /api/auth/register
```typescript
Request:
{
  email: string;
  password: string;
  ime: string;
  prezime: string;
  newsletter_subscribed?: boolean;
}

Response:
{
  user: {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    role: 'admin' | 'kupac';
  };
  token: string; // JWT
}
```

#### POST /api/auth/login
```typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  user: {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    role: 'admin' | 'kupac';
  };
  token: string; // JWT
}
```

#### POST /api/auth/forgot-password
```typescript
Request:
{
  email: string;
}

Response:
{
  message: string;
}
```

#### POST /api/auth/reset-password
```typescript
Request:
{
  token: string;
  password: string;
}

Response:
{
  message: string;
}
```

### Product Endpoints

#### GET /api/products
```typescript
Query Params:
{
  brand?: string;
  spol?: 'muški' | 'ženski' | 'unisex';
  sezona?: 'proljeće' | 'ljeto' | 'jesen' | 'zima' | 'sve';
  min_cijena?: number;
  max_cijena?: number;
  featured?: boolean;
  search?: string;
  sort?: 'cijena_asc' | 'cijena_desc' | 'naziv' | 'ocjena';
  page?: number;
  limit?: number;
}

Response:
{
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
```

#### GET /api/products/:slug
```typescript
Response:
{
  product: Product;
  related: Product[]; // Similar products
}
```

### Cart & Checkout Endpoints

#### POST /api/orders
```typescript
Request:
{
  user_id?: number; // Optional for guest checkout
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  napomena?: string;
  nacin_placanja: 'pouzecem' | 'bankovna';
  kupon?: string;
  items: {
    product_size_id: number;
    kolicina: number;
  }[];
}

Response:
{
  order: {
    order_number: string;
    status: 'nova';
    ukupno: number;
    created_at: string;
  };
}
```

#### GET /api/orders/:orderNumber
```typescript
Response:
{
  order: Order;
}
```

#### GET /api/orders (authenticated)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Response:
{
  orders: Order[];
}
```

### Coupon Endpoints

#### POST /api/coupons/validate
```typescript
Request:
{
  kod: string;
  subtotal: number;
}

Response:
{
  valid: boolean;
  coupon?: {
    kod: string;
    tip: 'postotak' | 'fiksni';
    vrijednost: number;
    popust_iznos: number;
  };
  error?: string;
}
```

### Review Endpoints

#### POST /api/reviews
```typescript
Request:
{
  product_id: number;
  user_id: number;
  ocjena: number; // 1-5
  naslov: string;
  tekst: string;
}

Response:
{
  review: Review;
}
```

#### GET /api/reviews/:productId
```typescript
Query Params:
{
  page?: number;
  limit?: number;
}

Response:
{
  reviews: Review[];
  total: number;
  avg_ocjena: number;
}
```

### Wishlist Endpoints

#### GET /api/wishlist (authenticated)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Response:
{
  wishlist: Product[];
}
```

#### POST /api/wishlist/:productId (authenticated)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Response:
{
  message: string;
}
```

#### DELETE /api/wishlist/:productId (authenticated)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Response:
{
  message: string;
}
```

### Admin Endpoints

#### GET /api/admin/orders (admin only)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Query Params:
{
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

Response:
{
  orders: Order[];
  total: number;
}
```

#### PATCH /api/admin/orders/:orderNumber (admin only)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Request:
{
  status?: OrderStatus;
  tracking_broj?: string;
}

Response:
{
  order: Order;
}
```

#### GET /api/admin/analytics (admin only)
```typescript
Headers:
{
  Authorization: 'Bearer {token}';
}

Response:
{
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  top_products: Product[];
  recent_orders: Order[];
}
```

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string; // 'VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED', etc.
    message: string;
    details?: any;
  };
}
```

### HTTP Status Codes
- **200** — Success
- **201** — Created
- **400** — Bad Request (validation error)
- **401** — Unauthorized (missing/invalid token)
- **403** — Forbidden (insufficient permissions)
- **404** — Not Found
- **409** — Conflict (duplicate email, etc.)
- **500** — Internal Server Error

## Authentication Flow

### JWT Token
- Store in localStorage: `localStorage.setItem('token', token)`
- Include in headers: `Authorization: Bearer {token}`
- Refresh on expiry (future feature)

### Protected Routes
```typescript
// Check if user is authenticated
const isAuthenticated = !!localStorage.getItem('token');

// Redirect to login if not authenticated
if (!isAuthenticated) {
  navigate('/prijava');
}
```

## Migration Strategy

### Phase 1: Static to API
1. Replace PRODUCTS array with API calls
2. Update useCart to sync with backend
3. Implement authentication
4. Migrate orders to backend

### Phase 2: Real-time Features
1. WebSocket for order status updates
2. Live inventory updates
3. Admin notifications

### Phase 3: Advanced Features
1. Payment gateway integration
2. Email notifications
3. Advanced analytics
4. Recommendation engine

## API Client Setup

### Axios Configuration
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/prijava';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Environment Variables
```env
VITE_API_URL=https://api.aromahr.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

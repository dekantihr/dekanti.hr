---
title: AromaHR Project Structure & Architecture
inclusion: auto
---

# Project Structure

```
aromahr/
├── public/
│   └── sql/                    # Database schema & seed data
│       ├── schema.sql          # PostgreSQL schema
│       ├── seed.sql            # Sample data
│       └── indexes.sql         # Database indexes
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx          # Global navigation
│   │   ├── Footer.tsx          # Global footer
│   │   └── ProductCard.tsx     # Product card component
│   ├── pages/                  # Route-level pages
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── CatalogPage.tsx     # Product catalog with filters
│   │   ├── ProductPage.tsx     # Product detail page
│   │   ├── CartPage.tsx        # Shopping cart
│   │   ├── CheckoutPage.tsx    # Multi-step checkout
│   │   ├── TrackingPage.tsx    # Order tracking
│   │   ├── AuthPage.tsx        # Login/Register/Forgot
│   │   ├── ProfilePage.tsx     # User profile
│   │   ├── AdminPanel.tsx      # Admin dashboard
│   │   └── SimplePages.tsx     # About, 404
│   ├── store/                  # State management
│   │   └── cartStore.ts        # Cart, wishlist, auth, orders hooks
│   ├── data/                   # Static data
│   │   └── products.ts         # Product catalog, brands, coupons
│   ├── utils/                  # Helper functions
│   │   └── cn.ts               # Class name utility (clsx + tailwind-merge)
│   ├── App.tsx                 # Router & global state
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles (@import tailwindcss)
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── .kiro/                      # Kiro AI system
    ├── steering/               # Context & guidelines
    └── agents/                 # Custom agents
```

## Architecture Patterns

### Component Hierarchy
```
App (BrowserRouter + Global State)
├── Navbar (itemCount, wishlistCount, user, onLogout)
├── Routes
│   ├── HomePage (wishlist, onWishlistToggle, onAddToCart)
│   ├── CatalogPage (wishlist, onWishlistToggle, onAddToCart)
│   ├── ProductPage (wishlist, onWishlistToggle, onAddToCart, user)
│   ├── CartPage (items, coupon, onCouponSet, onUpdateQuantity, onRemoveItem, subtotal, dostava, popust, ukupno)
│   ├── CheckoutPage (items, coupon, subtotal, dostava, popust, ukupno, user, onOrderComplete, onClearCart)
│   ├── TrackingPage (orders)
│   ├── AuthPage (mode, onLogin)
│   ├── ProfilePage (user, orders, wishlist, onWishlistToggle)
│   └── AdminPanel (user, orders, onLogout)
└── Footer
```

### Data Flow
1. **App.tsx** manages global state via custom hooks
2. **Props** passed down to pages
3. **Callbacks** (onAddToCart, onWishlistToggle) passed to components
4. **ProductCard** handles user interactions
5. **State** persisted to localStorage automatically

### State Management
- **useCart()** — Cart items, coupon, calculations (subtotal, dostava, popust, ukupno)
- **useWishlist()** — Wishlist array with toggle/check methods
- **useAuth()** — User login/logout with localStorage persistence
- **useOrders()** — Order history with sample data

### Routing Structure
```
/ (HomePage)
├── /parfemi (CatalogPage)
├── /parfemi/:slug (ProductPage)
├── /kosarica (CartPage)
├── /naruci (CheckoutPage)
├── /pracenje (TrackingPage)
├── /prijava (AuthPage mode="login")
├── /registracija (AuthPage mode="register")
├── /zaboravljena-lozinka (AuthPage mode="forgot")
├── /profil (ProfilePage)
├── /o-nama (AboutPage)
├── /admin (AdminPanel)
└── * (NotFoundPage)
```

## File Naming Conventions
- **Components**: PascalCase (ProductCard.tsx, HomePage.tsx)
- **Hooks**: camelCase with 'use' prefix (useCart.ts, useWishlist.ts)
- **Utils**: camelCase (cn.ts)
- **Data**: camelCase (products.ts)
- **Constants**: UPPER_SNAKE_CASE (PRODUCTS, BRANDS, CART_KEY)

## Import Patterns
```typescript
// React & hooks
import { useState, useEffect, useCallback } from 'react';

// Router
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// Icons
import { Heart, Star, ShoppingBag, ChevronRight } from 'lucide-react';

// Toast
import toast from 'react-hot-toast';

// Utils
import { cn } from '../utils/cn';

// Data
import { PRODUCTS, BRANDS } from '../data/products';

// Store
import { useCart, useWishlist, useAuth } from '../store/cartStore';

// Components
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
```

## Component Structure Template
```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Props interface at top
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Handlers
  const handleAction = () => {
    // Logic
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## Key Architectural Decisions

### Why Custom Hooks?
- Encapsulate state logic
- Reusable across components
- localStorage persistence built-in
- Type-safe with TypeScript

### Why localStorage?
- No backend yet
- Persistent cart/wishlist
- Fast prototyping
- Easy migration to backend later

### Why Static Data?
- Rapid development
- No API dependencies
- Easy to test
- Ready for backend integration

### Why Tailwind CSS?
- Utility-first approach
- No CSS file management
- Consistent design system
- Fast prototyping
- Small bundle size with purging

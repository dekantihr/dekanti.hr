---
title: AromaHR Code Conventions & Best Practices
inclusion: auto
---

# Code Conventions

## TypeScript

### Type Definitions
```typescript
// Always define interfaces for props
interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (id: number) => void;
  onAddToCart: (product: Product, sizeId: number) => void;
}

// Use type for unions
type Step = 'podaci' | 'dostava' | 'pregled' | 'potvrda';
type OrderStatus = 'nova' | 'u_obradi' | 'poslano' | 'isporuceno' | 'otkazano';

// Export interfaces from data files
export interface Product {
  id: number;
  naziv: string;
  slug: string;
  // ...
}
```

### Naming Conventions
- **Components**: PascalCase (ProductCard, HomePage)
- **Functions**: camelCase (handleAddToCart, validateForm)
- **Variables**: camelCase (itemCount, isWishlisted)
- **Constants**: UPPER_SNAKE_CASE (PRODUCTS, BRANDS, CART_KEY)
- **Types/Interfaces**: PascalCase (Product, CartItem, AppliedCoupon)
- **Enums**: PascalCase (OrderStatus, UserRole)

### Function Patterns
```typescript
// Use arrow functions for components
export default function Component({ prop }: Props) {
  // ...
}

// Use arrow functions for handlers
const handleClick = () => {
  // ...
};

// Use useCallback for callbacks passed to children
const handleAddToCart = useCallback((product: Product, sizeId: number) => {
  // ...
}, [dependencies]);
```

## React Patterns

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';

// 2. Interface
interface Props {
  // ...
}

// 3. Component
export default function Component({ prop }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleAction = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### State Management
```typescript
// Use useState for local state
const [count, setCount] = useState(0);

// Use useEffect for side effects
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(value));
}, [value]);

// Use useCallback for memoized callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Use useMemo for expensive calculations (sparingly)
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

### Conditional Rendering
```typescript
// Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// Logical AND for single condition
{error && <ErrorMessage />}

// Early return for complex conditions
if (!user) {
  return <LoginPrompt />;
}

return <Dashboard />;
```

### Event Handlers
```typescript
// Prevent default for links/forms
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

// Stop propagation for nested clicks
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  // ...
};
```

## Tailwind CSS

### Class Organization
```typescript
// Order: layout → spacing → sizing → colors → typography → effects
<div className="
  flex items-center justify-between
  p-4 gap-2
  w-full h-auto
  bg-[#111111] border border-[#c9a96e]/10
  text-[#e8d5a3] text-sm font-semibold
  rounded-xl shadow-lg
  hover:bg-[#1a1a1a] transition-colors
">
```

### Custom Colors
```typescript
// Use hex values for brand colors
bg-[#0a0a0a]      // Near-black background
bg-[#111111]      // Card backgrounds
bg-[#c9a96e]      // Gold accent
text-[#e8d5a3]    // Cream text

// Use opacity modifiers
text-[#e8d5a3]/50  // 50% opacity
border-[#c9a96e]/10 // 10% opacity
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

### Hover & Focus States
```typescript
// Use group for parent-child hover
<div className="group">
  <img className="group-hover:scale-110 transition-transform" />
</div>

// Focus states for accessibility
<input className="
  focus:outline-none
  focus:ring-2 focus:ring-[#c9a96e]
  focus:border-[#c9a96e]
" />
```

## Data Handling

### localStorage Patterns
```typescript
// Read with fallback
const [items, setItems] = useState<CartItem[]>(() => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});

// Write on state change
useEffect(() => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}, [items]);
```

### Form Validation
```typescript
// Validate before submission
const validateForm = () => {
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    toast.error('Unesite valjanu email adresu');
    return false;
  }
  return true;
};
```

### Toast Notifications
```typescript
// Success
toast.success('Uspješno dodano u košaricu!', {
  style: {
    background: '#111111',
    color: '#e8d5a3',
    border: '1px solid rgba(201,169,110,0.3)'
  },
  iconTheme: {
    primary: '#c9a96e',
    secondary: '#0a0a0a'
  }
});

// Error
toast.error('Ispunite sva obavezna polja');
```

## Performance

### Image Optimization
```typescript
// Lazy loading
<img loading="lazy" src={url} alt={alt} />

// Responsive images (future)
<img srcSet="..." sizes="..." />
```

### Code Splitting
```typescript
// Route-based splitting (automatic with React Router)
<Route path="/admin" element={<AdminPanel />} />
```

### Memoization
```typescript
// Memoize expensive calculations
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);

// Memoize components (sparingly)
const MemoizedProductCard = React.memo(ProductCard);
```

## Accessibility

### Semantic HTML
```typescript
// Use semantic elements
<nav>, <main>, <section>, <article>, <aside>, <footer>

// Use button for actions, Link for navigation
<button onClick={handleClick}>Action</button>
<Link to="/path">Navigation</Link>
```

### ARIA Attributes
```typescript
// Labels for screen readers
<button aria-label="Dodaj u košaricu">
  <ShoppingBag />
</button>

// Live regions for dynamic content
<div role="status" aria-live="polite">
  {message}
</div>
```

### Keyboard Navigation
```typescript
// Ensure focusable elements
<button tabIndex={0}>Click me</button>

// Handle keyboard events
<div onKeyDown={(e) => e.key === 'Enter' && handleAction()}>
```

## Error Handling

### Try-Catch Blocks
```typescript
// Wrap risky operations
try {
  const data = JSON.parse(localStorage.getItem('key'));
  return data;
} catch (error) {
  console.error('Failed to parse data:', error);
  return null;
}
```

### Fallback UI
```typescript
// Show fallback for missing data
{items.length === 0 ? (
  <EmptyState />
) : (
  <ItemList items={items} />
)}
```

## Comments

### When to Comment
```typescript
// ✅ Explain WHY, not WHAT
// Calculate discount based on coupon type (percentage vs fixed)
const discount = coupon.tip === 'postotak'
  ? subtotal * (coupon.vrijednost / 100)
  : coupon.vrijednost;

// ❌ Don't state the obvious
// Set count to 0
const count = 0;
```

### Section Comments
```typescript
// Use section comments for clarity
// ============================================================
// CART CALCULATIONS
// ============================================================

// ============================================================
// EVENT HANDLERS
// ============================================================
```

## Git Commit Messages
```
feat: Add product filtering by brand
fix: Correct cart total calculation
refactor: Extract ProductCard component
style: Update button hover states
docs: Add API integration guide
test: Add cart store tests
```

## Code Review Checklist
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Handlers use useCallback
- [ ] localStorage wrapped in try-catch
- [ ] Tailwind classes organized
- [ ] Accessibility attributes added
- [ ] Images have alt text
- [ ] Forms have validation
- [ ] Errors handled gracefully
- [ ] Toast notifications styled consistently

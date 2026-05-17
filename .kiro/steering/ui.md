---
title: AromaHR UI/UX Design System
inclusion: auto
---

# UI/UX Design System

## Color Palette

### Primary Colors
```css
--bg-primary: #0a0a0a;      /* Near-black background */
--bg-secondary: #111111;    /* Card backgrounds */
--bg-tertiary: #1a1a1a;     /* Hover states */
```

### Accent Colors
```css
--accent-gold: #c9a96e;     /* Primary gold accent */
--accent-light: #e8d5a3;    /* Cream/beige text */
```

### Opacity Variants
```css
--text-primary: #e8d5a3;           /* 100% */
--text-secondary: rgba(232,213,163,0.5);  /* 50% */
--text-muted: rgba(232,213,163,0.3);      /* 30% */
--border-subtle: rgba(201,169,110,0.1);   /* 10% */
--border-medium: rgba(201,169,110,0.3);   /* 30% */
```

### Semantic Colors
```css
--success: #10b981;         /* Green */
--error: #ef4444;           /* Red */
--warning: #f59e0b;         /* Orange */
--info: #3b82f6;            /* Blue */
```

### Gender-Specific Colors
```css
--male: #1e3a8a;            /* Blue-900 */
--female: #831843;          /* Pink-900 */
--unisex: #581c87;          /* Purple-900 */
```

## Typography

### Font Families
```css
--font-serif: 'Cormorant Garamond', serif;    /* Headings, elegant */
--font-sans: 'Inter', sans-serif;             /* Body, modern */
```

**Font Features:**
- Ligatures enabled (`liga`)
- Contextual alternates (`calt`)
- Kerning enabled (`kern`)
- Antialiasing optimized
- Text rendering optimized

### Font Sizes
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Letter Spacing
```css
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

## Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Border Radius
```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Circular */
```

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-gold: 0 0 40px rgba(201, 169, 110, 0.08);
```

## Component Patterns

### Buttons

#### Primary Button
```typescript
<button className="
  bg-[#c9a96e] text-[#0a0a0a]
  px-6 py-3
  text-sm font-bold tracking-[0.15em] uppercase
  rounded-xl
  hover:bg-[#e8d5a3]
  transition-colors duration-300
">
  Dodaj u košaricu
</button>
```

#### Secondary Button
```typescript
<button className="
  bg-[#111111] text-[#c9a96e]
  border border-[#c9a96e]/30
  px-6 py-3
  text-sm font-bold tracking-[0.15em] uppercase
  rounded-xl
  hover:bg-[#c9a96e]/10
  transition-colors duration-300
">
  Saznaj više
</button>
```

#### Ghost Button
```typescript
<button className="
  text-[#e8d5a3]
  px-4 py-2
  text-sm font-medium
  hover:text-[#c9a96e]
  transition-colors duration-300
">
  Otkaži
</button>
```

### Cards

#### Product Card
```typescript
<div className="
  bg-[#111111]
  border border-[#c9a96e]/10
  rounded-2xl
  overflow-hidden
  hover:border-[#c9a96e]/30
  hover:shadow-[0_0_40px_rgba(201,169,110,0.08)]
  transition-all duration-500
">
  {/* Content */}
</div>
```

#### Info Card
```typescript
<div className="
  bg-[#111111]
  border border-[#e8d5a3]/10
  rounded-xl
  p-6
">
  {/* Content */}
</div>
```

### Forms

#### Input Field
```typescript
<input className="
  w-full
  bg-[#0a0a0a]
  border border-[#c9a96e]/20
  text-[#e8d5a3]
  px-4 py-3
  rounded-xl
  focus:outline-none
  focus:border-[#c9a96e]
  focus:ring-2 focus:ring-[#c9a96e]/20
  transition-all duration-300
" />
```

#### Select Field
```typescript
<select className="
  w-full
  bg-[#0a0a0a]
  border border-[#c9a96e]/20
  text-[#e8d5a3]
  px-4 py-3
  rounded-xl
  focus:outline-none
  focus:border-[#c9a96e]
  focus:ring-2 focus:ring-[#c9a96e]/20
  transition-all duration-300
">
  <option>Opcija</option>
</select>
```

#### Textarea
```typescript
<textarea className="
  w-full
  bg-[#0a0a0a]
  border border-[#c9a96e]/20
  text-[#e8d5a3]
  px-4 py-3
  rounded-xl
  resize-none
  focus:outline-none
  focus:border-[#c9a96e]
  focus:ring-2 focus:ring-[#c9a96e]/20
  transition-all duration-300
" />
```

### Badges

#### Status Badge
```typescript
<span className="
  bg-[#c9a96e] text-[#0a0a0a]
  text-[9px] font-bold tracking-[0.2em] uppercase
  px-2 py-1
  rounded-full
">
  Featured
</span>
```

#### Category Badge
```typescript
<span className="
  bg-[#1a1a1a] text-[#e8d5a3]/50
  border border-[#e8d5a3]/10
  text-[9px] tracking-wider uppercase
  px-1.5 py-0.5
  rounded
">
  EDP
</span>
```

### Icons

#### Icon Button
```typescript
<button className="
  w-8 h-8
  bg-[#0a0a0a]/60
  border border-[#c9a96e]/20
  text-[#e8d5a3]/50
  rounded-full
  flex items-center justify-center
  hover:bg-[#c9a96e]/20
  hover:text-[#c9a96e]
  transition-all duration-300
">
  <Heart size={13} />
</button>
```

### Loading States

#### Spinner
```typescript
<div className="
  w-8 h-8
  border-2 border-[#c9a96e]/20
  border-t-[#c9a96e]
  rounded-full
  animate-spin
" />
```

#### Skeleton
```typescript
<div className="
  bg-[#1a1a1a]
  rounded-xl
  animate-pulse
  h-48
" />
```

## Layout Patterns

### Container
```typescript
<div className="
  max-w-7xl mx-auto
  px-4 sm:px-6 lg:px-8
">
  {/* Content */}
</div>
```

### Grid
```typescript
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  gap-6
">
  {/* Items */}
</div>
```

### Flex
```typescript
<div className="
  flex items-center justify-between
  gap-4
">
  {/* Items */}
</div>
```

## Animation Patterns

### Hover Scale
```typescript
<div className="
  transition-transform duration-700
  hover:scale-110
">
```

### Fade In
```typescript
<div className="
  opacity-0 group-hover:opacity-100
  transition-opacity duration-500
">
```

### Slide Up
```typescript
<div className="
  translate-y-2 group-hover:translate-y-0
  transition-all duration-300
">
```

## Accessibility

### Focus States
```typescript
// Always include focus states
focus:outline-none
focus:ring-2 focus:ring-[#c9a96e]
focus:border-[#c9a96e]
```

### ARIA Labels
```typescript
// For icon-only buttons
<button aria-label="Dodaj u košaricu">
  <ShoppingBag />
</button>
```

### Semantic HTML
```typescript
// Use semantic elements
<nav>, <main>, <section>, <article>, <aside>, <footer>
```

## Responsive Breakpoints
```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

## Toast Notifications

### Success Toast
```typescript
toast.success('Uspješno!', {
  style: {
    background: '#111111',
    color: '#e8d5a3',
    border: '1px solid rgba(201,169,110,0.25)',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  },
  iconTheme: {
    primary: '#c9a96e',
    secondary: '#0a0a0a',
  },
});
```

### Error Toast
```typescript
toast.error('Greška!', {
  style: {
    background: '#111111',
    color: '#e8d5a3',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  },
  iconTheme: {
    primary: '#ef4444',
    secondary: '#0a0a0a',
  },
});
```

## Design Principles

1. **Dark Luxury** — Near-black backgrounds with gold accents
2. **Minimal Borders** — Subtle borders with low opacity
3. **Smooth Transitions** — 300-500ms duration with cubic-bezier(0.16, 1, 0.3, 1)
4. **Consistent Spacing** — Use Tailwind's spacing scale
5. **Typography Hierarchy** — Serif for headings, sans-serif for body
6. **Hover Effects** — Scale, opacity, and color transitions with glow
7. **Accessibility First** — Focus states, ARIA labels, semantic HTML
8. **Mobile-First** — Responsive design from smallest to largest screens
9. **Micro-interactions** — Button ripples, card lifts, smooth animations
10. **Custom Icons** — SVG icons with 1.5px stroke, rounded corners

## Custom Icons

AromaHR koristi custom SVG ikone umjesto emoji-a ili icon fontova:

- **Location**: `src/components/icons/`
- **Stroke Width**: 1.5px (konzistentan)
- **Rounded**: `strokeLinecap="round"` i `strokeLinejoin="round"`
- **Animirane**: Smooth transitions (300ms)
- **Dostupne**: HeartIcon, StarIcon, ShoppingBagIcon, UserIcon, SearchIcon, CheckIcon, XIcon, MenuIcon

**Usage:**
```tsx
import { HeartIcon, StarIcon } from './components/icons';

<HeartIcon size={14} filled={true} className="text-[#c9a96e]" />
<StarIcon size={12} filled={false} className="text-[#e8d5a3]" />
```

## Modern Animations

Sve animacije koriste `cubic-bezier(0.16, 1, 0.3, 1)` za smooth, natural feel:

- **fadeInUp** - Hero sekcije, kartice
- **staggerFadeIn** - Liste sa delay
- **hover-lift** - Card hover effect (-6px translateY)
- **hover-glow** - Gold glow shadow
- **btn-ripple** - Button click ripple
- **skeleton** - Loading states
- **glass** - Glassmorphism effect

**See**: `.kiro/steering/animations.md` za complete guide

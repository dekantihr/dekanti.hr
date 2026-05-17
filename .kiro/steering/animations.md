---
title: AromaHR Modern Animations & Micro-interactions
inclusion: auto
---

# Modern Animations & Micro-interactions

## Overview
AromaHR koristi moderne, smooth animacije koje poboljšavaju user experience bez da budu previše agresivne. Sve animacije koriste `cubic-bezier(0.16, 1, 0.3, 1)` easing funkciju za prirodan osjećaj.

## Animation Classes

### Fade & Scale Animations

#### fadeInUp
Fade in sa translateY efektom - idealno za hero sekcije i kartice.
```tsx
<div className="animate-fadeInUp">
  {/* Content */}
</div>
```
- **Duration**: 0.7s
- **Effect**: Opacity 0→1, translateY 40px→0, scale 0.98→1

#### fadeIn
Jednostavan fade in sa blur efektom.
```tsx
<div className="animate-fadeIn">
  {/* Content */}
</div>
```
- **Duration**: 1s
- **Effect**: Opacity 0→1, blur 4px→0

#### scaleIn
Scale animacija sa fade in.
```tsx
<div className="animate-scaleIn">
  {/* Content */}
</div>
```
- **Duration**: 0.7s
- **Effect**: Opacity 0→1, scale 0.88→1

### Slide Animations

#### slideInRight
Slide in s desne strane.
```tsx
<div className="animate-slideInRight">
  {/* Content */}
</div>
```
- **Duration**: 0.8s
- **Effect**: translateX 60px→0, scale 0.96→1

#### slideInLeft
Slide in s lijeve strane.
```tsx
<div className="animate-slideInLeft">
  {/* Content */}
</div>
```
- **Duration**: 0.8s
- **Effect**: translateX -60px→0, scale 0.96→1

#### slideUp
Slide up animacija za modals i toasts.
```tsx
<div className="animate-slideUp">
  {/* Content */}
</div>
```
- **Duration**: 0.6s
- **Effect**: translateY 25px→0, scale 0.98→1

#### slideInDown
Slide down animacija za dropdowns.
```tsx
<div className="animate-slideInDown">
  {/* Content */}
</div>
```
- **Duration**: 0.7s
- **Effect**: translateY -40px→0

### Special Effects

#### bounceIn
Bounce effect za attention-grabbing elements.
```tsx
<div className="animate-bounceIn">
  {/* Content */}
</div>
```
- **Duration**: 0.8s
- **Effect**: Scale 0.5→1.08→0.96→1 sa fade in

#### shimmer
Shimmer effect za loading states.
```tsx
<div className="animate-shimmer">
  {/* Content */}
</div>
```
- **Duration**: 2.5s (infinite)
- **Effect**: Gradient sweep animation

#### float
Floating animation za decorative elements.
```tsx
<div className="animate-float">
  {/* Content */}
</div>
```
- **Duration**: 6s (infinite)
- **Effect**: Gentle up/down movement

#### pulse-glow
Pulsing glow effect za featured items.
```tsx
<div className="animate-pulse-glow">
  {/* Content */}
</div>
```
- **Duration**: 3s (infinite)
- **Effect**: Box-shadow pulse

#### rotate
Continuous rotation za loaders.
```tsx
<div className="animate-rotate">
  {/* Content */}
</div>
```
- **Duration**: 25s (infinite)
- **Effect**: 360° rotation

### Advanced Animations

#### staggerFadeIn
Stagger animation za liste (koristi sa stagger-* klasama).
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="animate-staggerFadeIn stagger-1">{/* Item 1 */}</div>
  <div className="animate-staggerFadeIn stagger-2">{/* Item 2 */}</div>
  <div className="animate-staggerFadeIn stagger-3">{/* Item 3 */}</div>
</div>
```
- **Duration**: 0.6s
- **Stagger delays**: 0.05s, 0.1s, 0.15s, 0.2s, 0.25s, 0.3s, 0.35s, 0.4s

#### skeletonPulse
Skeleton loading animation.
```tsx
<div className="skeleton animate-skeletonPulse h-48 w-full">
  {/* Loading skeleton */}
</div>
```
- **Duration**: 2s (infinite)
- **Effect**: Opacity pulse 0.4→0.7→0.4

#### progressFill
Progress bar fill animation.
```tsx
<div className="animate-progressFill bg-[#c9a96e] h-1">
  {/* Progress bar */}
</div>
```
- **Duration**: 0.8s
- **Effect**: scaleX 0→1 from left

#### expandWidth
Width expansion animation.
```tsx
<div className="animate-expandWidth">
  {/* Content */}
</div>
```
- **Duration**: 0.6s
- **Effect**: Width 0→100%

#### ripple
Ripple effect (koristi se automatski sa .btn-ripple).
```tsx
<button className="btn-ripple">
  Click me
</button>
```
- **Duration**: 0.8s
- **Effect**: Scale 0→4 sa fade out

## Micro-interactions

### Hover Effects

#### hover-lift
Lift effect na hover.
```tsx
<div className="hover-lift">
  {/* Content */}
</div>
```
- **Effect**: translateY -6px, enhanced shadow

#### hover-glow
Glow effect na hover.
```tsx
<div className="hover-glow">
  {/* Content */}
</div>
```
- **Effect**: Gold glow shadow

#### card-tilt
3D tilt effect na hover.
```tsx
<div className="card-tilt">
  {/* Content */}
</div>
```
- **Effect**: Perspective 3D rotation

### Button Effects

#### btn-ripple
Ripple effect na click.
```tsx
<button className="btn-ripple bg-[#c9a96e] px-6 py-3 rounded-xl">
  Click me
</button>
```
- **Effect**: Expanding circle on click

#### Active State
Sve buttone automatski imaju scale down na active.
```tsx
<button className="...">
  {/* Automatski scale(0.97) na active */}
</button>
```

## Glassmorphism

### glass
Standard glass effect za kartice.
```tsx
<div className="glass rounded-2xl p-6">
  {/* Content */}
</div>
```
- **Background**: rgba(17, 17, 17, 0.8)
- **Backdrop**: blur(40px) saturate(180%)
- **Border**: rgba(201, 169, 110, 0.12)

### glass-light
Light glass effect.
```tsx
<div className="glass-light rounded-xl p-4">
  {/* Content */}
</div>
```
- **Background**: rgba(201, 169, 110, 0.06)
- **Backdrop**: blur(24px) saturate(180%)
- **Border**: rgba(201, 169, 110, 0.18)

## Skeleton Loading

### skeleton
Skeleton loading state.
```tsx
<div className="skeleton h-48 w-full rounded-xl">
  {/* Loading */}
</div>
```
- **Effect**: Animated gradient sweep

## Gradient Text

### gradient-text
Animated gradient text.
```tsx
<h1 className="gradient-text text-4xl font-bold">
  AromaHR
</h1>
```
- **Effect**: Animated gold gradient

## Scroll Behavior

### Smooth Scroll
Automatski smooth scroll za sve anchor linkove.
```css
html {
  scroll-behavior: smooth;
}
```

### Custom Scrollbar
Ultra-thin modern scrollbar sa gold accent.
- **Width**: 6px
- **Track**: Transparent
- **Thumb**: Gold gradient sa glow on hover

## Focus States

Svi input elementi imaju enhanced focus states:
```tsx
<input className="..." />
{/* Automatski: glow shadow + border color change */}
```

## Best Practices

### 1. Stagger Animations
Za liste, koristi stagger delays:
```tsx
{products.map((product, i) => (
  <ProductCard 
    key={product.id}
    className={`animate-staggerFadeIn stagger-${i + 1}`}
    {...product}
  />
))}
```

### 2. Loading States
Koristi skeleton za loading:
```tsx
{isLoading ? (
  <div className="skeleton animate-skeletonPulse h-48 w-full" />
) : (
  <ProductCard {...product} />
)}
```

### 3. Hover Effects
Kombiniraj hover-lift i hover-glow:
```tsx
<div className="hover-lift hover-glow">
  {/* Content */}
</div>
```

### 4. Button Interactions
Uvijek koristi btn-ripple za primary buttons:
```tsx
<button className="btn-ripple bg-[#c9a96e] ...">
  Dodaj u košaricu
</button>
```

### 5. Performance
- Koristi `will-change` za često animirane elemente
- Izbjegavaj animiranje `width` i `height` (koristi `transform: scale`)
- Preferiraj `opacity` i `transform` za najbolje performanse

## Animation Timing

### Durations
- **Fast**: 0.3s - Micro-interactions (hover, focus)
- **Medium**: 0.5-0.7s - Standard animations (fade, slide)
- **Slow**: 1s+ - Hero animations, page transitions

### Easing
Sve animacije koriste:
```css
cubic-bezier(0.16, 1, 0.3, 1)
```
Ovo daje smooth, natural feel sa slight bounce na kraju.

## Accessibility

### Reduced Motion
Poštuj `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Visible
Uvijek vidljiv focus state za keyboard navigation:
```tsx
<button className="focus:ring-2 focus:ring-[#c9a96e]">
  {/* Content */}
</button>
```

## Examples

### Product Card Animation
```tsx
<div className="animate-staggerFadeIn hover-lift hover-glow card-tilt">
  <img className="transition-transform duration-700 group-hover:scale-110" />
  <button className="btn-ripple">Add to Cart</button>
</div>
```

### Loading State
```tsx
{isLoading ? (
  <div className="skeleton animate-skeletonPulse h-48" />
) : (
  <div className="animate-fadeInUp">
    {/* Content */}
  </div>
)}
```

### Hero Section
```tsx
<section className="animate-fadeIn">
  <h1 className="gradient-text animate-slideInLeft">
    Luxury Fragrances
  </h1>
  <p className="animate-slideInRight">
    Premium decants
  </p>
</section>
```

### Toast Notification
```tsx
<div className="animate-slideUp glass">
  {/* Toast content */}
</div>
```

## Future Enhancements

- [ ] Parallax scroll effects
- [ ] Magnetic cursor follow
- [ ] Page transition animations
- [ ] Scroll-triggered animations
- [ ] Lottie animations za complex interactions

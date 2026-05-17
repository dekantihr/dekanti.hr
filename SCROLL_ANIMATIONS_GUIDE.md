# Scroll Animations Implementation Guide

## Overview
Modern scroll-triggered animations have been implemented across AromaHR using Intersection Observer API for optimal performance.

## Features
- ✅ Performance-optimized with Intersection Observer
- ✅ Mobile-friendly and responsive
- ✅ Respects `prefers-reduced-motion`
- ✅ Multiple animation variants
- ✅ Stagger delays for sequential reveals
- ✅ Trigger once or repeat on scroll

## Available Animations

### 1. Fade Up (Default)
```tsx
<ScrollReveal animation="fade-up">
  <div>Content fades in from bottom</div>
</ScrollReveal>
```

### 2. Fade Left
```tsx
<ScrollReveal animation="fade-left">
  <div>Content slides in from left</div>
</ScrollReveal>
```

### 3. Fade Right
```tsx
<ScrollReveal animation="fade-right">
  <div>Content slides in from right</div>
</ScrollReveal>
```

### 4. Scale
```tsx
<ScrollReveal animation="scale">
  <div>Content scales up</div>
</ScrollReveal>
```

### 5. Blur
```tsx
<ScrollReveal animation="blur">
  <div>Content fades in with blur effect</div>
</ScrollReveal>
```

### 6. Rotate
```tsx
<ScrollReveal animation="rotate">
  <div>Content rotates in</div>
</ScrollReveal>
```

## Stagger Animations

For lists or grids, use delay prop:

```tsx
{products.map((product, index) => (
  <ScrollReveal 
    key={product.id}
    animation="fade-up"
    delay={index * 100}
  >
    <ProductCard {...product} />
  </ScrollReveal>
))}
```

## Advanced Options

```tsx
<ScrollReveal
  animation="fade-up"
  delay={200}              // Delay in ms
  threshold={0.2}          // 0-1, how much visible before trigger
  triggerOnce={true}       // Animate only once
  className="custom-class" // Additional classes
>
  <YourComponent />
</ScrollReveal>
```

## CSS Classes (Direct Usage)

You can also use CSS classes directly without the component:

```tsx
<div className="scroll-fade-up scroll-visible">
  Content
</div>
```

Available classes:
- `scroll-fade-up`
- `scroll-fade-left`
- `scroll-fade-right`
- `scroll-scale`
- `scroll-blur`
- `scroll-rotate`

Add `scroll-visible` class to trigger animation.

## Delay Classes

```tsx
<div className="scroll-fade-up scroll-delay-1">Item 1</div>
<div className="scroll-fade-up scroll-delay-2">Item 2</div>
<div className="scroll-fade-up scroll-delay-3">Item 3</div>
```

Available: `scroll-delay-1` through `scroll-delay-8`

## Implementation Examples

### HomePage Sections

```tsx
import ScrollReveal from '../components/ScrollReveal';

// Trust badges section
<ScrollReveal animation="fade-up">
  <section className="trust-badges">
    {badges.map((badge, i) => (
      <ScrollReveal key={i} animation="scale" delay={i * 100}>
        <div className="badge">{badge}</div>
      </ScrollReveal>
    ))}
  </section>
</ScrollReveal>

// Featured products
<ScrollReveal animation="fade-up">
  <h2>Featured Products</h2>
</ScrollReveal>

<div className="grid">
  {products.map((product, i) => (
    <ScrollReveal key={product.id} animation="fade-up" delay={i * 100}>
      <ProductCard {...product} />
    </ScrollReveal>
  ))}
</div>
```

### CatalogPage

```tsx
// Product grid with stagger
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {products.map((product, index) => (
    <ScrollReveal 
      key={product.id}
      animation="fade-up"
      delay={index * 80}
    >
      <ProductCard {...product} />
    </ScrollReveal>
  ))}
</div>
```

### ProductPage

```tsx
// Product details sections
<ScrollReveal animation="fade-left">
  <div className="product-info">...</div>
</ScrollReveal>

<ScrollReveal animation="fade-right">
  <div className="product-gallery">...</div>
</ScrollReveal>

// Reviews section
<ScrollReveal animation="fade-up">
  <h2>Reviews</h2>
</ScrollReveal>

{reviews.map((review, i) => (
  <ScrollReveal key={review.id} animation="scale" delay={i * 100}>
    <ReviewCard {...review} />
  </ScrollReveal>
))}
```

### CartPage & CheckoutPage

```tsx
// Cart items
{items.map((item, i) => (
  <ScrollReveal key={item.id} animation="fade-left" delay={i * 80}>
    <CartItem {...item} />
  </ScrollReveal>
))}

// Checkout steps
<ScrollReveal animation="fade-up">
  <CheckoutSteps />
</ScrollReveal>
```

## Performance Notes

1. **Intersection Observer** - Uses native browser API, no external dependencies
2. **Trigger Once** - Default behavior prevents re-animation on scroll up
3. **Reduced Motion** - Automatically respects user preferences
4. **Mobile Optimized** - Lighter animations on mobile devices
5. **No Layout Shift** - Animations don't cause CLS issues

## Accessibility

- Respects `prefers-reduced-motion: reduce`
- Animations are purely visual enhancements
- Content is accessible even without animations
- Keyboard navigation unaffected

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12.2+)
- Fallback: Content visible without animation

## Customization

### Custom Animation Timing

Edit `src/index.css`:

```css
.scroll-fade-up {
  transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Custom Animation

Add to `src/index.css`:

```css
.scroll-custom {
  opacity: 0;
  transform: translateY(40px) rotate(10deg);
  transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-custom.scroll-visible {
  opacity: 1;
  transform: translateY(0) rotate(0);
}
```

Use:

```tsx
<ScrollReveal animation="custom">
  <div>Custom animation</div>
</ScrollReveal>
```

## Testing

1. **Visual Testing**: Scroll through pages to verify animations
2. **Performance**: Check Chrome DevTools Performance tab
3. **Accessibility**: Enable "Reduce motion" in OS settings
4. **Mobile**: Test on actual devices for smooth performance

## Troubleshooting

### Animation not triggering
- Check `threshold` prop (try 0.1 for earlier trigger)
- Verify element has height/content
- Check browser console for errors

### Animation too fast/slow
- Adjust CSS transition duration in `index.css`
- Modify delay prop for stagger timing

### Performance issues
- Reduce number of animated elements
- Use `triggerOnce={true}` (default)
- Simplify animation (use `fade-up` instead of `blur`)

## Next Steps

1. Add ScrollReveal to all page sections
2. Test on mobile devices
3. Adjust delays for optimal feel
4. Consider adding parallax effects (future enhancement)

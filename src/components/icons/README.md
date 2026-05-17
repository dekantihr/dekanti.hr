# Custom SVG Icons

Custom SVG ikone dizajnirane za AromaHR luxury fragrance e-commerce platformu.

## Dizajn Principi

- **Stroke Width**: 1.5px (konzistentan kroz sve ikone)
- **Rounded Corners**: `strokeLinecap="round"` i `strokeLinejoin="round"`
- **Viewbox**: 24x24 (standardna veličina)
- **Animacije**: Smooth transitions (300ms cubic-bezier)
- **Accessibility**: Podržava aria-label na parent elementima

## Dostupne Ikone

### HeartIcon
```tsx
import { HeartIcon } from './components/icons';

<HeartIcon size={16} filled={false} className="text-[#c9a96e]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `filled?: boolean` - Popunjena ili outline (default: false)
- `className?: string` - Dodatne Tailwind klase

### StarIcon
```tsx
import { StarIcon } from './components/icons';

<StarIcon size={16} filled={true} className="text-[#c9a96e]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `filled?: boolean` - Popunjena ili outline (default: false)
- `className?: string` - Dodatne Tailwind klase

### ShoppingBagIcon
```tsx
import { ShoppingBagIcon } from './components/icons';

<ShoppingBagIcon size={16} className="text-[#e8d5a3]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

### UserIcon
```tsx
import { UserIcon } from './components/icons';

<UserIcon size={16} className="text-[#e8d5a3]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

### SearchIcon
```tsx
import { SearchIcon } from './components/icons';

<SearchIcon size={16} className="text-[#e8d5a3]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

### CheckIcon
```tsx
import { CheckIcon } from './components/icons';

<CheckIcon size={16} className="text-green-500" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

### XIcon
```tsx
import { XIcon } from './components/icons';

<XIcon size={16} className="text-red-500" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

### MenuIcon
```tsx
import { MenuIcon } from './components/icons';

<MenuIcon size={16} className="text-[#e8d5a3]" />
```

**Props:**
- `size?: number` - Veličina ikone (default: 16)
- `className?: string` - Dodatne Tailwind klase

## Primjer Korištenja

```tsx
import { HeartIcon, StarIcon, ShoppingBagIcon } from './components/icons';

function ProductCard() {
  return (
    <div>
      {/* Wishlist button */}
      <button aria-label="Dodaj u listu želja">
        <HeartIcon size={14} filled={false} className="text-[#e8d5a3] hover:text-[#c9a96e]" />
      </button>

      {/* Rating */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <StarIcon 
            key={i} 
            size={12} 
            filled={i <= 4} 
            className={i <= 4 ? 'text-[#c9a96e]' : 'text-[#333]'} 
          />
        ))}
      </div>

      {/* Add to cart */}
      <button aria-label="Dodaj u košaricu">
        <ShoppingBagIcon size={14} className="text-[#0a0a0a]" />
      </button>
    </div>
  );
}
```

## Animacije

Sve ikone podržavaju smooth transitions:

```tsx
<HeartIcon 
  size={16} 
  className="transition-all duration-300 hover:scale-110 hover:text-[#c9a96e]" 
/>
```

## Accessibility

Uvijek koristite `aria-label` na parent elementima:

```tsx
<button aria-label="Dodaj u listu želja">
  <HeartIcon size={14} />
</button>
```

## Dodavanje Novih Ikona

1. Kreirajte novu komponentu u `src/components/icons/`
2. Koristite isti pattern kao postojeće ikone
3. Dodajte export u `index.ts`
4. Dokumentirajte u ovom README-u

```tsx
// NewIcon.tsx
interface NewIconProps {
  size?: number;
  className?: string;
}

export default function NewIcon({ size = 16, className = '' }: NewIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ${className}`}
    >
      {/* SVG path */}
    </svg>
  );
}
```

## Dizajn Sistem

Ikone su dizajnirane da se uklapaju u AromaHR dark luxury aesthetic:

- **Primary Color**: `text-[#c9a96e]` (gold)
- **Secondary Color**: `text-[#e8d5a3]` (cream)
- **Muted**: `text-[#e8d5a3]/50`
- **Hover**: `hover:text-[#c9a96e]`

## Performance

- SVG ikone su lightweight (< 1KB svaka)
- Inline SVG omogućava CSS styling i animacije
- Nema dodatnih HTTP zahtjeva
- Tree-shaking friendly (samo importirane ikone se bundlaju)

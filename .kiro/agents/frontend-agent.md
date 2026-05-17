# Frontend Agent

## Role
Expert React/TypeScript developer specializing in modern frontend development with Tailwind CSS.

## Expertise
- React 19 with hooks (useState, useEffect, useCallback, useMemo)
- TypeScript strict mode
- React Router DOM 7
- Tailwind CSS 4 utility-first styling
- Component composition and reusability
- State management with custom hooks
- Form validation and error handling
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1)

## Responsibilities
1. **Component Development**
   - Create reusable, type-safe components
   - Follow ProductCard pattern for consistency
   - Use proper prop interfaces
   - Implement proper event handlers

2. **State Management**
   - Use custom hooks (useCart, useWishlist, useAuth, useOrders)
   - Implement localStorage persistence
   - Handle side effects with useEffect
   - Memoize callbacks with useCallback

3. **Styling**
   - Follow AromaHR design system (dark luxury theme)
   - Use Tailwind utility classes exclusively
   - Implement hover/focus states
   - Ensure responsive design (sm, md, lg, xl breakpoints)

4. **Routing**
   - Use React Router DOM declarative routing
   - Implement protected routes
   - Handle 404 pages
   - Use Link for navigation, button for actions

5. **Forms**
   - Validate inputs before submission
   - Show error messages with toast notifications
   - Handle loading states
   - Prevent default form submission

6. **Performance**
   - Lazy load images
   - Memoize expensive calculations
   - Use React.memo sparingly
   - Avoid unnecessary re-renders

## Code Patterns

### Component Template
```typescript
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ComponentProps {
  prop1: string;
  prop2: number;
  onAction: (id: number) => void;
}

export default function Component({ prop1, prop2, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');

  const handleAction = useCallback(() => {
    // Validation
    if (!state) {
      toast.error('Validation error');
      return;
    }

    // Action
    onAction(prop2);
    toast.success('Success!');
  }, [state, prop2, onAction]);

  return (
    <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
      {/* Content */}
    </div>
  );
}
```

### Form Handling
```typescript
const [form, setForm] = useState({
  email: '',
  password: '',
});

const updateForm = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    toast.error('Unesite valjanu email adresu');
    return;
  }
  
  // Submit
  onSubmit(form);
};
```

## Design System Reference
- **Colors**: #0a0a0a (bg), #111111 (cards), #c9a96e (accent), #e8d5a3 (text)
- **Fonts**: Playfair Display (headings), Inter (body)
- **Spacing**: Tailwind scale (p-4, gap-6, etc.)
- **Borders**: border-[#c9a96e]/10 to /30
- **Shadows**: shadow-[0_0_40px_rgba(201,169,110,0.08)]

## When to Activate
- UI/UX tasks
- Component creation/modification
- Styling issues
- Form validation
- Responsive design
- Accessibility improvements
- React/TypeScript questions

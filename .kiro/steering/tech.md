---
title: AromaHR Technical Stack & Dependencies
inclusion: auto
---

# Technical Stack

## Frontend Framework
- **React 19.2.3** — Latest React with concurrent features
- **TypeScript 5.9.3** — Strict type checking enabled
- **Vite 7.3.2** — Build tool with HMR and optimized bundling

## Routing
- **React Router DOM 7.14.2** — Client-side routing
- **BrowserRouter** — HTML5 history API
- **Routes/Route** — Declarative routing

## Styling
- **Tailwind CSS 4.1.17** — Utility-first CSS framework
- **@tailwindcss/vite 4.1.17** — Vite plugin for Tailwind
- **clsx 2.1.1** — Conditional class names
- **tailwind-merge 3.4.0** — Merge Tailwind classes intelligently

## UI Components
- **Lucide React 1.14.0** — Icon library (18-24px icons)
- **react-hot-toast 2.6.0** — Toast notifications

## State Management
- **React Hooks** — useState, useEffect, useCallback, useMemo
- **Custom Hooks** — useCart, useWishlist, useAuth, useOrders
- **localStorage** — Persistent storage for cart, wishlist, user, orders

## Build & Deployment
- **Vite production build** — Code-split static assets in `dist/`
- **ES Modules** — Modern JavaScript modules
- **Vercel** — Production hosting, auto-deploys on `git push origin main`

## ⚠️ DEPLOY COMMAND — ALWAYS USE THIS
```bash
# ALWAYS use npx vercel --prod 2>&1 for production deploys
# NEVER use just "vercel --prod"
npx vercel --prod 2>&1
```

**Deploy workflow (always in this order):**
```bash
npm run build                          # 1. Build locally first
git add -A                             # 2. Stage all changes
git commit -m "description"           # 3. Commit
git push origin main                  # 4. Push to GitHub
npx vercel --prod 2>&1                # 5. Deploy to production
```

## Database (Future Backend)
- **PostgreSQL** — Relational database
- **Extensions**: uuid-ossp, pg_trgm (full-text search)

## Development Tools
- **@types/node 22.19.17** — Node.js type definitions
- **@types/react 19.2.7** — React type definitions
- **@types/react-dom 19.2.3** — React DOM type definitions
- **@vitejs/plugin-react 5.1.1** — React plugin for Vite

## Scripts
```json
{
  "dev": "vite",             // Start dev server
  "typecheck": "tsc --noEmit", // TypeScript validation
  "build": "vite build",     // Production build
  "preview": "vite preview", // Preview production build
  "check": "npm run typecheck && npm run build" // Full production check
}
```

## Browser Support
- Modern browsers (ES2020+)
- Chrome, Firefox, Safari, Edge (latest 2 versions)

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## Security Considerations
- HTTPS enforcement (production)
- Content Security Policy headers
- XSS protection via React's built-in escaping
- CSRF tokens (future backend)
- Rate limiting (future backend)

## Future Backend Stack (Planned)
- **Node.js + Express** or **Supabase**
- **PostgreSQL** with schema from public/sql/
- **JWT authentication**
- **bcrypt** for password hashing
- **Stripe** or **CorvusPay** for payments
- **HP Pošta24 API** for shipping

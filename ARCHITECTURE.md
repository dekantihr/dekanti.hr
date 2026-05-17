# AromaHR — Project Architecture

## Overview
**AromaHR** is a Croatian luxury fragrance decant e-commerce platform built with React, TypeScript, and Tailwind CSS. This document provides a high-level overview of the project architecture and the autonomous coding system.

## Technology Stack

### Frontend
- **React 19.2.3** — Modern React with concurrent features
- **TypeScript 5.9.3** — Strict type checking
- **Vite 7.3.2** — Fast build tool with HMR
- **Tailwind CSS 4.1.17** — Utility-first styling
- **React Router DOM 7.14.2** — Client-side routing
- **Lucide React** — Icon library
- **react-hot-toast** — Toast notifications

### State Management
- Custom React hooks (useCart, useWishlist, useAuth, useOrders)
- localStorage for persistence
- No external state management library

### Database (Future)
- PostgreSQL with schema in `public/sql/`
- Tables: brands, users, products, orders, reviews, etc.
- Views for analytics and reporting

## Project Structure

```
aromahr/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProductCard.tsx
│   ├── pages/             # Route-level pages
│   │   ├── HomePage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── ...
│   ├── store/             # State management
│   │   └── cartStore.ts
│   ├── data/              # Static data
│   │   └── products.ts
│   ├── utils/             # Helper functions
│   │   └── cn.ts
│   ├── App.tsx            # Router & global state
│   └── main.tsx           # Entry point
├── public/
│   └── sql/               # Database schema
├── .kiro/                 # Autonomous coding system
│   ├── SYSTEM.md          # System overview
│   ├── steering/          # Project context
│   └── agents/            # Specialized agents
└── package.json
```

## Design System

### Color Palette
- **Background**: #0a0a0a (near-black), #111111 (cards)
- **Accent**: #c9a96e (gold), #e8d5a3 (cream)
- **Text**: #e8d5a3 with opacity variants

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, clean)

### Components
- Dark luxury aesthetic
- Subtle borders with gold accents
- Smooth transitions (300-500ms)
- Hover effects (scale, opacity, color)

## Key Features

1. **Product Catalog** — 10 luxury fragrances with multiple sizes
2. **Shopping Cart** — Add/remove items, apply coupons
3. **Checkout** — Multi-step form (4 steps)
4. **Order Tracking** — Track orders by order number
5. **User Accounts** — Login, register, profile
6. **Wishlist** — Save favorite products
7. **Admin Panel** — Manage orders and products
8. **Reviews** — 5-star rating system

## Autonomous Coding System

### Purpose
The `.kiro/` directory contains an autonomous coding system that ensures:
- Architectural consistency
- Code quality
- Pattern adherence
- Specialized expertise

### Components

#### Steering Files (`.kiro/steering/`)
Auto-loaded context files that serve as source of truth:
- `product.md` — Business context, features, user flows
- `tech.md` — Technology stack, dependencies
- `structure.md` — Project architecture, file organization
- `conventions.md` — Code conventions, best practices
- `api.md` — API endpoints, integration guide
- `ui.md` — Design system, component patterns

#### Specialized Agents (`.kiro/agents/`)
Expert agents for different domains:
- `frontend-agent.md` — React/TypeScript expert
- `backend-agent.md` — Node.js/Express expert
- `design-agent.md` — UI/UX expert
- `debug-agent.md` — Debugging expert
- `refactor-agent.md` — Code quality expert

### Workflow

1. **Context First** — Always gather context before coding
2. **Pattern Adherence** — Follow existing conventions
3. **Agent Routing** — Route tasks to appropriate expert
4. **Quality Verification** — Test and verify before completion

### Usage

For developers:
```bash
# Read system documentation
cat .kiro/SYSTEM.md

# Review steering files
ls .kiro/steering/

# Check agent documentation
ls .kiro/agents/
```

For AI assistants:
1. Load all steering files on startup
2. Route tasks to appropriate agents
3. Follow behavior rules strictly
4. Verify quality checklist

## Development Workflow

### Adding Features
1. Clarify requirements
2. Gather context (read steering files)
3. Identify existing patterns
4. Route to appropriate agent
5. Implement following patterns
6. Test and verify

### Fixing Bugs
1. Reproduce issue
2. Route to debug-agent
3. Analyze and fix
4. Test thoroughly
5. Verify no regressions

### Refactoring
1. Identify code smells
2. Route to refactor-agent
3. Improve code quality
4. Maintain functionality
5. Verify tests pass

## Future Roadmap

### Phase 1: Backend Integration
- Node.js/Express API
- PostgreSQL database
- JWT authentication
- API endpoints from `api.md`

### Phase 2: Payment Integration
- Stripe or CorvusPay
- Secure payment flow
- Order confirmation emails

### Phase 3: Advanced Features
- Real-time order updates (WebSocket)
- Recommendation engine
- Advanced analytics
- Email notifications

## Getting Started

### For New Developers
1. Read this file (ARCHITECTURE.md)
2. Review `.kiro/SYSTEM.md`
3. Read steering files in `.kiro/steering/`
4. Follow conventions in `.kiro/steering/conventions.md`

### For AI Assistants
1. Load `.kiro/SYSTEM.md`
2. Load all steering files
3. Understand agent specializations
4. Follow workflow strictly

## Support

- **System Documentation**: `.kiro/SYSTEM.md`
- **Code Conventions**: `.kiro/steering/conventions.md`
- **Design System**: `.kiro/steering/ui.md`
- **API Guide**: `.kiro/steering/api.md`

---

**For complete system documentation, see `.kiro/SYSTEM.md`**

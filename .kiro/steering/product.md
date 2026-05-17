---
title: AromaHR Product & Business Context
inclusion: auto
---

# AromaHR — Product Overview

## Business Model
**AromaHR** is a Croatian luxury fragrance decant e-commerce platform specializing in high-end perfume samples.

### Target Market
- Croatian consumers (language: Croatian/Hrvatski)
- Luxury fragrance enthusiasts
- Price-conscious buyers seeking authentic designer samples
- Gift shoppers

### Product Offering
- **Decant sizes**: 2ml, 5ml, 10ml, 15ml, 20ml, 30ml, 50ml
- **Brands**: Dior, Chanel, Tom Ford, Creed, Maison Margiela
- **Categories**: Muški (Men's), Ženski (Women's), Unisex
- **Concentrations**: EDP, EDT, Parfum, EDP Extrait, EDC, EDP Intense

### Key Features
1. **Fragrance Notes Pyramid** — Top/Heart/Base note visualization
2. **Multi-size Pricing** — Variable pricing by volume
3. **Coupon System** — Percentage and fixed-value discounts
4. **Order Tracking** — HP Pošta24 integration
5. **Guest Checkout** — No account required
6. **Wishlist** — Save favorites
7. **Reviews & Ratings** — 5-star system with approval workflow

### Pricing Strategy
- Free shipping threshold: 50€
- Standard shipping: 4.50€
- Payment methods: Pouzećem (COD), Bankovna transakcija (Bank transfer)

### User Roles
- **Kupac** (Customer) — Browse, purchase, track orders
- **Admin** — Manage products, orders, reviews, analytics

## Business Rules

### Cart & Checkout
- Minimum order: No minimum
- Maximum quantity per item: Stock limit (zaliha)
- Coupon validation: Min order amount, max discount, usage limits
- Order number format: `HR-{YEAR}-{6-digit-random}`

### Shipping
- Domestic only (Croatia)
- HP Pošta24 tracking
- Estimated delivery: 2-5 business days

### Order Lifecycle
1. **Nova** (New) — Order placed
2. **U obradi** (Processing) — Payment confirmed, preparing shipment
3. **Poslano** (Shipped) — Tracking number assigned
4. **Isporuceno** (Delivered) — Order completed
5. **Otkazano** (Cancelled) — Order cancelled

### Returns & Refunds
- Not yet implemented (future feature)

## Content Guidelines

### Language
- **Primary**: Croatian (Hrvatski)
- **Tone**: Luxury, sophisticated, trustworthy
- **Voice**: Professional yet approachable

### Product Descriptions
- **Opis kratki** (Short description): 1-2 sentences, highlight key features
- **Opis dugi** (Long description): 3-5 paragraphs, detailed fragrance profile, longevity, occasions

### UI Text Patterns
- Buttons: Uppercase, tracking-widest (e.g., "DODAJ U KOŠARICU")
- Labels: Sentence case (e.g., "Broj narudžbe")
- Errors: Friendly, actionable (e.g., "Ispunite sva obavezna polja")
- Success: Encouraging (e.g., "Uspješno dodano u košaricu!")

## Brand Identity

### Visual Language
- **Dark luxury** aesthetic (near-black backgrounds)
- **Gold/bronze accents** (#c9a96e, #e8d5a3)
- **Serif headings** (Playfair Display) for elegance
- **Sans-serif body** (Inter) for readability
- **Minimal borders** with subtle gold glow effects
- **High-quality product imagery** with gradient overlays

### Trust Signals
- Secure payment badges
- Authenticity guarantee
- Customer reviews
- Order tracking
- Newsletter with exclusive offers

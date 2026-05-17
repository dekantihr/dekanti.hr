# 🚨 APPLY THIS MIGRATION NOW

## Quick Fix - 2 Minutes

The error `Could not find the 'note_baze' column` means your database is missing the scent notes columns.

### ⚡ FASTEST WAY - Copy & Paste in Supabase Dashboard

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/gqmvyggenreowrpprpld/sql/new

2. **Paste this SQL:**

```sql
-- Add scent notes columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS note_vrha VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_srca VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_baze VARCHAR(255);

-- Add comments
COMMENT ON COLUMN products.note_vrha IS 'Top notes of the perfume';
COMMENT ON COLUMN products.note_srca IS 'Heart notes of the perfume';
COMMENT ON COLUMN products.note_baze IS 'Base notes of the perfume';
```

3. **Click "Run" (or press Ctrl+Enter)**

4. **You should see:** "Success. No rows returned"

5. **Refresh your app** (Ctrl+R or Cmd+R)

6. **Try creating a product again** - It will work! ✅

---

## After Running Migration

### Enable Scent Notes UI

Open `src/pages/AdminPanel.tsx` and find this line (around line 1993):

```typescript
{false && (
```

Change it to:

```typescript
{true && (
```

This will show the scent notes section with AI generation!

---

## ✅ What This Does

Adds three new columns to your `products` table:
- `note_vrha` - Top notes (e.g., "bergamot, limun, papar")
- `note_srca` - Heart notes (e.g., "ruža, jasmin, lavanda")
- `note_baze` - Base notes (e.g., "mošus, sandalovina, vanilija")

These are used by the AI to generate realistic perfume scent profiles!

---

## 🎉 After Migration Works

1. Open Admin Panel
2. Click "+ Novi proizvod"
3. Enter name and brand
4. Click "✨ AI Generiraj" next to "Note parfema"
5. All three note fields fill automatically! ✨

---

**Time Required:** 2 minutes  
**Difficulty:** Copy & Paste  
**Risk:** None (uses IF NOT EXISTS)

# Foreign Key Constraint Error Fix

## Problem
When trying to delete a brand that has products associated with it, the database returns a **409 Conflict** error:

```
DELETE https://...supabase.co/rest/v1/brands?id=eq.2 409 (Conflict)
Error: update or delete on table "brands" violates foreign key constraint "products_brand_id_fkey"
```

This is **correct database behavior** - the foreign key constraint prevents orphaned products. However, the UI didn't handle this gracefully.

---

## Solution Implemented

### 1. **Improved Brand Delete Handler**

#### Before:
- Generic error message
- No pre-check for products
- Confusing user experience

#### After:
✅ **Pre-check** - Counts products before attempting delete
✅ **Clear error message** - "Ne možete obrisati brand koji ima X proizvoda. Prvo obrišite ili premjestite proizvode."
✅ **Specific error handling** - Detects foreign key constraint error (code 23503)
✅ **Longer toast duration** - 5 seconds for error messages

```typescript
const handleDeleteBrand = async (brandId: number) => {
  // Check if brand has products
  const productCount = PRODUCTS.filter(p => p.brand_id === brandId).length;
  
  if (productCount > 0) {
    toast.error(`Ne možete obrisati brand koji ima ${productCount} proizvoda...`);
    return;
  }
  
  // ... rest of delete logic
  
  try {
    // ... delete
  } catch (error: any) {
    if (error.code === '23503') {
      throw new Error('Brand ima povezane proizvode i ne može biti obrisan');
    }
  }
};
```

---

### 2. **Visual Indicators in UI**

Added **"Zaštićen"** badge to brands that have products:

```tsx
{!canDelete && (
  <span className="text-[9px] bg-orange-400/15 text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded-full font-bold">
    Zaštićen
  </span>
)}
```

**Delete button behavior:**
- ✅ **Disabled** when brand has products
- ✅ **Grayed out** visually (text-red-400/20)
- ✅ **Cursor not-allowed** to indicate it's disabled
- ✅ **Tooltip** explaining why it can't be deleted

---

### 3. **Improved Coupon Delete Handler**

Applied same pattern to coupons (which can be referenced in orders):

```typescript
const handleDeleteCoupon = async (couponId: number) => {
  try {
    // ... delete
  } catch (error: any) {
    if (error.code === '23503') {
      throw new Error('Kupon je korišten u narudžbama i ne može biti obrisan. Možete ga deaktivirati umjesto toga.');
    }
  }
};
```

**Suggests alternative:** "Možete ga deaktivirati umjesto toga" - guides user to proper action

---

## Database Constraints (Why This Happens)

### Brands → Products Relationship
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    ...
);
```

**`ON DELETE RESTRICT`** means:
- ❌ Cannot delete brand if products exist
- ✅ Prevents orphaned products
- ✅ Maintains data integrity

### Coupons → Orders Relationship
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    kupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
    ...
);
```

**`ON DELETE SET NULL`** means:
- ✅ Can delete coupon
- ✅ Order's kupon_id becomes NULL
- ✅ Order history preserved

**However**, if there are other constraints or triggers, deletion might still fail.

---

## User Experience Improvements

### Before Fix:
1. User clicks delete on brand with products
2. Generic error: "Greška pri brisanju branda"
3. User confused, tries again
4. Same error
5. User frustrated 😞

### After Fix:
1. User sees "Zaštićen" badge on brand card
2. Delete button is grayed out
3. Hover shows tooltip: "Ne može se obrisati - ima proizvode"
4. If they somehow trigger delete, clear message: "Ne možete obrisati brand koji ima 5 proizvoda. Prvo obrišite ili premjestite proizvode."
5. User understands what to do ✅

---

## Testing

### Test Case 1: Delete Brand with Products
1. Go to Brendovi section
2. Find brand with products (shows count)
3. ✅ See "Zaštićen" badge
4. ✅ Delete button is grayed out
5. Try to click delete
6. ✅ Nothing happens (disabled)

### Test Case 2: Delete Brand without Products
1. Create new brand (no products)
2. ✅ No "Zaštićen" badge
3. ✅ Delete button is active (red)
4. Click delete
5. ✅ Confirmation dialog
6. Confirm
7. ✅ Brand deleted successfully

### Test Case 3: Delete Coupon Used in Orders
1. Go to Kuponi section
2. Try to delete coupon that was used
3. ✅ Clear error: "Kupon je korišten u narudžbama..."
4. ✅ Suggests alternative: "Možete ga deaktivirati"

---

## Alternative Solutions (Not Implemented)

### Option 1: Cascade Delete
```sql
ON DELETE CASCADE
```
**Pros:** Deleting brand deletes all products
**Cons:** ❌ Dangerous - accidental deletion loses all products

### Option 2: Soft Delete
```sql
ALTER TABLE brands ADD COLUMN deleted_at TIMESTAMPTZ;
```
**Pros:** Can "delete" without losing data
**Cons:** Requires schema change, more complex queries

### Option 3: Move Products to "Unknown" Brand
**Pros:** Allows deletion
**Cons:** Creates orphaned products under generic brand

**Current solution (RESTRICT) is the safest and most appropriate.**

---

## Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 23503 | Foreign key violation | Check for related records before delete |
| 23505 | Unique constraint violation | Check for duplicates |
| 23502 | Not null violation | Provide required fields |
| 42P01 | Table doesn't exist | Check table name |

---

## Future Enhancements

### 1. Bulk Operations
- Show warning if trying to delete multiple brands with products
- Provide "Deactivate instead" option

### 2. Product Reassignment
- Add UI to move products to different brand before deletion
- "Move X products to another brand" button

### 3. Dependency Viewer
- Show all dependencies before deletion
- "This brand has: 5 products, 12 reviews, 3 orders"

### 4. Soft Delete Option
- Add "Archive" instead of "Delete"
- Archived brands hidden but recoverable

---

## Summary

✅ **Problem:** Foreign key constraint errors not handled gracefully
✅ **Solution:** Pre-check, clear messages, visual indicators, disabled buttons
✅ **Result:** Better UX, no confusion, guides user to correct action

**The database is protecting data integrity - we just made it user-friendly!** 🎉

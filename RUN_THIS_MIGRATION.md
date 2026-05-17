# 🚨 IMPORTANT: Run This Migration First!

## Problem
The AI integration needs the `note_vrha`, `note_srca`, and `note_baze` fields in the `products` table, but they don't exist yet in your database.

## Solution
Run the SQL migration to add these fields.

## How to Run the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/gqmvyggenreowrpprpld

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL**
   ```sql
   -- Add scent notes columns to products table
   ALTER TABLE products 
   ADD COLUMN IF NOT EXISTS note_vrha VARCHAR(255),
   ADD COLUMN IF NOT EXISTS note_srca VARCHAR(255),
   ADD COLUMN IF NOT EXISTS note_baze VARCHAR(255);

   -- Add comments for documentation
   COMMENT ON COLUMN products.note_vrha IS 'Top notes of the perfume (e.g., bergamot, lemon, orange)';
   COMMENT ON COLUMN products.note_srca IS 'Heart/middle notes of the perfume (e.g., rose, jasmine, lavender)';
   COMMENT ON COLUMN products.note_baze IS 'Base notes of the perfume (e.g., musk, sandalwood, vanilla)';
   ```

4. **Run the Query**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - You should see "Success. No rows returned"

5. **Verify**
   - Go to "Table Editor" → "products"
   - You should now see the three new columns: `note_vrha`, `note_srca`, `note_baze`

### Option 2: Using Supabase CLI (If you have it installed)

```bash
# Create a new migration file
supabase migration new add_scent_notes

# Copy the SQL from ADD_SCENT_NOTES_MIGRATION.sql into the new migration file

# Apply the migration
supabase db push
```

## After Running the Migration

Once you've run the migration:

1. **Refresh your app** (Ctrl+R / Cmd+R)
2. **Open Admin Panel**
3. **Click "+ Novi proizvod"**
4. **Enter product name and select brand**
5. **Click "✨ AI Generiraj" next to "Note parfema"**
6. **Watch the magic happen!** 🎉

The AI will now be able to:
- ✅ Generate product descriptions
- ✅ Generate scent notes (top, heart, base)
- ✅ Generate SKU codes
- ✅ Generate brand descriptions

## Troubleshooting

### "Column already exists" error
This is fine! It means the columns were already added. You can ignore this error.

### "Permission denied" error
Make sure you're logged in as the project owner in Supabase Dashboard.

### AI still not working after migration
1. Check browser console for errors (F12)
2. Verify GROQ_API_KEY is set in .env file
3. Make sure you've refreshed the page after running migration

## What These Fields Store

- **note_vrha** (Top Notes) - The first scents you smell (e.g., "bergamot, limun, papar")
- **note_srca** (Heart Notes) - The middle scents (e.g., "ruža, jasmin, lavanda")
- **note_baze** (Base Notes) - The lasting scents (e.g., "mošus, sandalovina, vanilija")

These are essential for perfume descriptions and help customers understand the fragrance profile!

---

**Status:** ⚠️ MIGRATION REQUIRED  
**Priority:** HIGH  
**Estimated Time:** 2 minutes

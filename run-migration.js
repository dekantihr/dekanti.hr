// Quick script to run the migration directly
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
-- Add scent notes columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS note_vrha VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_srca VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_baze VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN products.note_vrha IS 'Top notes of the perfume (e.g., bergamot, lemon, orange)';
COMMENT ON COLUMN products.note_srca IS 'Heart/middle notes of the perfume (e.g., rose, jasmine, lavender)';
COMMENT ON COLUMN products.note_baze IS 'Base notes of the perfume (e.g., musk, sandalwood, vanilla)';
`;

async function runMigration() {
  console.log('Running migration...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('The following columns have been added to the products table:');
    console.log('  - note_vrha (top notes)');
    console.log('  - note_srca (heart notes)');
    console.log('  - note_baze (base notes)');
    console.log('\nYou can now use the AI scent notes generation feature!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

runMigration();

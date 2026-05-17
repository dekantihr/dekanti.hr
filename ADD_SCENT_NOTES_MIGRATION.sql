-- Migration: Add scent notes fields to products table
-- Date: 2026-05-05
-- Purpose: Add note_vrha, note_srca, note_baze fields for AI-generated scent notes

-- Add scent notes columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS note_vrha VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_srca VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_baze VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN products.note_vrha IS 'Top notes of the perfume (e.g., bergamot, lemon, orange)';
COMMENT ON COLUMN products.note_srca IS 'Heart/middle notes of the perfume (e.g., rose, jasmine, lavender)';
COMMENT ON COLUMN products.note_baze IS 'Base notes of the perfume (e.g., musk, sandalwood, vanilla)';

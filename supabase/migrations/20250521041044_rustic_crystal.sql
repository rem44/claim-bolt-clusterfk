/*
  # Add product_category column to claims table

  1. Changes
    - Add product_category column to claims table
    - Update existing claims to have a default category
    - Make the column required (NOT NULL)

  2. Notes
    - Uses safe migration pattern with IF NOT EXISTS check
    - Sets default value for existing records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'product_category'
  ) THEN
    -- Add the product_category column
    ALTER TABLE claims ADD COLUMN product_category text;
    
    -- Set default value for existing records
    UPDATE claims SET product_category = 'Tiles' WHERE product_category IS NULL;
    
    -- Make the column required
    ALTER TABLE claims ALTER COLUMN product_category SET NOT NULL;
  END IF;
END $$;
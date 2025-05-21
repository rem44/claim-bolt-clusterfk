-- Update the claims table to use product_category instead of category
DO $$ 
BEGIN
  -- First check if we need to migrate data from category to product_category
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'category'
  ) THEN
    -- Add product_category if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'claims' AND column_name = 'product_category'
    ) THEN
      ALTER TABLE claims ADD COLUMN product_category text;
    END IF;

    -- Migrate data from category to product_category
    UPDATE claims 
    SET product_category = category 
    WHERE product_category IS NULL AND category IS NOT NULL;

    -- Drop the old category column
    ALTER TABLE claims DROP COLUMN IF EXISTS category;
  END IF;

  -- Ensure product_category exists and is required
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'product_category'
  ) THEN
    -- Set default value for any NULL records
    UPDATE claims SET product_category = 'Tiles' WHERE product_category IS NULL;
    
    -- Make the column required
    ALTER TABLE claims ALTER COLUMN product_category SET NOT NULL;
  END IF;
END $$;

-- Add check constraint to ensure valid product categories
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'claims_product_category_check'
  ) THEN
    ALTER TABLE claims
    ADD CONSTRAINT claims_product_category_check
    CHECK (product_category IN ('Tiles', 'Broadloom'));
  END IF;
END $$;
/*
  # Fix products table and relationships
  
  1. New Tables
    - Creates products table if it doesn't exist
  2. Security
    - Enables RLS on products table
    - Adds policy for authenticated users to read products (only if it doesn't exist)
  3. Relationships
    - Ensures foreign key relationship between claims and clients
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  style text,
  color text,
  style_number text,
  color_number text,
  format text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (only if they don't exist)
DO $$ 
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'Users can read all products'
  ) THEN
    -- Create policy if it doesn't exist
    EXECUTE 'CREATE POLICY "Users can read all products" ON products FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- Ensure foreign key relationship between claims and clients
DO $$ 
BEGIN
  -- Check if the foreign key already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'claims_client_id_fkey'
  ) THEN
    -- Add foreign key if it doesn't exist
    ALTER TABLE claims 
    ADD CONSTRAINT claims_client_id_fkey 
    FOREIGN KEY (client_id) 
    REFERENCES clients(id);
  END IF;
END $$;
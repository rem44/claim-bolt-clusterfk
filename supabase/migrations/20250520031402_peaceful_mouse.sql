/*
  # Create claim products table

  1. New Tables
    - `claim_products`
      - `id` (uuid, primary key)
      - `claim_id` (uuid, foreign key to claims.id)
      - `description` (text, not null)
      - `style` (text, not null)
      - `color` (text, not null)
      - `quantity` (numeric, not null)
      - `price_per_sy` (numeric, not null)
      - `total_price` (numeric, not null)
      - `claimed_quantity` (numeric, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `claim_products` table
    - Add policy for authenticated users to read all claim products
    - Add policy for authenticated users to insert/update their own claim products
*/

CREATE TABLE IF NOT EXISTS claim_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  description text NOT NULL,
  style text NOT NULL,
  color text NOT NULL,
  quantity numeric NOT NULL,
  price_per_sy numeric NOT NULL,
  total_price numeric NOT NULL,
  claimed_quantity numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE claim_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all claim products"
  ON claim_products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own claim products"
  ON claim_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own claim products"
  ON claim_products
  FOR UPDATE
  TO authenticated
  USING (true);
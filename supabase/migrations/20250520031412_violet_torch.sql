/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `code` (text, not null)
      - `color` (text, not null)
      - `color_number` (text, not null)
      - `description` (text, not null)
      - `format` (text, not null)
      - `style` (text, not null)
      - `style_number` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `products` table
    - Add policy for authenticated users to read all products
    - Add policy for authenticated users to insert/update products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  color text NOT NULL,
  color_number text NOT NULL,
  description text NOT NULL,
  format text NOT NULL,
  style text NOT NULL,
  style_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);
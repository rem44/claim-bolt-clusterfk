/*
  # Create invoice items table

  1. New Tables
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key to invoices.id)
      - `product_id` (uuid, foreign key to products.id)
      - `shipping_code` (text)
      - `item_description` (text, not null)
      - `unit_cost_price` (numeric, not null)
      - `unit_selling_price` (numeric, not null)
      - `quantity` (numeric, not null)
      - `total_cost` (numeric, not null)
      - `total_price` (numeric, not null)
      - `total_profit` (numeric, not null)
      - `profit_percentage` (numeric, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `invoice_items` table
    - Add policy for authenticated users to read all invoice items
    - Add policy for authenticated users to insert/update invoice items
*/

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  shipping_code text,
  item_description text NOT NULL,
  unit_cost_price numeric NOT NULL,
  unit_selling_price numeric NOT NULL,
  quantity numeric NOT NULL,
  total_cost numeric NOT NULL,
  total_price numeric NOT NULL,
  total_profit numeric NOT NULL,
  profit_percentage numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (true);
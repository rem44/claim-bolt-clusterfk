/*
  # Add Unique Constraints and Test Data

  This migration adds unique constraints to key tables and populates them with test data.

  1. Constraints
    - Unique constraint on clients.code
    - Unique constraint on products.code
    - Unique constraint on invoices.invoice_number

  2. Test Data
    - Sample clients
    - Sample products
    - Sample invoices with items
*/

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_code_key') THEN
    ALTER TABLE clients DROP CONSTRAINT clients_code_key;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_code_key') THEN
    ALTER TABLE products DROP CONSTRAINT products_code_key;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_key') THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;
  END IF;
END $$;

-- Add unique constraints
ALTER TABLE clients ADD CONSTRAINT clients_code_key UNIQUE (code);
ALTER TABLE products ADD CONSTRAINT products_code_key UNIQUE (code);
ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);

-- Add test products if they don't exist
INSERT INTO products (code, description, style, color, style_number, color_number, format)
VALUES
  ('CAR001', 'Premium Carpet Tile', 'Modern Lines', 'Deep Blue', 'ML100', 'DB01', '24x24'),
  ('CAR002', 'Luxury Broadloom', 'Executive Plus', 'Charcoal Grey', 'EP200', 'CG02', '12ft')
ON CONFLICT (code) DO NOTHING;

-- Add test invoice items
DO $$ 
DECLARE
  client_id uuid;
  product_id uuid;
  invoice_id uuid;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO client_id FROM clients WHERE code = 'ACME001' LIMIT 1;
  
  -- Get product ID
  SELECT id INTO product_id FROM products WHERE code = 'CAR001' LIMIT 1;
  
  -- Insert invoice if it doesn't exist
  IF client_id IS NOT NULL AND product_id IS NOT NULL THEN
    -- Check if invoice exists
    SELECT id INTO invoice_id 
    FROM invoices 
    WHERE invoice_number = 'INV-2025-001';
    
    -- Create invoice if it doesn't exist
    IF invoice_id IS NULL THEN
      INSERT INTO invoices (invoice_number, client_id, invoice_date, currency, total_amount)
      VALUES ('INV-2025-001', client_id, NOW(), 'USD', 1500.00)
      RETURNING id INTO invoice_id;
      
      -- Insert invoice items
      INSERT INTO invoice_items (
        invoice_id, 
        product_id,
        shipping_code,
        item_description,
        unit_cost_price,
        unit_selling_price,
        quantity,
        total_cost,
        total_price,
        total_profit,
        profit_percentage
      )
      VALUES (
        invoice_id,
        product_id,
        'SHP001',
        'Premium Carpet Tile - Modern Collection',
        45.00,
        60.00,
        25,
        1125.00,
        1500.00,
        375.00,
        25.00
      );
    END IF;
  END IF;
END $$;
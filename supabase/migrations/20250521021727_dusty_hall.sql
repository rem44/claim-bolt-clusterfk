/*
  # Add test data

  1. Changes
    - Add test clients with proper unique constraints
    - Add test invoices with proper foreign key relationships
    - Add test products for invoices
*/

-- Add test clients
INSERT INTO clients (name, code, address, phone, email)
VALUES 
  ('Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
  ('Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
  ('Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com')
ON CONFLICT (code) DO NOTHING;

-- Add test products
INSERT INTO products (code, description, style, color, style_number, color_number, format)
VALUES
  ('CAR001', 'Premium Carpet Tile', 'Modern Lines', 'Deep Blue', 'ML100', 'DB01', '24x24'),
  ('CAR002', 'Luxury Broadloom', 'Executive Plus', 'Charcoal Grey', 'EP200', 'CG02', '12ft')
ON CONFLICT (code) DO NOTHING;

-- Add test invoices and items
DO $$ 
DECLARE
  client_id uuid;
  product_id uuid;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO client_id FROM clients WHERE code = 'ACME001' LIMIT 1;
  
  -- Get product ID
  SELECT id INTO product_id FROM products WHERE code = 'CAR001' LIMIT 1;
  
  -- Insert invoice if it doesn't exist
  IF client_id IS NOT NULL AND product_id IS NOT NULL THEN
    -- Insert invoice
    WITH new_invoice AS (
      INSERT INTO invoices (invoice_number, client_id, invoice_date, currency, total_amount)
      VALUES ('INV-2025-001', client_id, NOW(), 'USD', 1500.00)
      ON CONFLICT (invoice_number) DO NOTHING
      RETURNING id
    )
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
    SELECT 
      new_invoice.id,
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
    FROM new_invoice
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
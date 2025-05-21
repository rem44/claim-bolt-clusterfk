/*
  # Add Sample Data Migration
  
  1. Changes
    - Adds sample clients with unique codes
    - Adds sample products with unique codes
    - Creates sample invoice with items
    
  2. Data
    - 3 sample clients
    - 2 sample products
    - 1 sample invoice with items
    
  3. Constraints
    - Ensures unique codes for clients and products
    - Ensures unique invoice numbers
*/

-- First, ensure we have unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS clients_code_key ON clients (code);
CREATE UNIQUE INDEX IF NOT EXISTS products_code_key ON products (code);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_key ON invoices (invoice_number);

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
/*
  # Add Test Data

  1. New Data
    - Test clients (Acme, Global Industries, Tech Solutions)
    - Test products (Premium Carpet Tile, Luxury Broadloom)
    - Test invoice with items
  
  2. Changes
    - Uses safe inserts with existence checks
    - Generates unique invoice numbers
*/

-- Add test clients if they don't exist
INSERT INTO clients (id, name, code, address, phone, email)
SELECT gen_random_uuid(), 'Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE code = 'ACME001');

INSERT INTO clients (id, name, code, address, phone, email)
SELECT gen_random_uuid(), 'Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE code = 'GLOB002');

INSERT INTO clients (id, name, code, address, phone, email)
SELECT gen_random_uuid(), 'Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE code = 'TECH003');

-- Add test products if they don't exist
INSERT INTO products (id, code, description, style, color, style_number, color_number, format)
SELECT gen_random_uuid(), 'CAR001', 'Premium Carpet Tile', 'Modern Lines', 'Deep Blue', 'ML100', 'DB01', '24x24'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'CAR001');

INSERT INTO products (id, code, description, style, color, style_number, color_number, format)
SELECT gen_random_uuid(), 'CAR002', 'Luxury Broadloom', 'Executive Plus', 'Charcoal Grey', 'EP200', 'CG02', '12ft'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'CAR002');

-- Add test invoice and items with unique invoice number
DO $$ 
DECLARE
  v_client_id uuid;
  v_product_id uuid;
  v_invoice_id uuid;
  v_invoice_number text;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO v_client_id FROM clients WHERE code = 'ACME001' LIMIT 1;
  
  -- Get product ID
  SELECT id INTO v_product_id FROM products WHERE code = 'CAR001' LIMIT 1;
  
  -- Generate unique invoice number
  SELECT 'INV-2025-' || LPAD(COALESCE(
    (SELECT (REGEXP_MATCHES(MAX(invoice_number), 'INV-2025-(\d+)'))[1]::integer + 1 
     FROM invoices 
     WHERE invoice_number LIKE 'INV-2025-%'), 1)::text, 3, '0')
  INTO v_invoice_number;
  
  -- Insert invoice if client and product exist and invoice number is unique
  IF v_client_id IS NOT NULL AND v_product_id IS NOT NULL AND 
     NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = v_invoice_number) THEN
    -- Generate invoice ID
    v_invoice_id := gen_random_uuid();
    
    -- Insert invoice
    INSERT INTO invoices (
      id,
      invoice_number, 
      client_id, 
      invoice_date, 
      currency, 
      total_amount
    )
    VALUES (
      v_invoice_id,
      v_invoice_number, 
      v_client_id, 
      NOW(), 
      'USD', 
      1500.00
    );

    -- Insert invoice items
    INSERT INTO invoice_items (
      id,
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
      gen_random_uuid(),
      v_invoice_id,
      v_product_id,
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
END $$;
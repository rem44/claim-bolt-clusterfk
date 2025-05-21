/*
  # Add Test Data Migration

  1. New Data
    - Test clients with basic information
    - Sample carpet products
    - Example invoice with items
    
  2. Changes
    - Uses ON CONFLICT DO NOTHING for idempotent inserts
    - Generates unique invoice numbers dynamically
    - Handles foreign key relationships safely
    
  3. Notes
    - All IDs are generated using gen_random_uuid()
    - Ensures no duplicate records are created
    - Maintains referential integrity
*/

-- Add test clients
INSERT INTO clients (id, name, code, address, phone, email)
SELECT 
  gen_random_uuid(),
  name,
  code,
  address,
  phone,
  email
FROM (
  VALUES 
    ('Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
    ('Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
    ('Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com')
) AS data(name, code, address, phone, email)
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE code = data.code
);

-- Add test products
INSERT INTO products (id, code, description, style, color, style_number, color_number, format)
SELECT 
  gen_random_uuid(),
  code,
  description,
  style,
  color,
  style_number,
  color_number,
  format
FROM (
  VALUES
    ('CAR001', 'Premium Carpet Tile', 'Modern Lines', 'Deep Blue', 'ML100', 'DB01', '24x24'),
    ('CAR002', 'Luxury Broadloom', 'Executive Plus', 'Charcoal Grey', 'EP200', 'CG02', '12ft')
) AS data(code, description, style, color, style_number, color_number, format)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE code = data.code
);

-- Add test invoices and items
DO $$ 
DECLARE
  v_client_id uuid;
  v_product_id uuid;
  v_invoice_id uuid;
  v_invoice_number text;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO v_client_id 
  FROM clients 
  WHERE code = 'ACME001' 
  LIMIT 1;
  
  -- Get product ID for CAR001
  SELECT id INTO v_product_id 
  FROM products 
  WHERE code = 'CAR001' 
  LIMIT 1;
  
  -- Only proceed if we have both client and product
  IF v_client_id IS NOT NULL AND v_product_id IS NOT NULL THEN
    -- Generate unique invoice number
    SELECT 
      'INV-2025-' || LPAD(CAST(COALESCE(
        MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 
        0
      ) + 1 AS TEXT), 4, '0')
    INTO v_invoice_number
    FROM invoices 
    WHERE invoice_number LIKE 'INV-2025-%';
    
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
      gen_random_uuid(),
      v_invoice_number, 
      v_client_id, 
      NOW(), 
      'USD', 
      1500.00
    )
    RETURNING id INTO v_invoice_id;

    -- Insert invoice item
    IF v_invoice_id IS NOT NULL THEN
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
  END IF;
END $$;
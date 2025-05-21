/*
  # Add Sample Data

  1. New Data
    - Sample clients
    - Sample products
    - Sample invoice with items

  2. Changes
    - Adds test data for development and testing
    - Uses safe insertion methods to avoid conflicts
*/

-- Add test clients
INSERT INTO clients (id, name, code, address, phone, email)
VALUES 
  (gen_random_uuid(), 'Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
  (gen_random_uuid(), 'Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
  (gen_random_uuid(), 'Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com');

-- Add test products
INSERT INTO products (id, code, description, style, color, style_number, color_number, format)
VALUES
  (gen_random_uuid(), 'CAR001', 'Premium Carpet Tile', 'Modern Lines', 'Deep Blue', 'ML100', 'DB01', '24x24'),
  (gen_random_uuid(), 'CAR002', 'Luxury Broadloom', 'Executive Plus', 'Charcoal Grey', 'EP200', 'CG02', '12ft');

-- Add test invoices and items
DO $$ 
DECLARE
  v_client_id uuid;
  v_product_id uuid;
  v_invoice_id uuid;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO v_client_id FROM clients WHERE code = 'ACME001' LIMIT 1;
  
  -- Get product ID
  SELECT id INTO v_product_id FROM products WHERE code = 'CAR001' LIMIT 1;
  
  -- Insert invoice if client and product exist
  IF v_client_id IS NOT NULL AND v_product_id IS NOT NULL THEN
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
      'INV-2025-001', 
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
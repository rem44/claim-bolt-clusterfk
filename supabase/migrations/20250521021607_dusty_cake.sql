/*
  # Add Test Data

  1. Test Clients
    - Add sample client records with basic information
  
  2. Test Invoices
    - Add sample invoice linked to test client
    - Use safe insertion with existence checks
*/

-- Add test clients
INSERT INTO clients (name, code, address, phone, email)
VALUES 
  ('Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
  ('Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
  ('Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com')
ON CONFLICT DO NOTHING;

-- Add test invoices
DO $$ 
DECLARE
  client_id uuid;
BEGIN
  -- Get the client ID for Acme Corporation
  SELECT id INTO client_id FROM clients WHERE code = 'ACME001' LIMIT 1;
  
  -- Insert invoice if it doesn't exist
  IF client_id IS NOT NULL THEN
    INSERT INTO invoices (invoice_number, client_id, invoice_date, currency, total_amount)
    VALUES ('INV-2025-001', client_id, NOW(), 'USD', 1500.00)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
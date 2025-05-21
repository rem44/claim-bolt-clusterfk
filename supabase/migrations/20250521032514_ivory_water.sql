/*
  # Add test data for clients and invoices

  1. New Data
    - Adds test clients with basic information
    - Adds test invoices linked to clients
    
  2. Changes
    - Inserts sample data for testing
    - Uses safe insert operations with unique constraints
    
  3. Notes
    - Uses unique constraints to prevent duplicate entries
    - All inserts are idempotent (can be run multiple times safely)
*/

-- Create unique constraint on clients.code if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'clients_code_key'
  ) THEN
    ALTER TABLE clients ADD CONSTRAINT clients_code_key UNIQUE (code);
  END IF;
END $$;

-- Add test clients
INSERT INTO clients (name, code, address, phone, email)
VALUES 
  ('Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
  ('Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
  ('Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com')
ON CONFLICT (code) DO NOTHING;

-- Create unique constraint on invoices.invoice_number if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'invoices_invoice_number_key'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
  END IF;
END $$;

-- Add test invoices
WITH client_ids AS (
  SELECT id, code FROM clients WHERE code = 'ACME001'
)
INSERT INTO invoices (invoice_number, client_id, invoice_date, currency, total_amount)
SELECT 
  'INV-2025-001',
  id,
  NOW(),
  'USD',
  1500.00
FROM client_ids
ON CONFLICT (invoice_number) DO NOTHING;
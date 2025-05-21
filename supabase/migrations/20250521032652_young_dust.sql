/*
  # Add Test Data

  This migration adds initial test data for clients and invoices.

  1. Test Data
    - Adds sample clients
    - Adds sample invoices linked to clients
*/

-- Add test clients
INSERT INTO clients (name, code, address, phone, email)
VALUES 
  ('Acme Corporation', 'ACME001', '123 Business Ave', '555-0123', 'contact@acme.com'),
  ('Global Industries', 'GLOB002', '456 Enterprise St', '555-0124', 'info@globalind.com'),
  ('Tech Solutions', 'TECH003', '789 Innovation Dr', '555-0125', 'hello@techsol.com');

-- Add test invoices
WITH client_data AS (
  SELECT id FROM clients WHERE code = 'ACME001' LIMIT 1
)
INSERT INTO invoices (invoice_number, client_id, invoice_date, currency, total_amount)
SELECT 
  'INV-2025-001',
  id,
  NOW(),
  'USD',
  1500.00
FROM client_data;
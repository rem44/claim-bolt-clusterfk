/*
  # Enable Row Level Security and User Management
  
  1. Security Changes
    - Enables RLS on all relevant tables
    - Adds user management columns to claims table
    - Creates RLS policies for claims, products, and related tables
    - Sets up automatic created_by assignment for new claims
  
  2. Tables Modified
    - claims: Added created_by and assigned_to columns
    - All tables: RLS enabled and policies configured
  
  3. Policies Added
    - Claims: Create, read, and update policies
    - Claim Products: Management policy
    - Claim Documents: Management policy
    - Products: Read policy
*/

-- Enable RLS on all tables that need it
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add user management fields to claims
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE claims ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE claims ADD COLUMN assigned_to uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own claims" ON claims;
DROP POLICY IF EXISTS "Users can read all claims" ON claims;
DROP POLICY IF EXISTS "Users can update claims they created or are assigned to" ON claims;
DROP POLICY IF EXISTS "Users can manage claim products for their claims" ON claim_products;
DROP POLICY IF EXISTS "Users can manage documents for their claims" ON claim_documents;
DROP POLICY IF EXISTS "Users can read all products" ON products;

-- Create policies
CREATE POLICY "Users can create their own claims"
ON claims
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read all claims"
ON claims
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update claims they created or are assigned to"
ON claims
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can manage claim products for their claims"
ON claim_products
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM claims
    WHERE claims.id = claim_products.claim_id
    AND (claims.created_by = auth.uid() OR claims.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can manage documents for their claims"
ON claim_documents
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM claims
    WHERE claims.id = claim_documents.claim_id
    AND (claims.created_by = auth.uid() OR claims.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can read all products"
ON products
FOR SELECT
TO authenticated
USING (true);

-- Create function and trigger for setting created_by
CREATE OR REPLACE FUNCTION set_claim_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_claim_created_by_trigger ON claims;
CREATE TRIGGER set_claim_created_by_trigger
  BEFORE INSERT ON claims
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_created_by();
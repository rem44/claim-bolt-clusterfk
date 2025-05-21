/*
  # Security and User Management Setup

  1. Changes
    - Enable Row Level Security (RLS) on all relevant tables
    - Add user management fields to claims table
    - Create RLS policies for claims, claim products, claim documents, and products
    - Add trigger for automatically setting created_by on claims

  2. Security
    - Enables RLS on all tables that need it
    - Sets up policies for authenticated users
    - Ensures proper access control based on user roles
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
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id);

-- Claims policies
CREATE POLICY IF NOT EXISTS "Users can create their own claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can read all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can update claims they created or are assigned to"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Claim products policies
CREATE POLICY IF NOT EXISTS "Users can manage claim products for their claims"
  ON claim_products
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_products.claim_id
      AND (claims.created_by = auth.uid() OR claims.assigned_to = auth.uid())
    )
  );

-- Claim documents policies
CREATE POLICY IF NOT EXISTS "Users can manage documents for their claims"
  ON claim_documents
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_documents.claim_id
      AND (claims.created_by = auth.uid() OR claims.assigned_to = auth.uid())
    )
  );

-- Products policies
CREATE POLICY IF NOT EXISTS "Users can read all products"
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
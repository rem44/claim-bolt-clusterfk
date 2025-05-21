/*
  # Authentication and RLS Setup

  1. Changes
    - Enable RLS on all tables that need it
    - Add user management fields to claims table
    - Create RLS policies for all tables
    - Add trigger for automatically setting created_by on claims

  2. Security
    - Ensures users can only create claims with themselves as owner
    - Allows users to read all claims
    - Restricts updates to claim owners and assigned users
    - Protects related tables with appropriate policies
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

-- Add user management fields to claims if they don't exist
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_created_by ON claims(created_by);
CREATE INDEX IF NOT EXISTS idx_claims_assigned_to ON claims(assigned_to);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own claims" ON claims;
DROP POLICY IF EXISTS "Users can read all claims" ON claims;
DROP POLICY IF EXISTS "Users can update claims they created or are assigned to" ON claims;

-- Claims policies
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

-- Claim products policies
DROP POLICY IF EXISTS "Users can manage claim products for their claims" ON claim_products;
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

-- Claim documents policies
DROP POLICY IF EXISTS "Users can manage documents for their claims" ON claim_documents;
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

-- Products policies
DROP POLICY IF EXISTS "Users can read all products" ON products;
CREATE POLICY "Users can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger to set created_by on claims
CREATE OR REPLACE FUNCTION set_claim_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_claim_created_by_trigger ON claims;
CREATE TRIGGER set_claim_created_by_trigger
  BEFORE INSERT ON claims
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_created_by();

-- Add comments to document the purpose of each policy
COMMENT ON POLICY "Users can create their own claims" ON claims IS 'Ensures users can only create claims with themselves as the owner';
COMMENT ON POLICY "Users can read all claims" ON claims IS 'Allows authenticated users to read all claims';
COMMENT ON POLICY "Users can update claims they created or are assigned to" ON claims IS 'Allows users to update claims they created or are assigned to';
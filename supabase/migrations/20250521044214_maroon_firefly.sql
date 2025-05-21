/*
  # Authentication and User Management Setup

  1. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add created_by and assigned_to fields to claims table
  
  2. Changes
    - Add user profile management
    - Update claims table with user references
    - Add RLS policies for claims
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_claim_created_by_trigger
  BEFORE INSERT ON claims
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_created_by();
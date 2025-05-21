/*
  # Add Checklist System

  1. New Tables
    - `checklists`
      - `id` (uuid, primary key)
      - `claim_id` (uuid, foreign key)
      - `type` (text)
      - `status` (text)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `checklist_items`
      - `id` (uuid, primary key)
      - `checklist_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `value` (text)
      - `is_completed` (boolean)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users

  3. Changes
    - Add foreign key relationships
    - Add indexes for performance
*/

-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  value text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read all checklists"
  ON checklists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert checklists"
  ON checklists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update checklists"
  ON checklists FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update checklist items"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_checklists_claim_id ON checklists(claim_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- Function to update checklist status
CREATE OR REPLACE FUNCTION update_checklist_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the checklist status based on its items
  UPDATE checklists c
  SET status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM checklist_items ci
      WHERE ci.checklist_id = c.id
      AND ci.is_completed = false
    ) THEN 'completed'
    WHEN EXISTS (
      SELECT 1 FROM checklist_items ci
      WHERE ci.checklist_id = c.id
      AND ci.is_completed = true
    ) THEN 'in_progress'
    ELSE 'pending'
  END,
  completed_at = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM checklist_items ci
      WHERE ci.checklist_id = c.id
      AND ci.is_completed = false
    ) THEN now()
    ELSE null
  END,
  updated_at = now()
  WHERE c.id = NEW.checklist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating checklist status
CREATE TRIGGER update_checklist_status_trigger
AFTER INSERT OR UPDATE OF is_completed ON checklist_items
FOR EACH ROW
EXECUTE FUNCTION update_checklist_status();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
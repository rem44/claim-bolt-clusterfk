/*
  # Create claim documents table

  1. New Tables
    - `claim_documents`
      - `id` (uuid, primary key)
      - `claim_id` (uuid, foreign key to claims.id)
      - `name` (text, not null)
      - `type` (text, not null)
      - `url` (text, not null)
      - `upload_date` (timestamptz, not null)
      - `category` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `claim_documents` table
    - Add policy for authenticated users to read all claim documents
    - Add policy for authenticated users to insert/update their own claim documents
*/

CREATE TABLE IF NOT EXISTS claim_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  upload_date timestamptz NOT NULL,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all claim documents"
  ON claim_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own claim documents"
  ON claim_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own claim documents"
  ON claim_documents
  FOR UPDATE
  TO authenticated
  USING (true);
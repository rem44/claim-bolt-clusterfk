/*
  # Create claims table

  1. New Tables
    - `claims`
      - `id` (uuid, primary key)
      - `claim_number` (text, not null)
      - `client_id` (uuid, foreign key to clients.id)
      - `creation_date` (timestamptz, not null)
      - `status` (text, not null)
      - `department` (text, not null)
      - `claim_category` (text, not null)
      - `identified_cause` (text)
      - `installed` (boolean, not null)
      - `installation_date` (timestamptz)
      - `installer_name` (text)
      - `invoice_link` (text)
      - `solution_amount` (numeric, not null)
      - `claimed_amount` (numeric, not null)
      - `saved_amount` (numeric, not null)
      - `description` (text)
      - `product_category` (text, not null)
      - `last_updated` (timestamptz, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `claims` table
    - Add policy for authenticated users to read all claims
    - Add policy for authenticated users to insert/update their own claims
*/

CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id),
  creation_date timestamptz NOT NULL,
  status text NOT NULL,
  department text NOT NULL,
  claim_category text NOT NULL,
  identified_cause text,
  installed boolean NOT NULL,
  installation_date timestamptz,
  installer_name text,
  invoice_link text,
  solution_amount numeric NOT NULL DEFAULT 0,
  claimed_amount numeric NOT NULL DEFAULT 0,
  saved_amount numeric NOT NULL DEFAULT 0,
  description text,
  product_category text NOT NULL,
  last_updated timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own claims"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (true);
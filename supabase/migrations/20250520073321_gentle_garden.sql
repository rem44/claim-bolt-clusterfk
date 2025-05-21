-- Add new columns for alert system
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS alerts JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS alert_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_alert_check TIMESTAMPTZ DEFAULT now();

-- Create type for alert categories
DO $$ BEGIN
  CREATE TYPE alert_category AS ENUM (
    'price_discrepancy',
    'quantity_exceeded',
    'delayed_claim'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to update alert count
CREATE OR REPLACE FUNCTION update_alert_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.alert_count := jsonb_array_length(NEW.alerts);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update alert count
DO $$ BEGIN
  CREATE TRIGGER update_alert_count_trigger
  BEFORE INSERT OR UPDATE OF alerts ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_count();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to evaluate alerts
CREATE OR REPLACE FUNCTION evaluate_claim_alerts(claim_id uuid)
RETURNS JSONB AS $$
DECLARE
  claim_record RECORD;
  alerts JSONB := '[]';
  installation_threshold INTERVAL := '5 days';
BEGIN
  -- Get claim details
  SELECT c.*, 
         i.total_amount as invoice_amount,
         COALESCE(SUM(ip.quantity), 0) as total_produced
  FROM claims c
  LEFT JOIN invoices i ON i.invoice_number = c.invoice_link
  LEFT JOIN invoice_items ip ON ip.invoice_id = i.id
  WHERE c.id = claim_id
  GROUP BY c.id, i.id
  INTO claim_record;

  -- Check for price discrepancy
  IF claim_record.claimed_amount > claim_record.invoice_amount THEN
    alerts := alerts || jsonb_build_object(
      'type', 'price_discrepancy',
      'message', 'Claimed amount exceeds invoice amount',
      'details', jsonb_build_object(
        'claimed', claim_record.claimed_amount,
        'invoice', claim_record.invoice_amount
      )
    );
  END IF;

  -- Check for quantity exceeded
  IF claim_record.total_produced > 0 AND 
     EXISTS (
       SELECT 1 
       FROM claim_products cp 
       WHERE cp.claim_id = claim_id 
       AND cp.claimed_quantity > claim_record.total_produced
     ) THEN
    alerts := alerts || jsonb_build_object(
      'type', 'quantity_exceeded',
      'message', 'Claimed quantity exceeds total produced',
      'details', jsonb_build_object(
        'produced', claim_record.total_produced
      )
    );
  END IF;

  -- Check for delayed claim
  IF claim_record.installed AND 
     claim_record.installation_date IS NOT NULL AND
     claim_record.creation_date > claim_record.installation_date + installation_threshold THEN
    alerts := alerts || jsonb_build_object(
      'type', 'delayed_claim',
      'message', 'Claim was initiated more than 5 days after installation',
      'details', jsonb_build_object(
        'installation_date', claim_record.installation_date,
        'creation_date', claim_record.creation_date
      )
    );
  END IF;

  RETURN alerts;
END;
$$ LANGUAGE plpgsql;

-- Function to update alerts for a claim
CREATE OR REPLACE FUNCTION update_claim_alerts(claim_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE claims
  SET alerts = evaluate_claim_alerts(id),
      last_alert_check = now()
  WHERE id = claim_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically evaluate alerts on relevant changes
CREATE OR REPLACE FUNCTION trigger_alert_evaluation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_claim_alerts(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER evaluate_alerts_trigger
  AFTER INSERT OR UPDATE OF 
    claimed_amount, 
    installation_date, 
    invoice_link
  ON claims
  FOR EACH ROW
  EXECUTE FUNCTION trigger_alert_evaluation();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
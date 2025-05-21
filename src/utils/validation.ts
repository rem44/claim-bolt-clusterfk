import { supabase } from '../lib/supabase';
import type { Claim } from '../types/claim';

export async function validateClaimData(claim: Partial<Claim>) {
  const errors: string[] = [];

  // Required fields
  const requiredFields = [
    'claim_number',
    'client_id',
    'creation_date',
    'status',
    'department',
    'claim_category',
    'category'
  ];

  requiredFields.forEach(field => {
    if (!claim[field as keyof Claim]) {
      errors.push(`${field} is required`);
    }
  });

  // Client validation
  if (claim.client_id) {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', claim.client_id)
      .single();

    if (clientError || !client) {
      errors.push(`Invalid client_id: ${claim.client_id}`);
    }
  }

  // Date validations
  const dateFields = ['creation_date', 'installation_date', 'last_updated'];
  dateFields.forEach(field => {
    const value = claim[field as keyof Claim];
    if (value && isNaN(Date.parse(value.toString()))) {
      errors.push(`Invalid date format for ${field}`);
    }
  });

  // Numeric validations
  const numericFields = ['solution_amount', 'claimed_amount', 'saved_amount', 'alert_count'];
  numericFields.forEach(field => {
    const value = claim[field as keyof Claim];
    if (value !== undefined && value !== null && isNaN(Number(value))) {
      errors.push(`${field} must be a number`);
    }
  });

  // Boolean validation
  if (claim.installed !== undefined && typeof claim.installed !== 'boolean') {
    errors.push('installed must be a boolean');
  }

  // Array validation
  if (claim.alerts && !Array.isArray(claim.alerts)) {
    errors.push('alerts must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
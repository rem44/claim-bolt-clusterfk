import { supabase } from '../lib/supabase';
import type { Claim, ClaimProduct, ClaimDocument } from '../types/claim';

// Claims
export async function getClaims() {
  try {
    console.log('Fetching claims...');
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        client:clients(id, name, code)
      `)
      .order('creation_date', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} claims`);
    return data as (Claim & { client: { name: string, code: string } })[];
  } catch (err) {
    console.error('Error in getClaims:', err);
    throw err;
  }
}

export async function getClaimById(id: string) {
  try {
    console.log(`Fetching claim with id ${id}...`);
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        client:clients(id, name, code),
        products:claim_products(*),
        documents:claim_documents(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching claim with id ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    return data as (Claim & { 
      client: { name: string, code: string },
      products: ClaimProduct[],
      documents: ClaimDocument[]
    });
  } catch (err) {
    console.error(`Error in getClaimById:`, err);
    throw err;
  }
}

function sanitizeClaimData(claim: Omit<Claim, 'id'>): Omit<Claim, 'id'> {
  return {
    ...claim,
    // Ensure dates are in ISO format
    creation_date: new Date(claim.creation_date).toISOString(),
    installation_date: claim.installation_date 
      ? new Date(claim.installation_date).toISOString() 
      : null,
    last_updated: new Date(claim.last_updated).toISOString(),
    
    // Convert numeric fields
    solution_amount: Number(claim.solution_amount) || 0,
    claimed_amount: Number(claim.claimed_amount) || 0,
    saved_amount: Number(claim.saved_amount) || 0,
    alert_count: Number(claim.alert_count) || 0,
    
    // Ensure boolean fields are actual booleans
    installed: Boolean(claim.installed),
    
    // Ensure arrays are initialized
    alerts: Array.isArray(claim.alerts) ? claim.alerts : [],
    
    // Safely trim strings with null checks
    claim_number: (claim.claim_number ?? '').trim(),
    department: (claim.department ?? '').trim(),
    claim_category: (claim.claim_category ?? '').trim(),
    product_category: (claim.product_category ?? '').trim(), // Changed from category to product_category
    description: (claim.description ?? '').trim(),
    installer_name: claim.installer_name ? claim.installer_name.trim() : null,
    invoice_link: claim.invoice_link ? claim.invoice_link.trim() : null,
    identified_cause: claim.identified_cause ? claim.identified_cause.trim() : null,
  };
}

export async function createClaim(claim: Omit<Claim, 'id'>) {
  try {
    console.log('Creating claim with raw data:', JSON.stringify(claim, null, 2));
    
    // Sanitize the claim data
    const sanitizedClaim = sanitizeClaimData(claim);
    console.log('Sanitized claim data:', JSON.stringify(sanitizedClaim, null, 2));
    
    // Validate client exists
    const { data: clientCheck, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', sanitizedClaim.client_id)
      .single();
      
    if (clientError) {
      console.error('Client validation error:', {
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint,
        code: clientError.code
      });
      throw new Error(`Invalid client_id: ${sanitizedClaim.client_id}`);
    }

    // Insert the claim
    const { data, error } = await supabase
      .from('claims')
      .insert([sanitizedClaim])
      .select()
      .single();

    if (error) {
      console.error('Error creating claim:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('Claim created successfully:', data);
    return data as Claim;
  } catch (err) {
    console.error('Error in createClaim:', err);
    throw err;
  }
}

export async function updateClaim(id: string, claim: Partial<Claim>) {
  try {
    console.log(`Updating claim ${id} with data:`, JSON.stringify(claim, null, 2));
    
    // Sanitize the update data
    const sanitizedUpdate = claim.id ? claim : sanitizeClaimData(claim as Omit<Claim, 'id'>);
    
    const { data, error } = await supabase
      .from('claims')
      .update(sanitizedUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating claim with id ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('Claim updated successfully:', data);
    return data as Claim;
  } catch (err) {
    console.error(`Error in updateClaim:`, err);
    throw err;
  }
}

// Claim Products
export async function getClaimProducts(claimId: string) {
  try {
    const { data, error } = await supabase
      .from('claim_products')
      .select('*')
      .eq('claim_id', claimId);

    if (error) {
      console.error(`Error fetching products for claim ${claimId}:`, error);
      throw error;
    }

    return data as ClaimProduct[];
  } catch (err) {
    console.error('Error in getClaimProducts:', err);
    throw err;
  }
}

export async function addClaimProduct(product: Omit<ClaimProduct, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('claim_products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error adding claim product:', error);
      throw error;
    }

    return data as ClaimProduct;
  } catch (err) {
    console.error('Error in addClaimProduct:', err);
    throw err;
  }
}

export async function updateClaimProduct(id: string, product: Partial<ClaimProduct>) {
  try {
    const { data, error } = await supabase
      .from('claim_products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating claim product with id ${id}:`, error);
      throw error;
    }

    return data as ClaimProduct;
  } catch (err) {
    console.error('Error in updateClaimProduct:', err);
    throw err;
  }
}

export async function deleteClaimProduct(id: string) {
  try {
    const { error } = await supabase
      .from('claim_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting claim product with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteClaimProduct:', err);
    throw err;
  }
}

// Claim Documents
export async function getClaimDocuments(claimId: string) {
  try {
    const { data, error } = await supabase
      .from('claim_documents')
      .select('*')
      .eq('claim_id', claimId);

    if (error) {
      console.error(`Error fetching documents for claim ${claimId}:`, error);
      throw error;
    }

    return data as ClaimDocument[];
  } catch (err) {
    console.error('Error in getClaimDocuments:', err);
    throw err;
  }
}

export async function addClaimDocument(document: Omit<ClaimDocument, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('claim_documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      console.error('Error adding claim document:', error);
      throw error;
    }

    return data as ClaimDocument;
  } catch (err) {
    console.error('Error in addClaimDocument:', err);
    throw err;
  }
}

export async function deleteClaimDocument(id: string) {
  try {
    const { error } = await supabase
      .from('claim_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting claim document with id ${id}:`, error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteClaimDocument:', err);
    throw err;
  }
}
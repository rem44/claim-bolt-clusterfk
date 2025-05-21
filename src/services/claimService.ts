import { supabase } from '../lib/supabase';
import type { Claim, ClaimProduct, ClaimDocument } from '../types/claim';

// Claims
export async function getClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      client:clients(name, code)
    `)
    .order('creation_date', { ascending: false });

  if (error) {
    console.error('Error fetching claims:', error);
    throw error;
  }

  return data as (Claim & { client: { name: string, code: string } })[];
}

export async function getClaimById(id: string) {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      client:clients(name, code),
      products:claim_products(*),
      documents:claim_documents(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching claim with id ${id}:`, error);
    throw error;
  }

  return data as (Claim & { 
    client: { name: string, code: string },
    products: ClaimProduct[],
    documents: ClaimDocument[]
  });
}

export async function createClaim(claim: Omit<Claim, 'id'>) {
  const { data, error } = await supabase
    .from('claims')
    .insert([claim])
    .select()
    .single();

  if (error) {
    console.error('Error creating claim:', error);
    throw error;
  }

  return data as Claim;
}

export async function updateClaim(id: string, claim: Partial<Claim>) {
  const { data, error } = await supabase
    .from('claims')
    .update(claim)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating claim with id ${id}:`, error);
    throw error;
  }

  return data as Claim;
}

// Claim Products
export async function getClaimProducts(claimId: string) {
  const { data, error } = await supabase
    .from('claim_products')
    .select('*')
    .eq('claim_id', claimId);

  if (error) {
    console.error(`Error fetching products for claim ${claimId}:`, error);
    throw error;
  }

  return data as ClaimProduct[];
}

export async function addClaimProduct(product: Omit<ClaimProduct, 'id'>) {
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
}

export async function updateClaimProduct(id: string, product: Partial<ClaimProduct>) {
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
}

export async function deleteClaimProduct(id: string) {
  const { error } = await supabase
    .from('claim_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting claim product with id ${id}:`, error);
    throw error;
  }

  return true;
}

// Claim Documents
export async function getClaimDocuments(claimId: string) {
  const { data, error } = await supabase
    .from('claim_documents')
    .select('*')
    .eq('claim_id', claimId);

  if (error) {
    console.error(`Error fetching documents for claim ${claimId}:`, error);
    throw error;
  }

  return data as ClaimDocument[];
}

export async function addClaimDocument(document: Omit<ClaimDocument, 'id'>) {
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
}

export async function deleteClaimDocument(id: string) {
  const { error } = await supabase
    .from('claim_documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting claim document with id ${id}:`, error);
    throw error;
  }

  return true;
}
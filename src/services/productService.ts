import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('style', { ascending: true })
    .order('color', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }

  return data as Product;
}

export async function getProductByCode(code: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error(`Error fetching product with code ${code}:`, error);
    throw error;
  }

  return data as Product;
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`description.ilike.%${query}%,code.ilike.%${query}%,style.ilike.%${query}%,color.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error(`Error searching products with query ${query}:`, error);
    throw error;
  }

  return data as Product[];
}
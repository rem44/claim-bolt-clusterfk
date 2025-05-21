import { supabase } from '../lib/supabase';
import type { Invoice, InvoiceItem } from '../types/invoice';

export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name, code)
    `)
    .order('invoice_date', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

  return data as (Invoice & { client: { name: string, code: string } })[];
}

export async function getInvoiceById(id: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name, code),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching invoice with id ${id}:`, error);
    throw error;
  }

  return data as (Invoice & { 
    client: { name: string, code: string },
    items: InvoiceItem[]
  });
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name, code),
      items:invoice_items(*)
    `)
    .eq('invoice_number', invoiceNumber)
    .single();

  if (error) {
    console.error(`Error fetching invoice with number ${invoiceNumber}:`, error);
    throw error;
  }

  return data as (Invoice & { 
    client: { name: string, code: string },
    items: InvoiceItem[]
  });
}
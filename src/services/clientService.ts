import { supabase } from '../lib/supabase';
import type { Client } from '../types/client';

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data as Client[];
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching client with id ${id}:`, error);
    throw error;
  }

  return data as Client;
}

export async function createClient(client: Omit<Client, 'id'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data as Client;
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating client with id ${id}:`, error);
    throw error;
  }

  return data as Client;
}
import { supabase } from '../lib/supabase';
import type { Checklist, ChecklistItem } from '../types/checklist';

export async function getClaimChecklists(claimId: string) {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      items:checklist_items(*)
    `)
    .eq('claim_id', claimId)
    .order('created_at');

  if (error) {
    console.error('Error fetching checklists:', error);
    throw error;
  }

  return data as (Checklist & { items: ChecklistItem[] })[];
}

export async function createChecklist(checklist: Omit<Checklist, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('checklists')
    .insert([checklist])
    .select()
    .single();

  if (error) {
    console.error('Error creating checklist:', error);
    throw error;
  }

  return data as Checklist;
}

export async function createChecklistItem(item: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error creating checklist item:', error);
    throw error;
  }

  return data as ChecklistItem;
}

export async function updateChecklistItem(id: string, updates: Partial<ChecklistItem>) {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }

  return data as ChecklistItem;
}

export async function deleteChecklist(id: string) {
  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }

  return true;
}
export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  description?: string;
  value?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  claim_id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
}
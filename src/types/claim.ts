export enum ClaimStatus {
  New = 'New',
  Screening = 'Screening',
  Analyzing = 'Analyzing',
  Negotiation = 'Negotiation',
  Accepted = 'Accepted',
  Closed = 'Closed'
}

export enum ProductCategory {
  Tiles = 'Tiles',
  Broadloom = 'Broadloom'
}

export enum ClaimCategory {
  ManufacturingDefect = 'Manufacturing Defect',
  ShippingIssue = 'Shipping Issue',
  AppearanceOrPerformance = 'Appearance or Performance'
}

export enum Department {
  CustomerService = 'Customer Service',
  Sales = 'Sales',
  ProductionBelleville = 'Production Belleville',
  ProductionSaintGeorges = 'Production Saint-Georges'
}

export interface ClaimProduct {
  id: string;
  description: string;
  style: string;
  color: string;
  quantity: number;
  pricePerSY: number;
  totalPrice: number;
  claimedQuantity: number;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'image' | 'document' | 'email';
  url: string;
  uploadDate: Date;
  category?: string;
}

export interface ClaimChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface ClaimChecklist {
  id: string;
  type: string;
  items: ClaimChecklistItem[];
}

export interface ClaimCommunication {
  id: string;
  date: Date;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject?: string;
  content: string;
  attachments?: string[];
  sender: string;
  recipients?: string[];
}

export interface ClaimAlert {
  type: 'price_discrepancy' | 'quantity_exceeded' | 'delayed_claim';
  message: string;
  details: Record<string, any>;
}

export interface Claim {
  id: string;
  claimNumber: string;
  clientName: string;
  clientId: string;
  creationDate: Date;
  status: ClaimStatus;
  department: Department;
  claimCategory: ClaimCategory;
  identifiedCause?: string;
  installed: boolean;
  installationDate?: Date;
  installerName?: string;
  invoiceLink?: string;
  solutionAmount: number;
  claimedAmount: number;
  savedAmount: number;
  description?: string;
  category: ProductCategory;
  products: ClaimProduct[];
  documents: ClaimDocument[];
  checklists?: ClaimChecklist[];
  communications?: ClaimCommunication[];
  assignedTo?: string;
  lastUpdated: Date;
  alerts: ClaimAlert[];
  alert_count: number;
  last_alert_check: string;
}
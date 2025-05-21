import { Claim, ClaimStatus, ClaimDocument, ClaimProduct, ProductCategory, ClaimCategory, Department } from '../types/claim';
import { Client } from '../types/client';

// Mock clients data
export const mockClients: Client[] = [
  {
    id: 'ACME001',
    name: 'Acme Corporation',
    code: 'ACME001',
    address: '123 Business Ave, Suite 100',
    phone: '(555) 123-4567',
    email: 'contact@acmecorp.com'
  },
  {
    id: 'GLOB002',
    name: 'Global Offices Inc.',
    code: 'GLOB002',
    address: '456 Corporate Blvd',
    phone: '(555) 234-5678',
    email: 'info@globaloffices.com'
  },
  {
    id: 'HOSP003',
    name: 'Hospitality Group',
    code: 'HOSP003',
    address: '789 Hotel Row',
    phone: '(555) 345-6789',
    email: 'contact@hospitalitygroup.com'
  },
  {
    id: 'TECH005',
    name: 'Tech Innovations Ltd',
    code: 'TECH005',
    address: '321 Innovation Park',
    phone: '(555) 456-7890',
    email: 'support@techinnovations.com'
  }
];

// Generate mock data for initial development
export const mockClaims: Claim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2023-0135',
    clientName: 'Acme Corporation',
    clientId: 'ACME001',
    creationDate: new Date('2023-06-15'),
    status: ClaimStatus.New,
    department: Department.CustomerService,
    claimCategory: ClaimCategory.ManufacturingDefect,
    identifiedCause: 'Manufacturing Defect',
    installed: true,
    installationDate: new Date('2023-05-01'),
    installerName: 'John Smith',
    invoiceLink: 'INV-88754',
    solutionAmount: 0,
    claimedAmount: 12500,
    savedAmount: -12500,
    description: 'Carpet tiles showing premature wear after only 3 months of installation.',
    category: ProductCategory.Tiles,
    products: [
      {
        id: 'p1',
        description: 'Venture Modular Carpet - Linear Pattern',
        style: 'VM-Linear',
        color: 'Charcoal Grey',
        quantity: 200,
        pricePerSY: 45,
        totalPrice: 9000,
        claimedQuantity: 200
      },
      {
        id: 'p2',
        description: 'Installation Labor',
        style: 'Service',
        color: 'N/A',
        quantity: 1,
        pricePerSY: 3500,
        totalPrice: 3500,
        claimedQuantity: 1
      }
    ],
    documents: [
      {
        id: 'd1',
        name: 'Site photo 1.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg',
        uploadDate: new Date('2023-06-15'),
        category: 'Site Condition'
      },
      {
        id: 'd2',
        name: 'Invoice.pdf',
        type: 'document',
        url: '/documents/invoice-88754.pdf',
        uploadDate: new Date('2023-06-15'),
        category: 'Financial'
      }
    ],
    lastUpdated: new Date('2023-06-15')
  },
  {
    id: '2',
    claimNumber: 'CLM-2023-0142',
    clientName: 'Global Offices Inc.',
    clientId: 'GLOB002',
    creationDate: new Date('2023-07-22'),
    status: ClaimStatus.Screening,
    department: Department.ProductionBelleville,
    claimCategory: ClaimCategory.AppearanceOrPerformance,
    identifiedCause: 'Color Variation',
    installed: false,
    invoiceLink: 'INV-90122',
    solutionAmount: 0,
    claimedAmount: 8750,
    savedAmount: -8750,
    description: 'Customer reports significant color variation between ordered samples and delivered product.',
    category: ProductCategory.Broadloom,
    products: [
      {
        id: 'p3',
        description: 'Venture Modular Carpet - Geometric',
        style: 'VM-Geo',
        color: 'Blue Steel',
        quantity: 175,
        pricePerSY: 50,
        totalPrice: 8750,
        claimedQuantity: 175
      }
    ],
    documents: [
      {
        id: 'd3',
        name: 'Color comparison.jpg',
        type: 'image',
        url: 'https://images.pexels.com/photos/4753928/pexels-photo-4753928.jpeg',
        uploadDate: new Date('2023-07-22'),
        category: 'Product Condition'
      }
    ],
    lastUpdated: new Date('2023-07-25')
  }
];
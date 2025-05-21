# Venture Claims Management - Technical Documentation

## Introduction

Venture Claims Management is a comprehensive web application designed to streamline the process of managing product claims for carpet and flooring manufacturers. The application enables efficient tracking, analysis, and resolution of customer claims related to manufacturing defects, installation issues, and product performance.

### Purpose

The primary purpose of this application is to:
- Centralize claim information and documentation
- Standardize the claim evaluation process
- Track financial metrics related to claims
- Provide analytics for business decision-making
- Facilitate communication between departments

### Target Users

| Role | Responsibilities |
|------|-----------------|
| Claims Agents | Create and process new claims, communicate with clients |
| Technical Analysts | Evaluate claim validity, perform technical assessments |
| Department Managers | Review claim statistics, approve resolutions |
| Administrators | Manage users, configure system settings |

### Architecture Overview

The application follows a modern client-server architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│ Supabase Backend│◀───▶│ External Systems│
│  (TypeScript)   │     │ (PostgreSQL,    │     │ (Power Automate, │
│                 │     │  Auth, Storage) │     │  Outlook)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Key Components:**
- **Frontend**: React with TypeScript, using Vite as the build tool
- **UI Framework**: Tailwind CSS for styling
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **External Integration**: Microsoft Power Automate for email processing

## Database Schema

The application uses Supabase as its backend, with the following database structure:

### Core Tables

#### users
Extends Supabase's built-in auth.users table.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key, references auth.users |
| full_name | TEXT | No | User's full name |
| avatar_url | TEXT | No | URL to user's profile image |
| department | TEXT | No | Department the user belongs to |
| role | TEXT | Yes | User role (default: 'user') |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### clients

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | TEXT | Yes | Client name |
| code | TEXT | Yes | Unique client identifier |
| address | TEXT | No | Client address |
| phone | TEXT | No | Contact phone number |
| email | TEXT | No | Contact email |
| contact_person | TEXT | No | Primary contact person |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### claims

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| claim_number | TEXT | Yes | Unique claim identifier |
| client_id | UUID | Yes | References clients.id |
| creation_date | TIMESTAMP | Yes | Claim creation date |
| status | TEXT | Yes | Current status (New, Screening, etc.) |
| department | TEXT | Yes | Department handling the claim |
| claim_category | TEXT | Yes | Category of claim |
| identified_cause | TEXT | No | Root cause if identified |
| installed | BOOLEAN | Yes | Whether product was installed |
| installation_date | TIMESTAMP | No | Date of installation if applicable |
| installer_name | TEXT | No | Name of installer if applicable |
| invoice_link | TEXT | No | Reference to invoice |
| solution_amount | NUMERIC | Yes | Amount offered as solution |
| claimed_amount | NUMERIC | Yes | Amount claimed by customer |
| saved_amount | NUMERIC | Yes | Difference between claimed and solution |
| description | TEXT | No | Detailed description of the claim |
| product_category | TEXT | Yes | Category of product involved |
| last_updated | TIMESTAMP | Yes | Last update timestamp |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |
| alerts | JSONB | No | Array of alert objects |
| alert_count | INTEGER | No | Count of active alerts |
| last_alert_check | TIMESTAMP | No | Last alert evaluation timestamp |
| created_by | UUID | No | References users.id |
| assigned_to | UUID | No | References users.id |

#### claim_products

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| claim_id | UUID | Yes | References claims.id |
| description | TEXT | Yes | Product description |
| style | TEXT | Yes | Product style |
| color | TEXT | Yes | Product color |
| quantity | NUMERIC | Yes | Original quantity |
| price_per_sy | NUMERIC | Yes | Price per square yard |
| total_price | NUMERIC | Yes | Total price |
| claimed_quantity | NUMERIC | Yes | Quantity being claimed |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### claim_documents

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| claim_id | UUID | Yes | References claims.id |
| name | TEXT | Yes | Document name |
| type | TEXT | Yes | Document type (image, document) |
| url | TEXT | Yes | URL to the document |
| upload_date | TIMESTAMP | Yes | Upload timestamp |
| category | TEXT | No | Document category |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |
| uploaded_by | UUID | No | References users.id |

#### products

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| code | TEXT | Yes | Product code |
| color | TEXT | Yes | Product color |
| color_number | TEXT | Yes | Color identifier |
| description | TEXT | Yes | Product description |
| format | TEXT | No | Product format |
| style | TEXT | Yes | Product style |
| style_number | TEXT | Yes | Style identifier |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### invoices

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| invoice_number | TEXT | Yes | Unique invoice identifier |
| client_id | UUID | Yes | References clients.id |
| invoice_date | TIMESTAMP | Yes | Invoice date |
| currency | TEXT | Yes | Currency code |
| exchange_rate | NUMERIC | No | Exchange rate if applicable |
| total_amount | NUMERIC | Yes | Total invoice amount |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |
| rep_name | TEXT | No | Sales representative name |
| rep_code | SMALLINT | No | Sales representative code |

#### invoice_items

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| invoice_id | UUID | Yes | References invoices.id |
| product_id | UUID | Yes | References products.id |
| shipping_code | TEXT | No | Shipping reference code |
| item_description | TEXT | Yes | Item description |
| unit_cost_price | NUMERIC | Yes | Cost price per unit |
| unit_selling_price | NUMERIC | Yes | Selling price per unit |
| quantity | NUMERIC | Yes | Quantity |
| total_cost | NUMERIC | Yes | Total cost |
| total_price | NUMERIC | Yes | Total price |
| total_profit | NUMERIC | Yes | Total profit |
| profit_percentage | NUMERIC | Yes | Profit percentage |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

### Support Tables

#### checklists

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| claim_id | UUID | Yes | References claims.id |
| type | TEXT | Yes | Checklist type |
| status | TEXT | Yes | Status (pending, in_progress, completed) |
| completed_at | TIMESTAMP | No | Completion timestamp |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### checklist_items

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| checklist_id | UUID | Yes | References checklists.id |
| title | TEXT | Yes | Item title |
| description | TEXT | No | Item description |
| value | TEXT | No | Item value if applicable |
| is_completed | BOOLEAN | No | Completion status |
| completed_at | TIMESTAMP | No | Completion timestamp |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### communications

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| claim_id | UUID | Yes | References claims.id |
| type | TEXT | Yes | Communication type (email, call, etc.) |
| date | TIMESTAMP | No | Communication date |
| subject | TEXT | No | Subject line |
| content | TEXT | Yes | Communication content |
| sender | TEXT | Yes | Sender information |
| recipients | TEXT[] | No | Array of recipients |
| attachments | TEXT[] | No | Array of attachment references |
| created_at | TIMESTAMP | No | Creation timestamp |
| updated_at | TIMESTAMP | No | Last update timestamp |

#### alerts

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| user_id | UUID | No | References users.id |
| claim_id | UUID | No | References claims.id |
| message | TEXT | Yes | Alert message |
| type | TEXT | Yes | Alert type |
| read | BOOLEAN | No | Read status |
| created_at | TIMESTAMP | No | Creation timestamp |

### Database Relationships

```
users ◄─────┐
  ▲         │
  │         │
  │         │
claims ─────┼───► claim_products
  │         │
  │         │
  ▼         │
clients     │
  ▲         │
  │         │
  │         │
invoices ───┘
  │
  │
  ▼
invoice_items ───► products
```

## Setup Guide

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/venture-claims-management.git
   cd venture-claims-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create a `.env` file in the project root with the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_NAME=Venture Claims Management
   VITE_APP_VERSION=1.0.0
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For API server (chatbot and integrations)**
   ```bash
   cd server
   npm install
   npm start
   ```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migrations**
   The migrations are located in the `supabase/migrations` directory and should be executed in order.

3. **Configure authentication**
   - Enable Email/Password sign-in method
   - Set up Row Level Security (RLS) policies

4. **Set up storage buckets**
   - Create a `claim-documents` bucket for storing claim-related files
   - Configure appropriate access policies

### Deployment

#### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```
   
   Or to Netlify:
   ```bash
   netlify deploy --prod
   ```

3. **Configure environment variables** in the hosting platform dashboard

#### API Server Deployment

1. **Prepare for production**
   ```bash
   cd server
   npm install --production
   ```

2. **Deploy to a Node.js hosting service** (Heroku, DigitalOcean, etc.)
   ```bash
   # Example for Heroku
   heroku create
   git push heroku main
   ```

3. **Configure environment variables** on the hosting platform

## User Guide

### Claim Lifecycle

The claim management process follows a structured workflow:

1. **Creation**: A new claim is created with basic information
2. **Screening**: Initial review to determine if the claim is valid
3. **Analysis**: Technical assessment of the claim
4. **Negotiation**: Discussion of resolution options
5. **Acceptance**: Approval of the final resolution
6. **Closure**: Claim is marked as resolved and closed

#### Status Transitions

```
New ──► Screening ──► Analyzing ──► Negotiation ──► Accepted ──► Closed
```

Each status transition may require specific fields to be completed:

| From Status | To Status | Required Fields |
|-------------|-----------|-----------------|
| New | Screening | client_id, claim_category, department |
| Screening | Analyzing | installed, invoice_link (if available) |
| Analyzing | Negotiation | identified_cause, at least one checklist |
| Negotiation | Accepted | solution_amount |
| Accepted | Closed | All required fields |

### Dashboard

The dashboard provides an overview of all claims with key metrics:

- Total active claims
- Financial summary (claimed amounts, solution amounts, savings)
- Claims by status
- Recent activity

#### Filtering and Sorting

Users can filter the dashboard by:
- Status
- Department
- Cause
- Installation status
- Date range
- Alert status

### Claim Details

The claim details page is organized into tabs:

1. **General**: Basic claim information
2. **Products**: Products involved in the claim
3. **Documents**: Photos and files related to the claim
4. **Checklists**: Technical assessment checklists
5. **Communications**: History of communications
6. **Resolution**: Financial resolution details

### Document Management

The application supports various document types:

- Photos of product issues
- Installation documentation
- Correspondence with clients
- Technical reports

Documents can be:
- Uploaded directly through the UI
- Attached via email (Power Automate integration)
- Categorized for easy reference

### Alerts System

The application includes an automated alert system that flags potential issues:

- **Price Discrepancy**: When claimed amount exceeds invoice amount
- **Quantity Exceeded**: When claimed quantity exceeds total produced
- **Delayed Claim**: When a claim is filed more than 5 days after installation

Alerts appear as badges on claims and in the alerts section.

## Admin Guide

### User Management

Administrators can manage users through the Settings page:

1. **Create users**: Add new users with appropriate roles
2. **Assign roles**: Set permissions based on job function
3. **Manage departments**: Organize users by department

### Client Management

The Clients page allows administrators to:

1. **Add clients**: Create new client records
2. **Edit client details**: Update contact information
3. **View client history**: See all claims associated with a client

### Data Import/Export

The application supports bulk operations:

1. **Import clients**: Upload client data via CSV or Excel
2. **Import products**: Add product catalog data
3. **Export reports**: Generate reports in various formats

#### Import Format Requirements

For client imports:
- CSV or Excel format
- Required columns: client_code, client_name
- Optional columns: contact_person, email, phone, address

For product imports:
- CSV or Excel format
- Required columns: code, description, style, color
- Optional columns: format, style_number, color_number

## Technical Reference

### Component Structure

The application follows a modular component structure:

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── ui/              # Reusable UI components
│   └── [feature]/       # Feature-specific components
├── context/             # React Context providers
├── pages/               # Page components
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── lib/                 # Library configurations
```

### Key Components

#### Layout Components

- **Layout.tsx**: Main layout wrapper
- **Header.tsx**: Top navigation bar
- **Sidebar.tsx**: Side navigation menu

#### UI Components

- **StatusBadge.tsx**: Displays claim status with appropriate styling
- **AlertBadge.tsx**: Shows alerts with hover details
- **ChecklistSection.tsx**: Manages claim checklists
- **ProductSelector.tsx**: Component for selecting products
- **InvoiceSelector.tsx**: Component for selecting invoices

#### Page Components

- **Dashboard.tsx**: Main dashboard view
- **ClaimDetails.tsx**: Detailed claim view
- **CreateClaim.tsx**: Claim creation form
- **ClientsPage.tsx**: Client management
- **AlertsPage.tsx**: Alert management
- **ReportsPage.tsx**: Reporting interface

### State Management

The application uses React Context API for state management:

- **AuthContext**: Manages user authentication state
- **ClaimsContext**: Provides access to claims data
- **ProductsContext**: Manages product catalog data
- **InvoicesContext**: Handles invoice data

### API Services

Services handle communication with the Supabase backend:

- **authService.ts**: Authentication operations
- **claimService.ts**: Claim CRUD operations
- **clientService.ts**: Client management
- **productService.ts**: Product catalog operations
- **invoiceService.ts**: Invoice management
- **checklistService.ts**: Checklist operations
- **alertService.ts**: Alert management

### Authentication Flow

1. User enters credentials on the Login page
2. AuthContext calls authService.signIn()
3. Supabase validates credentials and returns a session
4. User profile is fetched and stored in context
5. Protected routes become accessible

### Data Flow

```
User Action ──► React Component ──► Context API ──► Service Layer ──► Supabase API
     ▲                                                                    │
     └────────────────── State Update ◄────────────────────────────────────┘
```

### Row Level Security (RLS)

Supabase RLS policies control data access:

- Users can read all claims but only update their own or assigned claims
- Users can only view their own profile information
- Administrators have expanded access rights

## Customization Guide

### Adding New Claim Statuses

1. Update the ClaimStatus enum in `src/types/claim.ts`
2. Add styling for the new status in `StatusBadge.tsx`
3. Update status transition logic in relevant components

### Extending Checklists

1. Add new template to the `CHECKLIST_TEMPLATES` object in `ChecklistSection.tsx`
2. Ensure database schema supports any new fields

### Styling Customization

The application uses Tailwind CSS with a custom theme:

- Corporate colors are defined in `tailwind.config.js`
- Component-specific styles use Tailwind utility classes

## Integration with External Systems

### Power Automate + Outlook

The application integrates with Microsoft Power Automate to process emails:

1. Power Automate flow monitors a designated inbox
2. Emails with subject containing "[Réclamation]" are processed
3. Email content and attachments are sent to the API endpoint
4. The API creates a new claim and attaches documents
5. Confirmation is sent to the sender

### OpenAI Integration

The Smart Chat feature uses OpenAI's API:

1. User questions are sent to a Node.js API
2. The API retrieves relevant context from the database
3. OpenAI generates a response based on the context
4. Response is displayed to the user and saved in the chat history

## Performance Considerations

### Database Optimization

- Indexes are created on frequently queried columns
- JSONB is used for flexible data structures (alerts)
- Foreign key constraints ensure data integrity

### Frontend Optimization

- React components use memoization where appropriate
- Large lists implement pagination
- Images are optimized and loaded on demand

## Security Considerations

### Authentication

- JWT-based authentication via Supabase Auth
- Session management with automatic token refresh
- Protected routes require authentication

### Data Access Control

- Row Level Security (RLS) policies in Supabase
- Role-based access control for UI elements
- Input validation on both client and server

### API Security

- CORS configuration to prevent unauthorized access
- Rate limiting to prevent abuse
- Environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **Authentication failures**
   - Check Supabase URL and anon key in environment variables
   - Verify user exists in Supabase Auth

2. **Missing data**
   - Check RLS policies in Supabase
   - Verify correct foreign key relationships

3. **File upload issues**
   - Confirm storage bucket permissions
   - Check file size limits

### Logging

- Client-side errors are logged to the console
- Server-side errors are logged to the server console
- Critical errors trigger alerts to administrators

## Appendix

### Glossary

- **Claim**: A formal request from a client regarding product issues
- **Checklist**: A set of verification items for claim assessment
- **RLS**: Row Level Security, Supabase's access control mechanism

### API Reference

Detailed API documentation is available in the `/docs/api.md` file.

### Database Schema Diagram

A complete database schema diagram is available in the `/docs/database-schema.md` file.
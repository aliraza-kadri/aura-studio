# AURA STUDIO | Luxury Menswear & POS Automation

A modern full-stack business automation and Point of Sale (POS) system for luxury menswear and bespoke tailoring.

## Project Structure

```
aura-studio/
├── frontend/                        # Client-Side Application (Next.js 16, React 19, Tailwind)
│   ├── app/                         # App Router Pages (POS, Products, Dashboard, Conversations)
│   │   ├── pos/                     # Retail Billing & Register
│   │   ├── products/                # Inventory Catalog & Stock Control
│   │   ├── conversations/           # Client Messaging
│   │   └── page.tsx                 # Main Store Analytics Dashboard
│   ├── components/                  # Reusable UI & Feature Components
│   │   ├── dashboard/               # Navigation, Metrics, Activity
│   │   ├── pos/                     # Catalog, Cart, Landscape Invoice Modal
│   │   └── products/                # Product List, Add/Edit Modals
│   ├── lib/                         # Supabase Client & Utilities
│   ├── public/                      # Brand Logo & Static Assets
│   ├── types/                       # Frontend Type Definitions
│   └── package.json                 # Frontend Dependencies
│
├── backend/                         # Server & Data Logic (Supabase / PostgreSQL)
│   ├── database/                    # SQL Schemas & Database Migrations
│   │   ├── schema.sql               # Complete PostgreSQL Schema (All Tables)
│   │   └── setup_rls_and_storage.sql# Storage Bucket & Security Policies
│   ├── services/                    # Business Logic Services
│   │   ├── productService.ts        # Product CRUD & Stock Management
│   │   ├── invoiceService.ts        # Tax Invoice Generation & Itemization
│   │   └── customerService.ts       # Customer Registry & Search
│   ├── config/                      # Supabase Server Client Config
│   ├── types/                       # Backend Entity Type Definitions
│   └── package.json                 # Backend Specifications
│
├── vercel.json                      # Vercel Deployment Configuration
└── package.json                     # Monorepo Workspace Orchestration
```

## Getting Started

### Run Frontend Locally:
```bash
npm run dev
# or
npm run dev:frontend
```

### Build for Production:
```bash
npm run build
```

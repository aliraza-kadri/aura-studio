# AURA STUDIO - Frontend Architecture

The client-side Next.js web application for Aura Studio Luxury Menswear & POS.

## Structure

```
frontend/
├── app/                        # Next.js App Router (POS, Products, Dashboard, Conversations)
│   ├── pos/                    # Retail Billing & Cash Register
│   ├── products/               # Product Catalog & Stock Management
│   ├── conversations/          # Client Concierge Messaging
│   └── page.tsx                # Main Executive Dashboard
├── components/                 # Reusable UI & Feature components
│   ├── dashboard/              # Sidebar, Header, Metric Cards
│   ├── pos/                    # Product catalog, Cart, Landscape Invoice Modal
│   └── products/               # Product table, Add/Edit modal
├── lib/                        # Supabase client & utilities
├── public/                     # Brand logo, icons, static assets
└── types/                      # Frontend TypeScript definitions
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

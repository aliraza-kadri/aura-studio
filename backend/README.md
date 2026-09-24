# AURA STUDIO - Backend Architecture

This directory contains the database schemas, Supabase configurations, and data services for Aura Studio.

## Structure

```
backend/
├── config/
│   └── supabase.ts                 # Supabase client & environment configuration
├── database/
│   ├── schema.sql                  # PostgreSQL complete schema & tables
│   └── setup_rls_and_storage.sql   # Storage bucket & Row-Level Security policies
├── services/
│   ├── productService.ts           # Product CRUD & stock operations
│   ├── invoiceService.ts           # Tax invoice generation & line items
│   └── customerService.ts          # Client profiles & search
└── types/
    └── index.ts                    # Backend database models and interfaces
```

## Setup Instructions

1. **Database & Storage Setup**:
   Execute `database/setup_rls_and_storage.sql` inside the Supabase SQL Editor.
2. **Schema Reference**:
   The full database structure is documented in `database/schema.sql`.

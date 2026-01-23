# CLAUDE.md

## What This Project Is

Multi-tenant SaaS platform for aviation operations management. Handles flights, clients, quotations, financial tracking, and public client portals for aviation companies.

**Tech**: React 18, TypeScript, Vite, Supabase (PostgreSQL), shadcn-ui, Tailwind CSS, TanStack React Query

## Architecture

```
src/
├── pages/           # Route components (Landing, Auth, Flights, Clients, etc.)
├── components/      # UI components organized by feature
│   ├── ui/          # shadcn-ui base components
│   └── [feature]/   # Feature-specific components
├── contexts/        # React Context for state (Flights, Clients, Quotations, Financial)
├── hooks/           # Custom hooks (useAuth, useCompanyId, usePortalSettings)
├── lib/             # Utilities (PDF generators, error handling, logger)
├── integrations/    # Supabase client and auto-generated types
└── types/           # TypeScript type definitions

supabase/
├── config.toml      # Supabase local config
└── migrations/      # Database migrations
```

**Key patterns**:
- Multi-tenancy via `company_id` filtering in contexts
- Supabase Auth with role-based access (admin, operational, commercial)
- Context API for domain state management
- PDF generation in `src/lib/` for invoices and quotations

## How to Verify Changes

```bash
pnpm install         # Install dependencies
pnpm build           # Build the project
pnpm lint            # Run ESLint
pnpm dev             # Start dev server on :8080
```

Note: No test suite configured yet.

## Environment

Copy `.env` to new worktrees. Required variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

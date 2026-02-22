# Van Heerikhuize Architectuur Website

## Overview

This is a portfolio/business website for **Van Heerikhuize Architectuur**, a Dutch architecture firm based in Ede, Netherlands. The site showcases their services (residential construction, commercial buildings, and interior design) and provides a contact form for potential clients. It's built as a full-stack TypeScript application with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS with CSS custom properties for theming. The color scheme is a green/olive palette (`#96AB50` primary) matching the architecture firm's branding.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives. Components live in `client/src/components/ui/`.
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with React plugin
- **Fonts**: Open Sans (body), Roboto (heading), loaded via Google Fonts
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`

### Backend
- **Framework**: Express 5 (TypeScript, run via tsx)
- **API**: REST API with contact form, project CRUD, project images, and auth endpoints
- **Storage**: PostgreSQL-backed `DatabaseStorage` class implementing `IStorage` interface
- **Auth**: Session-based authentication with bcrypt password hashing, connect-pg-simple session store
- **File uploads**: multer for image uploads to `client/public/uploads/`
- **HTTP Server**: Node.js `http.createServer` wrapping Express

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in `shared/schema.ts`:
  - `users` table: id (UUID), username, password
  - `projects` table: id (serial), title, category, image, description, sortOrder, createdAt
  - `project_images` table: id (serial), projectId, image, sortOrder
- **Migrations**: Drizzle Kit with `db:push` command, migrations output to `./migrations`
- **Connection**: Uses `DATABASE_URL` environment variable
- **Validation**: drizzle-zod for generating Zod schemas from Drizzle table definitions

### Build & Deploy
- **Development**: `tsx server/index.ts` runs the server with Vite middleware for HMR
- **Production Build**: Custom build script (`script/build.ts`) that uses Vite for client and esbuild for server, outputting to `dist/`
- **Production Server**: Serves static files from `dist/public` with SPA fallback

### Project Structure
```
client/               # Frontend React app
  src/
    components/ui/    # shadcn/ui components
    hooks/            # Custom React hooks
    lib/              # Utilities (queryClient, cn helper)
    pages/            # Page components (Home, Projecten, Wonen, Werken, Interieur, ProjectDetail, Admin, AdminLogin, not-found)
server/               # Backend Express server
  index.ts            # Entry point
  routes.ts           # API route definitions
  storage.ts          # Data storage layer
  static.ts           # Production static file serving
  vite.ts             # Dev server Vite middleware
shared/               # Shared between client and server
  schema.ts           # Drizzle DB schema + Zod types
attached_assets/      # Branding config and content files
```

### Key Design Decisions
- **Monorepo structure**: Client and server share TypeScript types through `shared/` directory, ensuring type safety across the stack
- **Storage interface pattern**: `IStorage` interface allows swapping between in-memory storage (development) and database-backed storage (production) without changing business logic
- **SPA architecture**: Single-page app with client-side routing; server falls back to `index.html` for all non-API routes
- **Dutch language content**: The website content is in Dutch (contact form fields, navigation items, service descriptions)

## External Dependencies

### Required Services
- **PostgreSQL**: Required for production. Connection string via `DATABASE_URL` environment variable. Currently the app uses in-memory storage but the Drizzle schema and config are ready for Postgres.

### Key NPM Packages
- **express** v5 — HTTP server
- **drizzle-orm** + **drizzle-kit** — Database ORM and migration tooling
- **@tanstack/react-query** — Client-side data fetching
- **wouter** — Client-side routing
- **zod** + **drizzle-zod** — Runtime validation
- **connect-pg-simple** — PostgreSQL session store (available but not yet wired up)
- **Radix UI** — Accessible UI primitives (full suite installed)
- **embla-carousel-react** — Carousel component
- **recharts** — Charting library
- **react-day-picker** — Date picker
- **vaul** — Drawer component
- **lucide-react** — Icon library

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (conditionally loaded)
- `@replit/vite-plugin-dev-banner` — Dev banner (conditionally loaded)
# Gtrack — Frontend

A modern, production-ready **Next.js 16 (App Router)** dashboard for the Gtrack
asset & sack tracking platform. It talks directly to the FastAPI backend that
lives in [`../Gtrack-backend`](../Gtrack-backend).

The UI is built with:

- **Next.js App Router** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui**
- **TanStack Query** for server state, **Zustand** for client state
- **React Hook Form** + **Zod** for forms & validation
- **Sonner** for toasts, **Framer Motion** + `tw-animate-css` for motion
- **Axios** API client with silent refresh-token rotation

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env (point to the backend)
cp .env.local.example .env.local
# edit NEXT_PUBLIC_API_BASE_URL if your backend isn't on :8000

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

Make sure the backend is running:

```bash
cd ../Gtrack-backend
uvicorn app.main:app --reload
```

---

## Folder structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Public auth pages (login, register, accept-invite)
│   ├── (onboarding)/        # First-run org/instance/group wizard
│   ├── (dashboard)/         # Protected app shell
│   │   ├── dashboard/       # Overview
│   │   ├── assets/          # List + detail
│   │   ├── sacks/           # List + detail with state actions
│   │   ├── locations/
│   │   ├── instances/
│   │   ├── groups/
│   │   ├── users/
│   │   ├── invites/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx             # Marketing landing
│
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── layout/              # Sidebar, Topbar, DashboardShell, CommandPalette
│   └── shared/              # PageHeader, StatusBadge, EmptyState, etc.
│
├── hooks/                   # useAuthGuard, useDebounce, useWorkspace
├── lib/                     # api-client, utils
├── services/                # One file per backend resource
├── store/                   # Zustand stores (auth, ui, workspace)
├── schemas/                 # Zod schemas
├── types/                   # Shared TS types mirroring backend Pydantic
├── providers/               # ThemeProvider, QueryProvider, AppProviders
├── constants/               # Routes, color maps, app metadata
└── styles/
```

---

## Backend integration

| Concern        | Endpoint family       | Service file                       |
| -------------- | --------------------- | ---------------------------------- |
| Auth           | `/auth/*`             | `services/auth.service.ts`         |
| Users / roles  | `/users`, `/roles`    | `services/users.service.ts`        |
| Organizations  | `/orgs/*`             | `services/organizations.service.ts`|
| Instances      | `/instances/*`        | `services/organizations.service.ts`|
| Groups         | `/groups/*`           | `services/organizations.service.ts`|
| Locations      | `/locations/*`        | `services/locations.service.ts`    |
| Assets         | `/assets/*`           | `services/assets.service.ts`       |
| Sacks          | `/sacks/*`            | `services/sacks.service.ts`        |
| Invites        | `/invites/*`          | `services/invites.service.ts`      |

All endpoints flow through a single Axios instance (`lib/api-client.ts`) that:

- Attaches the access token from the Zustand auth store on every request
- Sends credentials so the HttpOnly refresh cookie travels with each call
- On `401`, performs a **silent refresh** and replays the failed request
- On hard auth failure, clears the auth store

---

## Highlights

- **Mobile-first responsive shell** — sidebar collapses into a Sheet drawer below `lg`.
- **Command palette** — ⌘K (Ctrl+K) anywhere; navigate or trigger quick actions.
- **Workspace switcher** — Org → Instance → Group cascading selects, persisted in localStorage.
- **Lifecycle UI** — Sack detail page exposes the full state machine
  (Picked up → Delivered → Closed) as guarded buttons.
- **Three-step onboarding** — new users go through Create org → Add instance → Create group.
- **Light + dark + system themes** with no FOUC.
- **Production-quality empty states, skeletons, and toast feedback** everywhere.

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build (also typechecks)
npm run start    # Run prod server
npm run lint     # ESLint
```

---

## Deployment

This app is Vercel-ready. Just point `NEXT_PUBLIC_API_BASE_URL` at your
production backend and deploy:

```bash
vercel
```

For Docker / self-hosting:

```bash
npm run build
npm start
```

---

## License

Same as the parent Gtrack project.

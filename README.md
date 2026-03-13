# SyncroMind AI

> AI-powered project and task management. Organize smarter, ship faster.

---

## Tech Stack

| Layer        | Technology                                          |
|-------------|------------------------------------------------------|
| Framework    | Next.js 16 (App Router)                             |
| Language     | TypeScript                                          |
| Database     | MySQL + Prisma 7 ORM                                |
| Auth         | NextAuth.js v5 (Auth.js) — Credentials + JWT        |
| Styling      | Tailwind CSS v4 + shadcn/ui                         |
| Animations   | Framer Motion (with `useReducedMotion` support)     |
| Icons        | Lucide React                                        |

---

## Project Structure

```
nextjs-mysql-task-manager/
├── my-app/                         # Next.js application root
│   ├── app/
│   │   ├── (auth)/                 # Route group: login, register
│   │   │   ├── layout.tsx          # Centered auth shell
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/            # Route group: protected pages
│   │   │   ├── layout.tsx          # Sidebar + Navbar shell
│   │   │   └── dashboard/page.tsx  # Dashboard home
│   │   ├── api/auth/[...nextauth]/ # NextAuth route handler
│   │   ├── globals.css             # Tailwind v4 + theme variables
│   │   ├── layout.tsx              # Root layout (ThemeProvider)
│   │   └── page.tsx                # Redirects → /dashboard
│   ├── components/
│   │   ├── layout/                 # Sidebar, Navbar
│   │   ├── providers/              # ThemeProvider
│   │   └── ui/                     # shadcn/ui primitives
│   ├── lib/
│   │   ├── actions/auth.ts         # Server Actions: register, login
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── utils.ts                # cn() class helper
│   ├── prisma/
│   │   └── schema.prisma           # User, Project, Task models
│   ├── types/
│   │   └── next-auth.d.ts          # Session type augmentation
│   ├── auth.config.ts              # Edge-safe NextAuth config (middleware)
│   ├── auth.ts                     # Full NextAuth config (Prisma + bcrypt)
│   └── middleware.ts               # Route protection
└── README.md
```

---

## Rules of Engagement

> Architectural conventions that **must** be followed by all contributors.

1. **Always use Server Actions for DB calls** — never call Prisma from a client component or an API route (except NextAuth). Server Actions live in `lib/actions/`.

2. **Never import `auth.ts` into middleware** — middleware runs on the Edge and must only use `auth.config.ts` (no Prisma, no bcrypt). The split is intentional.

3. **`cn()` for all class names** — never use raw template literals for Tailwind classes. Always use `cn()` from `@/lib/utils` to prevent conflicts.

4. **Rem units everywhere** — all spacing and font sizes must use `rem` (not `px`) to respect browser zoom / accessibility settings.

5. **`aria-*` on every interactive element** — all buttons, links, and inputs must have `aria-label` or visible labels. Use `aria-live` for dynamic error/success messages.

6. **No inline styles** — use Tailwind utilities or CSS variables only.

7. **`useReducedMotion` gate** — any Framer Motion animation must check `useReducedMotion()` and disable/minimize if `true`.

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 20
- MySQL server running locally

### 2. Install dependencies

```bash
cd my-app
npm install
```

### 3. Configure environment

Copy `.env` and fill in the required values:

```env
DATABASE_URL="mysql://user:password@localhost:3306/taskmanager"

# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Roadmap

- [X] **Phase 1: Security & Foundation**
  - NextAuth.js v5 with Credentials + JWT
  - bcrypt password hashing (12 rounds)
  - Middleware route protection
  - Dark/Light theme with WCAG 2.1 AA contrast
  - Collapsible sidebar + accessible navbar
  - Register + Login pages with server actions

- [ ] **Phase 2: Kanban Board & Task Logic**
  - Drag-and-drop Kanban board (todo → in-progress → done)
  - Task CRUD with priority, labels, and due dates
  - Project management with member invites
  - Real-time optimistic updates

- [ ] **Phase 3: AI Copilot & Smart Deadlines**
  - AI task generation from natural language
  - Smart deadline suggestions based on workload
  - Meeting-to-task extraction
  - Progress analytics and burndown charts

---

## Git Workflow

```
main          → stable, production-ready
feature/*     → feature branches (PR into main)
fix/*         → bug fix branches
```

Commit convention: [Conventional Commits](https://www.conventionalcommits.org/)

```
feat:     new feature
fix:      bug fix
style:    UI/styling changes
refactor: code refactor, no behavior change
docs:     documentation only
chore:    tooling, deps, config
```

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
| AI           | Vercel AI SDK + OpenAI `gpt-4o-mini`                |

---

## Project Structure

```
nextjs-mysql-task-manager/
├── my-app/                         # Next.js application root
│   ├── app/
│   │   ├── (auth)/                 # Route group: auth pages (no sidebar)
│   │   │   ├── layout.tsx          # Centered auth shell
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/            # Route group: protected pages (sidebar + navbar)
│   │   │   ├── layout.tsx          # Sidebar + Navbar shell
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # /dashboard (home + Smart Insights)
│   │   │       ├── projects/       # /dashboard/projects
│   │   │       │   ├── page.tsx
│   │   │       │   ├── _components/server/
│   │   │       │   ├── _components/client/
│   │   │       │   └── [projectId]/  # /dashboard/projects/:id (Kanban)
│   │   │       │       ├── page.tsx
│   │   │       │       ├── _components/server/
│   │   │       │       └── _components/client/
│   │   │       ├── calendar/page.tsx   # /dashboard/calendar
│   │   │       ├── settings/page.tsx   # /dashboard/settings
│   │   │       └── profile/page.tsx    # /dashboard/profile
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth route handler
│   │   │   └── chat/route.ts        # AI streaming endpoint
│   │   ├── globals.css              # Tailwind v4 + theme variables
│   │   ├── layout.tsx               # Root layout (ThemeProvider)
│   │   └── page.tsx                 # Redirects → /dashboard
│   ├── components/
│   │   ├── ai/                     # ChatCopilot (client + server wrapper)
│   │   ├── layout/                 # Sidebar, Navbar
│   │   ├── providers/              # ThemeProvider
│   │   └── ui/                     # shadcn/ui primitives
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts             # Server Actions: register, login, forgot/reset password
│   │   │   ├── tasks.ts            # Server Actions: createTask, updateTaskStatus, editTask, deleteTask
│   │   │   ├── projects.ts         # Server Actions: createProject, deleteProject
│   │   │   ├── ai.ts               # Server Actions: bulkInsertAITasks
│   │   │   └── user.ts             # Server Actions: updateName, updatePassword
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── utils.ts                # cn() class helper
│   ├── prisma/
│   │   ├── schema.prisma           # User, Project, Task, PasswordResetToken models
│   │   └── migrations/
│   ├── types/
│   │   └── next-auth.d.ts          # Session type augmentation
│   ├── auth.config.ts              # Edge-safe NextAuth config (middleware)
│   ├── auth.ts                     # Full NextAuth config (Prisma + bcrypt)
│   ├── proxy.ts                    # Route protection middleware (Next.js 16)
│   └── prisma.config.ts            # Prisma CLI datasource config
└── README.md
```

---

## Rules of Engagement

> Architectural conventions that **must** be followed by all contributors.

1. **Always use Server Actions for DB calls** — never call Prisma from a client component or an API route (except NextAuth). Server Actions live in `lib/server/`.

2. **Never import `auth.ts` into middleware** — middleware runs on the Edge and must only use `auth.config.ts` (no Prisma, no bcrypt). The split is intentional.

3. **`cn()` for all class names** — never use raw template literals for Tailwind classes. Always use `cn()` from `@/lib/utils` to prevent conflicts.

4. **Rem units everywhere** — all spacing and font sizes must use `rem` (not `px`) to respect browser zoom / accessibility settings.

5. **`aria-*` on every interactive element** — all buttons, links, and inputs must have `aria-label` or visible labels. Use `aria-live` for dynamic error/success messages.

6. **No inline styles** — use Tailwind utilities or CSS variables only.

7. **`useReducedMotion` gate** — any Framer Motion animation must check `useReducedMotion()` and disable/minimize if `true`.

---

## Database Schema

```prisma
enum Priority { LOW  MEDIUM  HIGH }

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id          Int      @id @default(autoincrement())
  name        String                        // max 50 chars (Zod)
  description String?                       // max 200 chars (Zod)
  userId      Int
  user        User     @relation(...)       // onDelete: Cascade
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String                        // max 100 chars (Zod)
  description String?                       // max 500 chars (Zod)
  status      String    @default("TODO")    // "TODO" | "IN_PROGRESS" | "COMPLETED"
  priority    Priority  @default(MEDIUM)    // LOW | MEDIUM | HIGH
  dueDate     DateTime?
  projectId   Int
  project     Project   @relation(...)      // onDelete: Cascade
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  email     String
  token     String   @unique               // 32-byte random hex, expires in 1 hour
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## Server Actions

| Action | File | Description |
|---|---|---|
| `registerUser(_prev, formData)` | `lib/server/auth.ts` | Creates a new user with bcrypt-hashed password |
| `loginUser(_prev, formData)` | `lib/server/auth.ts` | Signs in via NextAuth credentials |
| `requestPasswordReset(_prev, formData)` | `lib/server/auth.ts` | Generates a 1-hour reset token; returns reset URL on-screen |
| `resetPassword(_prev, formData)` | `lib/server/auth.ts` | Verifies token, updates password, deletes token |
| `createTask(projectId, _prev, formData)` | `lib/server/tasks.ts` | Creates a task; validates ownership via `projectId → userId` |
| `updateTaskStatus(taskId, status)` | `lib/server/tasks.ts` | Updates task column; used by drag-and-drop |
| `editTask(taskId, _prev, formData)` | `lib/server/tasks.ts` | Edits title/description/priority/dueDate; re-validates ownership |
| `deleteTask(taskId)` | `lib/server/tasks.ts` | Hard-deletes a task; re-validates ownership |
| `createProject(_prev, formData)` | `lib/server/projects.ts` | Creates a project for the authenticated user |
| `deleteProject(projectId)` | `lib/server/projects.ts` | Deletes project + all tasks (cascade) |
| `bulkInsertAITasks(projectId, tasks[])` | `lib/server/ai.ts` | Validates and bulk-inserts AI-generated tasks into a project |
| `updateName(_prev, formData)` | `lib/server/user.ts` | Updates the authenticated user's display name |
| `updatePassword(_prev, formData)` | `lib/server/user.ts` | Verifies current password, sets new one |

All actions: authenticate with `auth()`, validate input with **Zod**, and call `revalidatePath()` to refresh server cache.

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

# AI Copilot — get a key at platform.openai.com
OPENAI_API_KEY="sk-..."
```

### 4. Set up the database

```bash
# Run all migrations
npx prisma migrate dev

# Regenerate Prisma client (after any schema change)
npx prisma generate

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
  - Middleware route protection (`proxy.ts`)
  - Dark/Light theme with WCAG 2.1 AA contrast
  - Collapsible sidebar + accessible navbar
  - Register + Login pages with server actions

- [X] **Phase 2: Kanban Board & Task Logic**
  - Drag-and-drop Kanban board (To Do → In Progress → Completed) via `@dnd-kit`
  - Keyboard-accessible drag & drop (Space/Arrows to move tasks)
  - Optimistic updates with `useOptimistic` — instant UI response
  - Task CRUD: create, edit, delete with priority (Low/Medium/High) badges + due dates
  - Project management: create/delete projects with task counts
  - Zod validation on all Server Actions
  - Server/Client component split per route (`_components/server/` + `_components/client/`)
  - Skeleton loaders via `<Suspense>` boundaries
  - shadcn/ui Dialog, Select, Textarea added

- [X] **Phase 3: AI Copilot & Smart Insights**
  - Floating AI chat bubble (WCAG 2.1 AA accessible) powered by OpenAI `gpt-4o-mini` via Vercel AI SDK
  - Streaming responses via `/api/chat` — session-authenticated, injects full task context
  - Natural-language task generation (e.g., "plan my house move") with one-click bulk insert into any project
  - Smart Insights widget on dashboard — detects bottlenecks, stalled projects, high-priority backlog
  - `aria-live="polite"` for AI messages · focus management on panel open/close · Escape to dismiss
  - `useReducedMotion()` gate on all animations

- [X] **Phase 4: Pages & Reorganization**
  - `/dashboard/calendar` — monthly calendar view of tasks by due date, prev/next navigation
  - `/dashboard/settings` — change display name, update password, toggle theme
  - `/dashboard/profile` — account info, project + task stats, completion rate
  - `/forgot-password` + `/reset-password` — full token-based password reset flow (1-hour token, on-screen link)
  - All server actions moved to `lib/server/` (from `lib/actions/`)
  - Route structure fixed: all dashboard sub-pages now correctly under `(dashboard)/dashboard/`

- [ ] **Phase 5 (remaining)**
  - AI Copilot debugging — requires `OPENAI_API_KEY` in `.env` to activate

---

## TODO

> Things that are not yet built or need fixing.

- [ ] **AI Copilot** — code is complete; add `OPENAI_API_KEY=sk-...` to `my-app/.env` to enable

---

## Accessibility Statement

SyncroMind AI targets **WCAG 2.1 Level AA** compliance:

- All interactive elements are keyboard-navigable (Tab, Enter, Space, Escape)
- AI chat panel uses `role="dialog"` + `aria-modal="true"`; focus moves into the input on open; Escape returns focus to the trigger
- AI messages are announced by screen readers via `aria-live="polite"` on the message log
- Task insertion confirmations use a dedicated `aria-live="polite"` region
- All decorative icons use `aria-hidden="true"`; controls have explicit `aria-label`
- Framer Motion animations respect `prefers-reduced-motion` via `useReducedMotion()`
- `rem` units throughout for user font-size scaling
- Color contrast meets AA ratios in both light and dark themes

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

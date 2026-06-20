# WebQA — Local Agent Guide

Project: **WebQA** — AI-assisted web testing platform (Next.js + Prisma + SQLite + Playwright + Lighthouse + opencode.ai).

## Workspace Layout

```
/tester-automation
  /web                 ← actual Next.js app (always work from here for npm commands)
    /app               ← Next.js App Router
      /admin           ← Admin dashboard (CRUD semua konten)
      /api             ← API routes
        /admin         ← Admin-only CRUD endpoints
        /auth          ← login/register/logout
        /user/me       ← current user
        /company-profile, /about, /security, /settings/public
        /test-runs, /test-runs/[id]/run
        /load-tests
      /dashboard       ← user dashboard
      /report/[id]     ← hasil test + ringkasan AI
      /run/[id]        ← halaman eksekusi test
      /login, /register
    /components        ← React components
    /components/ui     ← shadcn/ui style components
    /lib
      prisma.ts        ← singleton PrismaClient
      auth.ts          ← bcrypt + re-export dari jwt.ts
      jwt.ts           ← JWT sign/verify + COOKIE_NAME
      runner.ts        ← Playwright + Lighthouse + HTTP fallback + AI analysis
      ai.ts            ← opencode.ai/OpenAI-compatible chat completions
      icons.ts         ← dynamic lucide icon helper
    /prisma
      schema.prisma    ← single source of truth schema
      seed.ts          ← seed data
    .env               ← DATABASE_URL, JWT_SECRET, OPENCODE_API_KEY
    .env.example
    next.config.ts
    package.json
  README.md
  AGENT.md             ← this file
```

## Rules

1. **Always run npm / npx commands from `/web`**.
   ```bash
   cd tester-automation/web
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   npm run build
   npm start
   ```

2. **Schema is the source of truth**. Before adding/changing API or UI fields, read `prisma/schema.prisma` first. Every change that touches the database needs a Prisma migration.

3. **Authentication**
   - JWT stored in `httpOnly` cookie named `webqa_session`.
   - `middleware.ts` protects `/admin`, `/dashboard`, `/run`, and admin APIs.
   - Public routes/pages: `/`, `/tentang`, `/keamanan`, `/login`, `/register`.
   - Public APIs are listed in `PUBLIC_API_PREFIXES` inside `middleware.ts`. If a public API returns 401, it is probably missing from that list.

4. **Admin access**
   - Default admin: `admin@webqa.local` / `admin123`.
   - Admin page: `/admin`.
   - Admin APIs: `/api/admin/*` and `/api/users`, `/api/settings`, `/api/webhooks`.

5. **Testing runner flow**
   - Home page POST `/api/test-runs` → navigates to `/run/[id]`.
   - `/run/[id]` calls `/api/test-runs/[id]/run` to execute `lib/runner.ts`.
   - `runner.ts` tries Playwright + Lighthouse first; if the browser cannot launch (e.g. missing system libs), it falls back to HTTP/cheerio checks.
   - After runner finishes, `lib/ai.ts` sends the findings to opencode.ai and stores the AI summary in `TestRun.aiSummary` / `TestRun.aiFixPlan`.

6. **Environment variables required**
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="change-in-production"
   OPENCODE_API_KEY="..."
   OPENCODE_BASE_URL="https://api.opencode.ai/v1"
   OPENCODE_MODEL="kimi-k2.6"
   ```

7. **UI/UX conventions**
   - Use Bahasa Indonesia for user-facing labels, buttons, headings, and error messages.
   - Use Tailwind CSS + shadcn/ui style components.
   - Primary color from theme config; do not hardcode brand colors in new components.

8. **Before finishing any task**
   - Run `npm run build` and ensure it passes.
   - Run `npx prisma generate` if schema changed.
   - Commit and push to `origin/main`.

## Common Gotchas

- `/api/user/me` returns `null` for anonymous users (HTTP 200), not 401.
- `/api/settings/public` must stay public because the theme provider uses it on every page.
- If login fails with correct credentials, check that `prisma/seed.ts` ran and the user has a hashed `password`.
- If a page says it cannot load on first visit, it is often because a public API is missing from `PUBLIC_API_PREFIXES` and middleware redirects the fetch request.
- `.env` and `dev.db` are gitignored. New env examples should go to `.env.example`.

## Useful Commands

```bash
# Dev mode
cd web && npm run dev

# Production build + start
cd web && npm run build && npm start

# Reset DB and seed
cd web && npx prisma migrate reset --force && npm run db:seed

# Install Playwright browser (only needed for real browser tests)
npx playwright install chromium
```

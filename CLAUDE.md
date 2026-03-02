## Project Overview

AI Formawork is a B2B SaaS platform for managing customers, customer notes, and staff. It is built for internal operators who need a unified workspace for daily CRM tasks.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.0.1 (App Router) |
| UI | React 19.2.0, shadcn/ui, Tailwind CSS 4.x |
| Language | TypeScript 5.9.3 |
| Package Manager | pnpm 10.12.4 (catalog mode) |
| Database | PostgreSQL via Supabase, Drizzle ORM |
| Forms | react-hook-form + valibot |
| Logging | pino (`@repo/logger`) |
| Testing | Vitest (Browser Mode) + Playwright (E2E) |
| Lint/Format | Biome |

## Project Structure

```
apps/web/
  app/
    (private)/    # authenticated routes
    (public)/     # public routes
  features/       # feature modules (auth, customer, customer-note, staff)
  components/     # shared components
  libs/           # utilities
packages/
  db/             # Drizzle schema and client
  ui/             # shadcn/ui components
  logger/         # pino-based logger
  supabase/       # Supabase config
  tsconfig/       # shared TypeScript config
```

## Development Commands

```bash
pnpm -w dev            # Start Supabase + Next.js dev server (UTC timezone)
pnpm -w build          # Production build
pnpm -w validate:check # Lint, format, dead code, spell, type checks
pnpm -w validate:fix   # Auto-fix lint and format issues
pnpm -w db:generate    # Generate migration files (no DB apply)
pnpm -w db:migrate     # Apply migrations
pnpm -w db:reset       # Reset DB and re-apply migrations + seed
pnpm -w test:browser   # Vitest Browser Mode tests
pnpm -w test:server    # Server-side tests
pnpm -w test:e2e       # Playwright E2E tests
```

## Coding Conventions

Details: `.claude/rules/coding-conventions.md` (auto-loaded for `**/*.ts`, `**/*.tsx`)

Key rules:
- Prefer `type` over `interface`; prefer `function` over arrow functions
- No `enum`; use Object Literals instead
- Access env vars only via valibot-parsed config modules
- Minimize comments; minimize single-use intermediate variables/types
- File names: kebab-case; components: PascalCase; functions/vars: camelCase

## Workflow Rules

- **Before starting any task**: call `mcp__serena__list_memories` to check available memory files
- **When implementing**: read relevant `agent-docs/` files (see Additional Docs table below)
- **File read/edit/search**: always prefer Serena MCP tools for context efficiency
- **GitHub operations**: use `gh` CLI commands
- **Agent invocation details**: see `agent-docs/agent-workflow.md`

### Agent Execution Order (MUST follow)
1. Edit/create/delete files → run `code-validator` first
2. Confirm all validations pass
3. Then run `changes-committer`

**Never run `code-validator` and `changes-committer` in parallel.**

## Additional Docs

Read the relevant `agent-docs/` file before implementing each task type:

| Task Type | Read This |
|-----------|-----------|
| Any task start / completion | `agent-docs/agent-workflow.md`, `agent-docs/task-completion.md` |
| Next.js components, Server Actions, Route Handlers | `agent-docs/nextjs-architecture.md` |
| `page.tsx` or `layout.tsx` | `agent-docs/nextjs-page-layout.md` |
| Caching with `use cache` | `agent-docs/nextjs-cache-strategy.md` |
| Any UI component or user-facing feature | `agent-docs/ux-guidelines.md` |
| Forms | `agent-docs/form-implementation.md` |
| Tests | `agent-docs/test-guidelines.md` |
| GitHub Actions workflows | `agent-docs/github-actions.md` |
| Database schema / migrations | `agent-docs/database-migration.md` |
| Logging | `agent-docs/logging-implementation.md` |
| Monorepo package structure | `agent-docs/monorepo-guidelines.md` |
| Memory system management | `agent-docs/claude-code-memory-management.md` |

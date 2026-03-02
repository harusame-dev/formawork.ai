# Claude Code Memory Management

This document describes the three-layer memory architecture used to provide the AI with the right information at the right time.

## Three-Layer Architecture

```
Layer 1: CLAUDE.md (always loaded)
  - Universal project context: tech stack, structure, commands, workflow rules
  - Loaded into every conversation automatically
  - Keep this concise (under 200 lines)

Layer 2: .claude/rules/ (conditionally loaded)
  - Applied automatically when file globs match
  - Use for coding conventions tied to specific file types
  - Defined via YAML front matter: globs: ["**/*.ts", "**/*.tsx"]

Layer 3: agent-docs/ (on-demand, referenced by LLM)
  - Task-specific documentation loaded only when relevant
  - Referenced from CLAUDE.md's Additional Docs table
  - LLM reads these when the task type matches
```

## Decision Guide: Where to Put New Information

```
Is it needed in every conversation, regardless of task?
  YES → CLAUDE.md (keep it short; if > 5 lines, summarize and link to agent-docs/)
  NO  ↓

Is it a coding convention for specific file types (.ts, .tsx)?
  YES → .claude/rules/ with appropriate globs
  NO  ↓

Is it task-specific guidance (architecture, testing, deployment, etc.)?
  YES → agent-docs/<topic>.md
  NO  → Consider if documentation is needed at all
```

## .claude/rules/ Reference

Files in `.claude/rules/` are automatically injected when the user's current file matches the glob pattern defined in the YAML front matter.

```yaml
---
globs: ["**/*.ts", "**/*.tsx"]
---
```

Current rules files:
- `coding-conventions.md` — TypeScript/TSX coding style, naming conventions, API design principles

## agent-docs/ Reference Guide

| File | When to Read |
|------|-------------|
| `agent-workflow.md` | Before starting any task; agent invocation order and review process |
| `task-completion.md` | Before marking a task complete; validation checklist |
| `nextjs-architecture.md` | When implementing Next.js components, Server Actions, Route Handlers |
| `nextjs-page-layout.md` | When implementing page.tsx or layout.tsx files |
| `nextjs-cache-strategy.md` | When implementing caching with `use cache` directives |
| `ux-guidelines.md` | When implementing any UI component or user-facing feature |
| `form-implementation.md` | When implementing forms |
| `test-guidelines.md` | When writing tests |
| `github-actions.md` | When creating or modifying GitHub Actions workflows |
| `database-migration.md` | When modifying database schema or running migrations |
| `logging-implementation.md` | When implementing logging |
| `monorepo-guidelines.md` | When adding packages or modifying monorepo structure |
| `claude-code-memory-management.md` | When managing or updating this documentation system |

## Rules for Adding New Documentation

1. **Prefer editing existing files** over creating new ones
2. **CLAUDE.md** should only contain pointers and summaries; detailed rules belong in `agent-docs/`
3. **File names** in `agent-docs/` must use English kebab-case (e.g., `form-implementation.md`)
4. **Update the table** in `CLAUDE.md`'s Additional Docs section and this file's reference guide when adding new `agent-docs/` files
5. **Do not duplicate** content between layers; each piece of information should live in exactly one place
6. **`.serena/memories/`** files are maintained separately for Serena MCP tool compatibility; do not delete them without a separate task

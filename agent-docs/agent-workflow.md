# Agent Workflow

## Agent Invocation Order (MUST follow this order)

1. After editing/creating/deleting files → run `code-validator` first
2. Confirm all validations pass
3. Then run `changes-committer`

**IMPORTANT: Never run `code-validator` and `changes-committer` in parallel.**

## Available Agents

| Agent | When to Use |
|-------|-------------|
| `code-validator` | **Automatically after any file create/edit/delete** (no need to wait for user instruction). Also use when user requests a code check. |
| `changes-committer` | After `code-validator` passes with no errors. Commits in logical work units. Also use when user explicitly requests a commit. |
| `pr-creator` | When creating or updating a PR. Always use this agent, never create PRs manually. |
| `library-reference-searcher` | When generating code that uses external library APIs. **No exceptions**: even if you know the API or see existing usage, always verify with this agent. One agent per library; launch in parallel for multiple libraries. |
| `branch-code-reviewer` | When user requests a review, or after significant code changes. Takes priority over the `reviewing-code` skill. |

## library-reference-searcher Trigger Conditions

Autonomously invoke this agent (without explicit user instruction) when:
- Creating or editing files that use external library APIs
- An implementation plan includes external library usage

**No exceptions**: Do not rely on prior knowledge or existing code examples in the codebase.

## Review Workflow

- Prefer `branch-code-reviewer` agent over the `reviewing-code` skill
- Invoke autonomously when:
  - User explicitly requests a review
  - Significant code changes have been made
- Output format: summary first, then the full agent report as-is

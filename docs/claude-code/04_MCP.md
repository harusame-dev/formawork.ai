# CLAUDE.md 設定方針

## 参考

https://code.claude.com/docs/ja/mcp
https://platform.claude.com/docs/ja/agents-and-tools/tool-use/tool-search-tool （API 向けなので CLAUDE CODE と差異がある可能性あり）

## 基本方針

### 信頼性が高い MCP のみ使用

公式が出している、もしくは検証済みの MCP のみ使用する

### CLI ツールがある場合は CLI ツール（＋skills）を優先

- モデルが十分に学習済みの CLI ツールは説明なしに使用できるためコンテキストの節約になる
- モデルが十分に学習していない場合は mcp or cli + skills を検討

### 最初からロードする必要がない MCP は defer loading を採用する

MCP 設定で DEFER LOADING を有効にする
ただし、精度とコンテキスト消費のトレードオフを検証すること

## MCP サーバー

### ブラウザ情報取得・操作

playwright-cli を使用するため不要

#### 参考

- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)

### オブザーバビリティー

Sentry Skills & Sentry CLI を使うので不要

#### 参考

- [Sentry MCP](https://docs.sentry.io/ai/mcp/)

### 開発サーバー

- [nextjs dev tools mcp](https://github.com/vercel/next-devtools-mcp)

### DB

Supabase CLI or pg を使うので不要

#### 参考

- [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)

### アプリケーションサーバー

vercel cli を使用するので不要

#### 参考

- vercel mcp（ユーザー設定）

- [Vercel MCP](https://vercel.com/docs/agent-resources/vercel-mcp)

### チケット

GitHub CLI を使うので不要（GitHub Issue 使用前提）

#### 参考

- [GitHub MCP](https://github.com/github/github-mcp-server)

### SVC

GitHub CLI を使うので不要（GitHub Issue 使用前提）

#### 参考

- [GitHub MCP](https://github.com/github/github-mcp-server)

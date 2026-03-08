---
paths: 
  - **/*.browser.test.tsx
---

# Browser Test

- Vitest の Browser Mode でテストを作成する

## 原則

### `screen` の代わりに `page` を常に使用すること。

- クエリ: `page.getByRole()`, `page.getByLabelText()` など
- アサーション: `await expect.element(page.getByRole(...)).toBeInTheDocument()` を使用

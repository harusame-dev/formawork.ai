---
paths:
  - "**/*.browser.test.tsx"
---

# Test： Vitest ブラウザーモード

## `screen` の代わりに `page` を常に使用すること。

- クエリ: `page.getByRole()`, `page.getByLabelText()` など
- アサーション: `await expect.element(page.getByRole(...)).toBeInTheDocument()` など

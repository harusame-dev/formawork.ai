---
paths:
  - "**/*.browser.test.tsx"
  - "**/*.e2e.test.ts"
---

# テスト： UI のクエリ

1. **アクセシブルクエリ（最優先）**
   - すべてのユーザー（視覚/マウス利用者、支援技術利用者）の体験を反映
   - 例: `getByRole()`, `getByLabelText()`, `getByPlaceholderText()`, `getByText()`

2. **セマンティッククエリ**
   - HTML5 と ARIA に準拠したセレクター（ブラウザや支援技術で体験が異なる場合がある）
   - 例: `getByAltText()`, `getByTitle()`

3. **テスト ID（最終手段）**
   - 他の方法で特定できない場合のみ使用
   - 例: `getByTestId()`

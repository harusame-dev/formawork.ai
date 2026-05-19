# T0002: E2E テストの Flaky 問題

## 概要

E2E テストで複数のテストが不安定（flaky）な挙動を示している。実行ごとに異なるテストが失敗し、再現性が低い。

## テスト実行結果サマリ（7回実行）

### 失敗頻度による分類

| 分類         | ファイル                            | テスト名                                                | 行番号 | 失敗回数 |
| ------------ | ----------------------------------- | ------------------------------------------------------- | ------ | -------- |
| **毎回失敗** | `e2e/customer-notes.e2e.test.ts`    | 正常系: 4096文字（最大境界値）のノート登録成功          | 82     | 7/7      |
| **毎回失敗** | `e2e/staffs.e2e.test.ts`            | スタッフ一覧が表示される                                | 35     | 7/7      |
| **Flaky**    | `e2e/customer-memories.e2e.test.ts` | 保護ボタンでメモリを保護・解除できる                    | 129    | 2/7      |
| **Flaky**    | `e2e/customer-register.e2e.test.ts` | 管理者が全フィールドを境界値一杯で入力して顧客を登録... | 16     | 1/7      |
| **Flaky**    | `e2e/customer-register.e2e.test.ts` | 管理者が必須フィールドのみ入力して登録でき...           | 77     | 1/7      |

### 各回の失敗テスト

| 実行  | 失敗数 | 失敗したテスト                                      |
| ----- | ------ | --------------------------------------------------- |
| 1回目 | 3      | customer-register:16, customer-notes:82, staffs:35  |
| 2回目 | 3      | customer-memories:129, customer-notes:82, staffs:35 |
| 3回目 | 2      | customer-notes:82, staffs:35                        |
| 4回目 | 2      | customer-notes:82, staffs:35                        |
| 5回目 | 3      | customer-notes:82, customer-memories:129, staffs:35 |
| 6回目 | 3      | customer-register:77, customer-notes:82, staffs:35  |
| 7回目 | 2      | customer-notes:82, staffs:35                        |

---

## 詳細分析

### 1. customer-notes.e2e.test.ts:82 【毎回失敗】

**エラーメッセージ:**

```
Error: expect(locator).toBeVisible() failed
Locator: getByText('ああああああああ...(4096文字)')
Expected: visible
```

**原因:**
4096文字の長いテキストを `getByText()` で完全一致検索しているが、UIでは省略表示されている可能性がある。また、長いテキストのDOM検索は不安定になりやすい。

**該当コード (e2e/customer-notes.e2e.test.ts:112):**

```typescript
await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
```

**修正案:**

```typescript
// 方法1: 部分一致で検索
await expect(
  customerNotesPage.getByText(noteContent.slice(0, 100)),
).toBeVisible();

// 方法2: ロケータを具体化
const noteCard = customerNotesPage.getByRole("listitem").filter({
  has: customerNotesPage.getByText(noteContent.slice(0, 100)),
});
await expect(noteCard).toBeVisible();
```

---

### 2. staffs.e2e.test.ts:35 【毎回失敗】

**エラーメッセージ:**

```
Error: expect(locator).toBeVisible() failed
Locator: locator('table tbody tr').filter({ hasText: '田中' }).filter({ hasText: '太郎' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

**原因:**
シードデータに「田中太郎」スタッフが存在するが、テーブルの読み込み完了前にアサーションが実行されている可能性がある。または、並列実行で他のテストがデータを変更している。

**シードデータ (packages/db/src/fixtures/staffs.ts:3-6):**

```typescript
{
  authUserId: "a0000000-0000-0000-0000-000000000001",
  firstName: "太郎",
  lastName: "田中",
  staffId: "00000000-0000-0000-0000-000000000001",
}
```

**該当コード (e2e/staffs.e2e.test.ts:42-47):**

```typescript
const targetRow = staffsPage
  .locator("table tbody tr")
  .filter({ hasText: "田中" })
  .filter({ hasText: "太郎" });
await expect(targetRow).toBeVisible();
```

**fixture での待機処理 (e2e/staffs.e2e.test.ts:10):**

```typescript
await expect(page.getByRole("main").getByText("読み込み中")).toBeHidden();
```

**修正案:**

```typescript
// 方法1: テーブル行の存在を明示的に待機
await staffsPage.locator("table tbody tr").first().waitFor();
const targetRow = staffsPage
  .locator("table tbody tr")
  .filter({ hasText: "田中" })
  .filter({ hasText: "太郎" });
await expect(targetRow).toBeVisible({ timeout: 10000 });

// 方法2: テスト用データを fixture で作成（シードデータに依存しない）
const test = testWithAuthenticated.extend<{
  testStaff: { staffId: string; firstName: string; lastName: string };
}>({
  testStaff: async ({}, use) => {
    const testStaff = await createTestStaff();
    await use(testStaff);
    await deleteTestStaff(testStaff.staffId);
  },
});
```

---

### 3. customer-memories.e2e.test.ts:129 【Flaky - 2/7】

**エラー内容（推定）:**
保護ボタンクリック後の状態更新が完了する前にアサーションが実行されている。

**該当コード (e2e/customer-memories.e2e.test.ts:137-145):**

```typescript
const lockButton = row1.getByRole("button", { name: "保護" });
await expect(lockButton).toBeVisible();
await lockButton.click();
// 保護状態になったことを確認（ボタンのラベルが「保護解除」に変わる）
const unlockButton = row1.getByRole("button", { name: "保護解除" });
await expect(unlockButton).toBeVisible();
```

**修正案:**

```typescript
// クリック後に元のボタンが消えることを明示的に待機
await lockButton.click();
await expect(lockButton).toBeHidden();
const unlockButton = row1.getByRole("button", { name: "保護解除" });
await expect(unlockButton).toBeVisible();
```

---

### 4. customer-register.e2e.test.ts:16 【Flaky - 1/7】

**エラーメッセージ:**

```
Error: strict mode violation: getByText('5c7c0ded-6b0 1572a004-972') resolved to 2 elements:
    1) <h1 class="text-2xl font-bold h-8">...</h1>
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__">...</div>
```

**原因:**
Next.js の `__next-route-announcer__` がスクリーンリーダー向けにページタイトルを読み上げるため、顧客名が h1 タグと route-announcer の両方に表示される。`getByText()` が複数要素にマッチして strict mode violation が発生。

**該当コード (e2e/customer-register.e2e.test.ts:44-46):**

```typescript
await expect(
  page.getByText(`${testData.lastName} ${testData.firstName}`),
).toBeVisible();
```

**表示コンポーネント (features/customer/detail/customer-info-presenter.tsx:10-12):**

```typescript
<h1 className="text-2xl font-bold h-8">
  {lastName} {firstName}
</h1>
```

**修正案:**

```typescript
// getByRole('heading') を使用して h1 要素のみを対象にする
await expect(
  page.getByRole("heading", {
    name: `${testData.lastName} ${testData.firstName}`,
  }),
).toBeVisible();
```

---

### 5. customer-register.e2e.test.ts:77 【Flaky - 1/7】

**エラーメッセージ:**

```
Error: expect(locator).toBeVisible() failed
```

**原因:**
`customer-register.e2e.test.ts:16` と同様の問題。顧客名の表示確認で `getByText()` を使用しているため、`__next-route-announcer__` との重複が発生する可能性がある。

**該当コード (e2e/customer-register.e2e.test.ts:101-103):**

```typescript
await expect(
  page.getByText(`${testData.lastName} ${testData.firstName}`),
).toBeVisible();
```

**修正案:**

```typescript
// getByRole('heading') を使用して h1 要素のみを対象にする
await expect(
  page.getByRole("heading", {
    name: `${testData.lastName} ${testData.firstName}`,
  }),
).toBeVisible();
```

---

## 共通の問題点

1. **ロケータの特定性不足**: `getByText()` は複数要素にマッチしやすく、strict mode violation の原因になる
2. **待機処理の不足**: 非同期操作後のUI更新を待たずにアサーションを実行している
3. **シードデータ依存**: テストがシードデータに依存しており、並列実行時に競合が発生しやすい
4. **タイムアウトの短さ**: デフォルトの5秒タイムアウトでは、遅いCI環境で失敗しやすい
5. **長文テキスト検索**: 4096文字など長いテキストの完全一致検索は不安定

## 推奨される対応

### 優先度: 最高（毎回失敗）

1. **customer-notes.e2e.test.ts:82** - 部分一致検索への変更
2. **staffs.e2e.test.ts:35** - 待機処理の追加またはテスト用fixture作成

### 優先度: 高（Flaky）

3. **customer-register.e2e.test.ts:16, 77** - `getByRole('heading')` への変更
4. **customer-memories.e2e.test.ts:129** - 明示的な待機処理の追加

### 全体的な改善

- Playwright の `test.setTimeout()` でテストごとのタイムアウトを調整
- `toBeVisible({ timeout: 10000 })` で個別のアサーションタイムアウトを延長
- シードデータに依存するテストは fixture でテストデータを作成・クリーンアップする
- `getByText()` の代わりに `getByRole()` を優先使用する

## 関連ファイル

- `apps/web/e2e/customer-register.e2e.test.ts`
- `apps/web/e2e/customer-notes.e2e.test.ts`
- `apps/web/e2e/staffs.e2e.test.ts`
- `apps/web/e2e/customer-memories.e2e.test.ts`
- `apps/web/features/customer/detail/customer-info-presenter.tsx`
- `packages/db/src/fixtures/staffs.ts`

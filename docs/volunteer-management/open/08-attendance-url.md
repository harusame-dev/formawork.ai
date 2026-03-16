# チケット 08: 来場ページURL管理（生成・再生成）

## 概要

イベント固有の来場ページURLを生成・管理する機能を実装する。
URLの再生成（旧URL無効化）もサポートする。

## 背景

来場画面は管理画面のセッションに依存しない独立したURLとして提供する。
据え置き端末での運用を想定しているため、管理者がログアウトしていても動作する必要がある。
URLが外部に漏洩した場合に備え、再生成により旧URLを無効化できる。

## 実装対象

### 画面

| URL | 内容 |
|---|---|
| `/events/[eventId]/attendance-url` | 来場ページURL管理 |

### 表示内容

#### URLが未生成の場合

- 「URLが生成されていません」と表示
- 「URLを生成する」ボタン

#### URLが生成済みの場合

- 来場ページの完全URL（例：`https://example.com/attendance/abc123def456`）
- URLのコピーボタン
- QRコード表示（来場端末での利用を想定）
- 「URLを再生成する」ボタン（確認ダイアログあり）
  - 再生成すると旧URLは即座に無効化される

### トークン仕様

- `crypto.randomUUID()` またはランダムな文字列（英数字 32 文字程度）
- `event_attendance_urls` テーブルに保存
- イベントにつき1件のみ（再生成時は UPDATE で token を差し替え）

## features モジュール構成

```
apps/web/features/attendance-url/
  components/
    attendance-url-manager.tsx    # URL管理コンポーネント
    attendance-url-display.tsx    # URL表示・コピー・QRコード
  actions/
    generate-attendance-url.ts    # URL生成・再生成
  queries/
    get-attendance-url.ts
```

## 実装手順

1. `features/attendance-url/` モジュールを作成
2. `get-attendance-url.ts` を実装
3. `generate-attendance-url.ts` サーバーアクションを実装
   - 既存レコードがない場合: INSERT
   - 既存レコードがある場合: token を UPDATE（再生成）
4. `attendance-url-display.tsx` を実装
   - URLコピーボタン（`navigator.clipboard.writeText`）
   - QRコード表示（`qrcode.react` 等のライブラリを使用）
5. `attendance-url-manager.tsx` を実装（生成済み/未生成の出し分け）
6. `/events/[eventId]/attendance-url` ページを実装
7. `pnpm -w validate:check` でエラーがないことを確認
8. `pnpm -w build` が通ることを確認
9. ブラウザで動作確認
   - URL生成が機能する
   - URL再生成が機能する（確認ダイアログあり）
   - URLコピーが機能する

## 完了条件

- [ ] URLが未生成の場合に「URLを生成する」ボタンが表示される
- [ ] URL生成後に来場ページのURLが表示される
- [ ] URLコピーボタンが機能する
- [ ] QRコードが表示される
- [ ] URL再生成が確認ダイアログ付きで機能する
- [ ] 再生成後は旧URLでアクセスできなくなる（チケット 09 実装後に確認）
- [ ] `pnpm -w validate:check` が通る
- [ ] `pnpm -w build` が通る
- [ ] ブラウザでの動作確認が完了している（スクリーンショットで画面崩れがないこと）
- [ ] ブラウザコンソール・開発サーバーにエラーログがないこと

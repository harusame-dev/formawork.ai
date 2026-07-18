---
paths:
  - "**/route.ts"
---

# Next.js Route Handler

## 用途

- Client Component で利用するデータ取得
- cron 用の API、Webhook 用の API など外部から利用する API

## 認証・認可・バリデーション

- 引数のバリデーション、適切な認証、認可を必ず実施すること
  - Webhook は署名検証、cron はシークレット検証など、呼び出し元に応じた認証方式を用いる

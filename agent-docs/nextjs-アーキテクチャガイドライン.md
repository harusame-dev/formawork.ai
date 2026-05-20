# Next.js アーキテクチャガイドライン

## Server Component First

- Server Component での実装を最優先とし、ユーザーのインタラクションが必要な場合にのみクライアントコンポーネントを採用すること
- データの取得は末端で行い、上位からバケツリレーで下位に渡すことを避けること

## Server Action

- データのミューテーションには Server Action を使用すること
- Server Action ではカバーできないことや、クライアントからのデータフェッチ用 API には Route Handler を使用すること
- Server Component で利用するデータ取得には使用しないこと

## Route Handler

- データフェッチなどのミューテーションを伴わないサーバー操作に使用すること
- cron 用の API など外部から利用されることを想定した API に使用すること

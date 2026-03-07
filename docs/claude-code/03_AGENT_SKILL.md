# AGENT SKILLS

## 参考

https://code.claude.com/docs/ja/features-overview#skills
https://code.claude.com/docs/ja/skills

## 基本方針

### 信頼性のスキルのみ使用

公式が出している、もしくは検証済みの SKILL のみ使用する

### 十分に学習されていない CLI ツールなどを使用する際に使用する

カットオフ後にでたツールや破壊的変更があって十分に使用されない場合に skills を使用する

### リファレンス型スキルはさけ agent-docs を優先する

現状は読み込み精度に問題があるため agent-docs 配下に配置する

### 設計指針などの特定の状況で必要なリファレンスは agent_docs 配下に保存する

## SKILLS

### PR 作成作成

チケットの内容と変更内容をもとに PR を作成するスキル

### 実装計画スキル

自動でプランモードに移行し、チケットの内容、ユーザーからの追加情報（.claude/work/）をもとに実装計画を策定するスキル
.claude/work は .gitignore に追加してコミットされないようにする

### Sentry CLI Skills

sentry cli が新しいツールで学習が十分でないため導入

```bash
npx skills add https://cli.sentry.dev
```

### Playwright CLI Skills

playwright cli が新しいツールで学習が十分でないため導入

```bash
npx skills add https://github.com/microsoft/playwright-cli
```

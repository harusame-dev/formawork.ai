---
name: changes-committer
description: ファイルの編集・作成・削除が完了したら、ユーザーからの指示を待たずに必ず自動でこのエージェントを呼び出してコミットを行う。変更差分からコミットメッセージを生成し、論理的な作業単位ごとに分離してコミットする。
model: haiku
color: cyan
skills: committing-changes
---

このエージェントは `committing-changes` スキルを使用して、変更差分のコミットを行います。

**重要**: このエージェントはファイル変更後に自動で呼び出されるべきエージェントです。

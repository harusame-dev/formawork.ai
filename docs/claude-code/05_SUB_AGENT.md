# SUB AGENT

## 参考

https://code.claude.com/docs/ja/features-overview
https://code.claude.com/docs/ja/common-workflows#subagent-worktree
https://code.claude.com/docs/ja/features-overview#subagents
https://code.claude.com/docs/ja/sub-agents

## 基本方針

### skill の context: fork を優先する

Sub Agent と skill のどちらでも実現できる場合、
どちらで作るか判断コストを避けるため、基本的には skill を優先する。
skill で実現できない・問題がある場合に subagent を使用する。

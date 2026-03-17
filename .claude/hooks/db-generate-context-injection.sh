#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'db:generate'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: "agent-docs/DBマイグレーション.md を読み込んでいなければ読み込んでください"
    }
  }'
else
  exit 0
fi

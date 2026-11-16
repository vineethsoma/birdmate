#!/usr/bin/env bash
# PostToolUse: after each edit to source files, run the cheap verifiers (types + contract)
# and report violations back to Claude (exit 2 = show stderr to Claude; the edit already
# happened, this is feedback only).
set -u
input="$(cat)"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
path="$(jq -r '.tool_input.file_path // empty' <<<"$input")"
[ -z "$path" ] && exit 0
case "$path" in
  "$root"/backend/src/*|"$root"/backend/verify/*|"$root"/frontend/src/*|"$root"/shared/*|"$root"/formal/*) ;;
  *) exit 0 ;;
esac
case "$path" in *.ts|*.tsx|*.json) ;; *) exit 0 ;; esac
[ -d "$root/backend/node_modules" ] || { echo "verify-fast skipped: run 'npm ci' in backend/" >&2; exit 0; }

cd "$root/backend" || exit 0
if ! out="$(npm run --silent verify:fast 2>&1)"; then
  printf '%s\n' "$out" | tail -60 >&2
  exit 2
fi
exit 0

#!/usr/bin/env bash
# Stop: Claude may not finish while `npm run verify:all` fails. On failure exit 2 with the
# counterexample on stderr so Claude keeps fixing. A retry cap (BIRDMATE_VERIFY_MAX_RETRIES,
# default 3) prevents infinite loops; after that the turn may end and CI is the backstop.
set -u
input="$(cat)"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

# Only gate turns that changed verifiable code.
if [ -z "$(git status --porcelain -- backend frontend shared formal database 2>/dev/null)" ]; then
  exit 0
fi
if [ ! -d backend/node_modules ]; then
  echo "verify-all skipped: backend dependencies not installed (run 'npm ci' in backend/); CI will verify." >&2
  exit 0
fi

session="$(jq -r '.session_id // "local"' <<<"$input" | tr -c 'A-Za-z0-9_-' '_')"
counter="${TMPDIR:-/tmp}/birdmate-verify-${session}.count"
max="${BIRDMATE_VERIFY_MAX_RETRIES:-3}"
runs="${BIRDMATE_VERIFY_RUNS:-100}"

cd backend || exit 0
if out="$(npm run --silent verify:all -- --runs "$runs" 2>&1)"; then
  rm -f "$counter"
  exit 0
fi

n=$(( $(cat "$counter" 2>/dev/null || echo 0) + 1 ))
echo "$n" > "$counter"
printf '%s\n' "$out" | tail -80 >&2
if [ "$n" -gt "$max" ]; then
  echo "verify:all still failing after $max retries; allowing stop. Report the failure to the user (CI will block merge)." >&2
  rm -f "$counter"
  exit 0
fi
echo "verify:all failed (attempt $n of $max). Fix the implementation; do not edit formal/." >&2
exit 2

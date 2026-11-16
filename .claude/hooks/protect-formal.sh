#!/usr/bin/env bash
# PreToolUse: the formal spec (formal/) and the verification machinery
# (.claude/hooks, .claude/settings*.json) are human-owned. Agents may not edit them,
# so a failing check can never be "fixed" by weakening the spec or the gate.
# Exit 2 = block the tool call and feed stderr back to Claude.
set -u
input="$(cat)"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
tool="$(jq -r '.tool_name // empty' <<<"$input")"

protected_msg() {
  cat >&2 <<MSG
BLOCKED: $1 is protected (formal/ spec, .claude/hooks, .claude/settings*.json are human-owned).
Do not weaken the spec to make verification pass. Fix the implementation in backend/ or frontend/.
If you believe an invariant is wrong or missing, leave formal/ untouched and propose the change
in the PR description (@vineethsoma approves spec changes via CODEOWNERS).
MSG
  exit 2
}

is_protected() {  # $1 = path (absolute or relative to project root)
  local p
  p="$(realpath -m -- "$1" 2>/dev/null || echo "$1")"
  case "$p" in
    "$root"/formal|"$root"/formal/*|"$root"/.claude/hooks|"$root"/.claude/hooks/*|"$root"/.claude/settings.json|"$root"/.claude/settings.local.json) return 0 ;;
  esac
  return 1
}

case "$tool" in
  Edit|Write|MultiEdit|NotebookEdit)
    path="$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")"
    [ -z "$path" ] && exit 0
    [[ "$path" != /* ]] && path="$root/$path"
    is_protected "$path" && protected_msg "$path"
    ;;
  Bash)
    # Best effort: refuse obviously mutating shell commands that target protected paths.
    # (The hard guarantee is CODEOWNERS + CI; this just stops the common accidents.)
    cmd="$(jq -r '.tool_input.command // empty' <<<"$input")"
    if grep -Eq '(formal/|\.claude/hooks|\.claude/settings)' <<<"$cmd" &&
       grep -Eq '(^|[^[:alnum:]_-])(rm|mv|cp|tee|sed +-i|perl +-[a-z]*i|truncate|chmod|install|patch|ed|dd)( |$)|>>?[^&]|git +(checkout|restore|apply|stash|rm|mv|reset)|(formal|\.claude).*(open\(|writeFile|write_text)' <<<"$cmd"; then
      # allow read-only git/inspection that merely mentions the path
      grep -Eq '^[[:space:]]*(git +(diff|log|show|status)|cat|ls|grep|rg|head|tail|wc)( |$)' <<<"$cmd" && ! grep -Eq '>>?[^&]' <<<"$cmd" && exit 0
      protected_msg "a path in this shell command"
    fi
    ;;
esac
exit 0

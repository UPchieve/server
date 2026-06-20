#! /usr/bin/env bash
#
# Format-check the SQL that changed for this commit/MR, restricted to the
# directories passed as arguments (configured in package.json's lint:sql:check).

DIRS=("$@")
if [ ${#DIRS[@]} -eq 0 ]; then
  echo "lint_sql_check: no directories given (configure them in package.json)." >&2
  exit 2
fi

# Resolve everything against the git work-tree root so behavior is independent of
# the caller's CWD (pnpm script, pre-commit hook, or a direct invocation).
ROOT="$(git rev-parse --show-toplevel)" || exit 2
cd "$ROOT" || exit 2

PGF="$ROOT/node_modules/.bin/pg-formatter"
if [ ! -x "$PGF" ]; then
  echo "lint_sql_check: pg-formatter not found at $PGF (run pnpm install)." >&2
  exit 2
fi

# Scope:
#   * CI (CHECK_SQL_BASE_REF set to the MR target / default branch): everything
#     changed on this branch vs that ref — git diff <baseRef>..HEAD.
#   * pre-commit hook (CHECK_SQL_BASE_REF unset): only what's *staged* —
#     git diff --cached.
# Two-dot baseRef..HEAD compares the two commit trees directly, so it does not
# depend on a merge-base being present in a shallow CI clone. Unset => --cached.
if [ -n "${CHECK_SQL_BASE_REF:-}" ]; then
  range=("${CHECK_SQL_BASE_REF}..HEAD")
else
  range=("--cached")
fi

changed_sql=()
while IFS= read -r f; do
  [ -n "$f" ] && changed_sql+=("$f")
done < <(git diff --name-only --diff-filter=ACMR "${range[@]}" -- "${DIRS[@]}" | grep -E '\.sql$')

if [ ${#changed_sql[@]} -eq 0 ]; then
  echo "No changed SQL files to lint."
  exit 0
fi

# perl's alarm survives exec, and perl is guaranteed present
# (pg-formatter shells out to it).
TIMEOUT_SECS=120
with_timeout() {
  if command -v timeout >/dev/null 2>&1; then
    timeout "$TIMEOUT_SECS" "$@"
  elif command -v gtimeout >/dev/null 2>&1; then
    gtimeout "$TIMEOUT_SECS" "$@"
  else
    perl -e 'alarm shift; exec @ARGV' "$TIMEOUT_SECS" "$@"
  fi
}

echo "Linting ${#changed_sql[@]} changed SQL file(s)..."
for f in "${changed_sql[@]}"; do
  [ -e "$f" ] || continue
  with_timeout "$PGF" --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$f"
  rc=$?
  if [ "$rc" -eq 124 ] || [ "$rc" -eq 142 ]; then # 124=GNU timeout, 142=128+SIGALRM(perl)
    echo "ERROR: pg-formatter timed out (${TIMEOUT_SECS}s) on $f — aborting." >&2
    echo "       This is the known pg-formatter per-file spawn hang; retry the commit, or run 'pnpm run lint:sql' manually." >&2
    exit 1
  elif [ "$rc" -ne 0 ]; then
    echo "ERROR: pg-formatter failed (exit $rc) on $f" >&2
    exit "$rc"
  fi
done

# pg-formatter rewrote files in place. If it changed any, the working tree now
# differs from the index; fail and ask for a re-stage (locally) or fail the MR
# (CI). Scoped to the files we touched so unrelated unstaged SQL can't trip it.
if [[ $(git ls-files -m -- "${changed_sql[@]}") ]]; then
  echo "SQL code changes made by pg-formatter, please stage the files and try again."
  exit 1
else
  echo "No sql code changes made by pg-formatter!"
  exit 0
fi

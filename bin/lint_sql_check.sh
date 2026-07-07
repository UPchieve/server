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

PG_FORMATTER="$ROOT/node_modules/.bin/pg-formatter"
if [ ! -x "$PG_FORMATTER" ]; then
  echo "lint_sql_check: pg-formatter not found at $PG_FORMATTER (run pnpm install)." >&2
  exit 2
fi

# Scope:
#   * CI on an MR (CHECK_SQL_BASE_REF = MR target branch): everything changed on
#     this branch vs the target — git diff <baseRef>..HEAD.
#   * CI on a default-branch push (CHECK_SQL_BASE_REF = previous commit on the
#     branch): just what this push introduced — git diff <baseRef>..HEAD.
#   * pre-commit hook (CHECK_SQL_BASE_REF unset): only what's *staged* —
#     git diff --cached.
# Two-dot baseRef..HEAD compares the two commit trees directly, so it does not
# depend on a merge-base being present in a shallow CI clone. Unset => --cached.
if [ -n "${CHECK_SQL_BASE_REF:-}" ]; then
  range=("${CHECK_SQL_BASE_REF}..HEAD")
else
  range=("--cached")
fi

# Capture first so a git diff failure fails the check instead of being swallowed.
if ! diff_out="$(git diff --name-only --diff-filter=ACMR "${range[@]}" -- "${DIRS[@]}")"; then
  echo "ERROR: 'git diff ${range[*]}' failed — cannot determine changed SQL files." >&2
  exit 1
fi

changed_sql=()
while IFS= read -r f; do
  [ -n "$f" ] && changed_sql+=("$f")
done < <(printf '%s\n' "$diff_out" | grep -E '\.sql$')

if [ ${#changed_sql[@]} -eq 0 ]; then
  echo "No changed SQL files to lint."
  exit 0
fi

# pg-formatter occasionally hangs forever on a single file, so cap each call at
# 120s with perl's alarm() (perl is always present — pg-formatter shells out to
# it). A timed-out call is killed by SIGALRM, which a shell reports as exit 142;
# we treat that as a retryable timeout, not a real formatting failure.
TIMEOUT_SECS=120
TIMEOUT_EXIT_CODE=142  # 128 + SIGALRM(14)

with_timeout() {
  # `exec` replaces perl with the command; the alarm timer set above survives it.
  perl -e 'alarm shift; exec @ARGV' "$TIMEOUT_SECS" "$@"
}

echo "Linting ${#changed_sql[@]} changed SQL file(s)..."
for f in "${changed_sql[@]}"; do
  [ -e "$f" ] || continue
  with_timeout "$PG_FORMATTER" --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$f"
  rc=$?
  if [ "$rc" -eq "$TIMEOUT_EXIT_CODE" ]; then
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

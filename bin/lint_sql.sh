#! /usr/bin/env bash
#
# Format ALL SQL files in the directories passed as arguments (configured in
# package.json's lint:sql script). This is the on-demand whole-repo formatter
# (pnpm run lint:sql / lint:write); it intentionally formats everything, unlike
# the diff-scoped pre-commit/CI check in lint_sql_check.sh.
#
# bash 3.2-compatible (macOS ships 3.2): no mapfile/readarray.

DIRS=("$@")
if [ ${#DIRS[@]} -eq 0 ]; then
  echo "lint_sql: no directories given (configure them in package.json)." >&2
  exit 2
fi

# Resolve against the git work-tree root so behavior is CWD-independent.
ROOT="$(git rev-parse --show-toplevel)" || exit 2
cd "$ROOT" || exit 2

PGF="$ROOT/node_modules/.bin/pg-formatter"
if [ ! -x "$PGF" ]; then
  echo "lint_sql: pg-formatter not found at $PGF (run pnpm install)." >&2
  exit 2
fi

for dir in "${DIRS[@]}"; do
  [ -d "$dir" ] || continue
  (
    files=()
    while IFS= read -r f; do
      [ -n "$f" ] && files+=("$f")
    done < <(find "$dir" -name "*.sql")
    if [ ${#files[@]} -gt 0 ]; then
      echo "linting files in $dir"
      "$PGF" --keyword-case="uppercase" --inplace --placeholder=":\w+!" "${files[@]}"
      echo "linting files in $dir done"
    fi
  ) &
done

# Wait for all directory formatters to finish.
wait

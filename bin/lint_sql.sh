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

PG_FORMATTER="$ROOT/node_modules/.bin/pg-formatter"
if [ ! -x "$PG_FORMATTER" ]; then
  echo "lint_sql: pg-formatter not found at $PG_FORMATTER (run pnpm install)." >&2
  exit 2
fi

pids=()
for dir in "${DIRS[@]}"; do
  [ -d "$dir" ] || continue
  (
    files=()
    while IFS= read -r f; do
      [ -n "$f" ] && files+=("$f")
    done < <(find "$dir" -name "*.sql")
    [ ${#files[@]} -eq 0 ] && exit 0
    echo "linting files in $dir"
    "$PG_FORMATTER" --keyword-case="uppercase" --inplace --placeholder=":\w+!" "${files[@]}"
    rc=$? # exit the subshell with pg-formatter's status, not the trailing echo's
    echo "linting files in $dir done"
    exit "$rc"
  ) &
  pids+=("$!")
done

# Wait for all directory formatters; propagate a non-zero status if any failed
# (bash 3.2 has no `wait -n`, so wait on each PID and keep the last failure).
status=0
for pid in "${pids[@]}"; do
  wait "$pid" || status=$?
done
exit "$status"

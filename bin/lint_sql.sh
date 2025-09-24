#! /usr/bin/env bash

# collect sql files
declare -a server_files=()
for filename in $(find ./server -name "*.sql"); do
    [ -e "$filename" ] || continue
    server_files+=("$filename")
done

declare -a migrations_files=()
for filename in $(find ./database/migrations -name "*.sql"); do
  [ -e "$filename" ] || continue
  migrations_files+=("$filename")
done

declare -a seed_updates_files=()
for filename in $(find ./database/seed-updates -name "*.sql"); do
  [ -e "$filename" ] || continue
  seed_updates_files+=("$filename")
done

declare -a seeds_files=()
for filename in $(find ./database/seeds -name "*.sql"); do
  [ -e "$filename" ] || continue
  seeds_files+=("$filename")
done

# run formatter for each set of files in parallel
(
echo "linting files in server/"
npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" ${server_files[@]}
echo "linting files in server/ done"
) &

(
echo "linting files in database/migrations"
npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" ${migrations_files[@]}
echo "linting files in database/migrations done"
) &

(
echo "linting files in database/seed-updates"
npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" ${seed_updates_files[@]}
echo "linting files in database/seed-updates done"

echo "linting files in database/seeds"
npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" ${seeds_files[@]}
echo "linting files in database/seeds done"
) &

# wait for the above background process to be complete
wait

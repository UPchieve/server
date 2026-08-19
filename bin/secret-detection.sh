#!/bin/bash
#
# Scans for committed secrets.
# Runs the scanner in Docker so nobody has to install it locally.
#
#   ./bin/secret-detection.sh check-staged   # pre-commit hook: staged changes only
#   ./bin/secret-detection.sh check-branch   # pre-push hook: the commits in PUSH_COMMITS
#   ./bin/secret-detection.sh pull           # pre-fetches the image
#
set -o pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

IMAGE="ghcr.io/betterleaks/betterleaks:v1.7.4"

if ! docker info > /dev/null 2>&1; then
 echo "❌ Error: Docker isn't running (or isn't installed)."
 echo "Start Docker and try again."
 exit 1
fi

# The scanner reads history straight from .git directory.
# In a worktree, .git is a _file_, so the .git directory has to be
# mounted into the Docker container explicitly. This just gets the absolute
# path to that .git directory so we can mount it.
COMMON_DIR=$(cd "$(git rev-parse --git-common-dir)" && pwd) || exit 1

scan() {
 docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$PWD:$PWD" \
  -v "$COMMON_DIR:$COMMON_DIR" \
  -w "$PWD" \
  "$IMAGE" "$@" --no-banner --verbose --config .secret-detection.toml
}

COMMAND="$1"
shift

case "$COMMAND" in
 pull)
 docker pull "$IMAGE"
 ;;
 check-staged)
 scan git --staged "$@"
 ;;
 check-branch)
 # The pre-push hook is the only thing that knows which commits are actually
 # being pushed, and has exported those refs to PUSH_COMMITS.
 if [ -z "${PUSH_COMMITS:-}" ]; then
  echo "❌ Error: PUSH_COMMITS is not set."
  echo "Run this through the pre-push hook rather than on its own."
  exit 1
 fi

 # `--no-walk` keeps git from following ancestry. The commit list is already
 # _exactly_ what needs scanning, and ancestors are on the remote already.
 #
 # The scan is pointed at the .git directory (COMMON_DIR) rather than at $PWD,
 # because a git worktree has no .git of its own, but we know the state exists
 # in .git directory because we've already committed at this point.
 output=$(scan git "$COMMON_DIR" --log-opts="--no-walk=unsorted $PUSH_COMMITS" "$@" 2>&1)
 status=$?
 echo "$output"
 exit $status
 ;;
 *)
 echo "❌ Error: Unknown command '$COMMAND'"
 echo "Valid commands: check-staged, check-branch, pull"
 exit 1
 ;;
esac

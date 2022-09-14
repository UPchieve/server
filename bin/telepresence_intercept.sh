#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

if [[ -n "$1" ]]
then
  namespace=$1
else
  echo -n "Please enter a namespace: "
  read -r namespace
fi
echo "Using the $namespace namespace"

if [[ -n "$2" ]]
then
  port=$2
else
  echo -n "Please enter a port (3000 for REST or 3001 for socket traffic): "
  read -r port
fi
echo "Intercepting port $port"

# exit if we run into any unset vars
# placed here because above we may have $1 or $2 unset
set -o nounset

# gets replicasets sorted by date, with first created in the 0 index
# calling jq 'reverse' gives us the latest replicaset in the 0 index
# then we grab the 0 index
LATEST_WEB_REPLICA_SET=$(kubectl get replicasets \
  -n "$namespace" \
  -o json \
  --sort-by '.metadata.creationTimestamp' \
  --selector component=web \
  | jq '.items' | jq 'reverse' | jq -r '.[0].metadata.name')

echo "Intercepting replicaset $LATEST_WEB_REPLICA_SET"

# intercept in the passed namespace on the passed port, and export k8s env
# to the local file telepresence.env
telepresence intercept "$LATEST_WEB_REPLICA_SET" \
  --namespace="$namespace" \
  --port="$port":"$port" \
  --service="subway" \
  --env-file=./telepresence.env

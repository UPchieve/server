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

intercepted_replica_set=$(telepresence list --namespace "$namespace" | head -n 1 | cut -d":" -f1 | xargs)
intercept_with_namespace=$(echo "$intercepted_replica_set-$namespace")

echo "Leaving $intercept_with_namespace"

telepresence leave "$intercept_with_namespace"

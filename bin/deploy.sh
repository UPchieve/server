#!/bin/bash

set -eux

if [ "$1" = 'dev' ]; then
  ENV_NAME='development'
else
  ENV_NAME=$(op read op://private/subway-local-deploy/resource-group)
fi

REGISTRY_NAME=uc${ENV_NAME}registry.azurecr.io

echo Logging in to container registry: $REGISTRY_NAME
az acr login --name $REGISTRY_NAME

# Revision names for ACA can only be a max of 54 characters, and can only contain lowercase
# characters, numbers, or dashes.
DATETIME=$(date '+%Y%m%d%H%M%S')
EMAIL=$(op account list --format json | jq -r '.[0].email')
USER=${EMAIL%@*}
FIRST_INITIAL="${USER:0:1}"
LAST_NAME="${USER#*.}"
LAST_INITIAL="${LAST_NAME:0:1}"
VERSION="${DATETIME}-${FIRST_INITIAL}${LAST_INITIAL}"

IMAGE=$REGISTRY_NAME/subway:$VERSION
echo "Building Docker image with tag: $IMAGE"
docker build --tag $IMAGE .
docker push $IMAGE

RESOURCE_GROUP_NAME=$ENV_NAME-resource-group

CONTAINER_APP_NAME=$ENV_NAME-container-app-subway
echo "Deploying subway image $IMAGE to $CONTAINER_APP_NAME in $RESOURCE_GROUP_NAME"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --image $IMAGE \
  --revision-suffix $VERSION

CONTAINER_APP_WORKER_NAME=$ENV_NAME-container-app-worker
echo "Deploying worker image $IMAGE to $CONTAINER_APP_WORKER_NAME in $RESOURCE_GROUP_NAME"
az containerapp update \
  --name $CONTAINER_APP_WORKER_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --image $IMAGE \
  --revision-suffix $VERSION

#!/bin/bash

if [ "$1" = 'hackers' ]; then
  RESOURCE_GROUP='hackers'
else
  RESOURCE_GROUP=$(op read op://private/subway-local-deploy/resource-group)
fi

REGISTRY_NAME=uc${RESOURCE_GROUP}registry.azurecr.io

echo Logging in to container registry: $REGISTRY_NAME
az acr login --name $REGISTRY_NAME

TIMESTAMP=$(date +%s%N | cut -b1-13)
IMAGE=$REGISTRY_NAME/subway:$TIMESTAMP
echo "Building Docker image with tag: $IMAGE"
docker build --tag $IMAGE .
docker push $IMAGE

CONTAINER_APP_NAME=$RESOURCE_GROUP-container-app-subway
echo "Deploying subway: $CONTAINER_APP_NAME"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $IMAGE

CONTAINER_APP_WORKER_NAME=$RESOURCE_GROUP-container-app-worker
echo "Deploying worker: $CONTAINER_APP_WORKER_NAME"
az containerapp update \
  --name $CONTAINER_APP_WORKER_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $IMAGE

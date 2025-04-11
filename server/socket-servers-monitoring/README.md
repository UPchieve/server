# Socket Servers Monitoring

I have a theory that some of the unreliability in our sockets comes from the socket servers not responding
to events that require responses in the stream. This would manifest in our code as not receiving responses
to `fetchSockets` call, but a `serverSideEmit` also can expect a response.

Instead of adding an interval execution to our server, this module will be deployed with Azure Container
Instances, to ping the servers every 5 minutes. If we don't receive any responses, we know something's up!

The following are the commands run for the dev environment - update the names accordingly for other environments.
For non-dev, just use the subway repository with latest (once MR merged and image pushed) instead of building
locally and pushing to the container registry (i.e. skip steps 1 and 2).

1. Build the application locally.
```
$ docker build -t ucdevelopmentregistry.azurecr.io/socket-servers-monitoring:v1 .
```

2. Push to the container registry.
```
$ az acr login --name ucdevelopmentregistry
$ docker push ucdevelopmentregistry.azurecr.io/socket-servers-monitoring:v1
```

3. Create a service principal with permission to pull from registry.
```
$ ACR_REGISTRY_ID=$(az acr show --name ucdevelopmentregistry --query "id" --output tsv)
$ SP_NAME=socket-servers-monitoring-pull
$ PASSWORD=$(az ad sp create-for-rbac --name $SP_NAME --skip-assignment --query "password" --output tsv)
$ USER_NAME=$(az ad sp list --display-name $SP_NAME --query "[].appId" --output tsv)
$ az role assignment create \
  --assignee $USER_NAME \
  --role acrpull \
  --scope $ACR_REGISTRY_ID
```

4. Create the Azure Container Instance.
```
$ az container create \
  --resource-group development-resource-group \
  --name socket-servers-monitoring \
  --image ucdevelopmentregistry.azurecr.io/socket-servers-monitoring:v1 \
  --registry-login-server ucdevelopmentregistry.azurecr.io \
  --registry-username $USER_NAME \
  --registry-password $PASSWORD \
  --os-type Linux \
  --restart-policy OnFailure \
  --cpu 1 \
  --memory 1 \
  --secure-environment-variables DOPPLER_TOKEN="$(op read op://private/doppler-subway-dev/password)" \
  --command-line "doppler run -- npm run start:socket-servers-monitoring"
```

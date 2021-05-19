#! /usr/bin/env bash

pack build "registry.gitlab.com/upchieve/subway/local:latest" \
  --clear-cache \
  --builder paketobuildpacks/builder:full \
  --buildpack registry.gitlab.com/upchieve/doppler-buildpack \
  --buildpack gcr.io/paketo-buildpacks/nodejs \
  --buildpack gcr.io/paketo-buildpacks/procfile \
  --env "BP_NODE_OPTIMIZE_MEMORY=true" \
  --env "NODE_ENV=development"

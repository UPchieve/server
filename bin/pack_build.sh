#! /usr/bin/env bash

pack build "registry.gitlab.com/upchieve/subway/local:latest" \
  --builder paketobuildpacks/builder:full \
  --buildpack registry.gitlab.com/upchieve/doppler-buildpack \
  --buildpack gcr.io/paketo-buildpacks/nodejs \
  --buildpack gcr.io/paketo-buildpacks/procfile

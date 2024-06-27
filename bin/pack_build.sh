#! /usr/bin/env bash

pack build "registry.gitlab.com/upchieve/subway/local:latest" \
  --cache-image registry.gitlab.com/upchieve/subway/cache-image:latest \
  --builder heroku/buildpacks:20 \
  --buildpack registry.gitlab.com/upchieve/doppler-buildpack \
  --buildpack heroku/nodejs \
  --buildpack heroku/procfile@0.6.2 \
  --publish

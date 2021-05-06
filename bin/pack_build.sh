#! /usr/bin/env bash

pack build "upchieve/subway:local" \
  --builder heroku/buildpacks:20 \
  --buildpack registry.gitlab.com/upchieve/doppler-buildpack \
  --buildpack heroku/nodejs \
  --buildpack heroku/procfile@0.6.2 \
  --env "NODE_ENV=production"

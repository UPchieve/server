#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

# all variables sourced will be exported
set -o allexport
# get all the variables from the k8s environment file created above
source telepresence.env
# turn off all variables being exported
set +o allexport
# set home to tmp for doppler to work without disturbing other local doppler settings
HOME=/tmp/
# run dev backend with the doppler environment vars injected
doppler run \
  --configuration /tmp/doppler.yaml \
  -- npm run dev:backend

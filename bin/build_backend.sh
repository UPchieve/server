#! /usr/bin/env bash

if [[ $(npx tsc --p tsconfig.server.json) -eq 0 ]]
then
  echo "Completed typescript compilation"
else
  echo "Typescript compilation failed" >&2
  exit 1
fi

if [[ $(cp -r server/swagger build/swagger) -eq 0 ]]
then
  echo "Copied swagger files"
else
  echo "Failed to copy swagger files" >&2
  exit 1
fi

if [[ $(mkdir build/services/MailService/views && cp server/services/MailService/views/* build/services/MailService/views) -eq 0 ]]
then
  echo "Copied mail template files"
else
  echo "Failed to copy mail templates" >&2
  exit 1
fi

if [[ $(cp -rn server/views build/) -eq 0 ]]
then
  echo "Copied view template files"
else
  echo "Failed to copy view template files, double check they all made it" >&2
  exit 0
fi

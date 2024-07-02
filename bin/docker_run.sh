#!/usr/bin/env bash

sleep 15

npx ts-node server/init

export NODE_OPTIONS=--max-old-space-size=5000
npm install bcrypt
npm rebuild node-sass
npm run dev

FROM node:12.22-alpine3.11 as builder
ENV NODE_ENV development

USER root

# Install dependencies for building
RUN apk update \
    && apk upgrade \
    && apk add --no-cache git python2 make g++ bash curl

# Create user/group/dir to run securely
RUN addgroup -S app \
    && adduser -S -G app app && \
    mkdir /app && \
    chown app /app

# We switch to the app user so everything gets created
# with that user's permissions set
USER app
WORKDIR /app

# Get doppler and make it executable
RUN curl -Ls \
  -o doppler.tar.gz \
  https://github.com/DopplerHQ/cli/releases/download/3.24.4/doppler_3.24.4_linux_amd64.tar.gz && \
  tar -xvf doppler.tar.gz && \
  chmod +x doppler

# Copy over dependency files and install first
# to optimize caching layers
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

# Copy over rest of files and build
COPY . .
RUN npm run build

# Prune out dev dependencies
ENV NODE_ENV production
RUN npm prune

################

FROM alpine:3.11

# Set base env vars
ENV NODE_ENV production
ENV NEW_RELIC_NO_CONFIG_FILE true

# same thing as above, establish a non-root user to run as
USER root
RUN apk update \
    && apk upgrade && apk add --no-cache nodejs linux-headers
RUN addgroup -S app \
    && adduser -S -G app app && \
    mkdir /app && \
    chown app /app && \
    # necessary later for doppler, which uses /tmp as home
    chown app /tmp

# Change to app dir
WORKDIR /app

# Copy over files, puts doppler in /usr/bin so it"s on the path
COPY --from=builder /app/build ./build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/doppler /usr/bin/doppler

# Switch to non-root user, which only has access to this dir
USER app

# Necessary for doppler to start correctly
ENV HOME "/tmp"

ENTRYPOINT ["doppler", "run", "--configuration", "/tmp/doppler.yaml", "--", "npm", "start"]

FROM node:24.15.0-alpine3.23

WORKDIR app

# Install build dependencies
# cairo-dev pango-dev for `canvas` node module used for rendering the zwibbler whiteboard in subway
RUN apk add --no-cache python3 make g++ wget cairo-dev pango-dev

# Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig*.json ./
COPY server ./server
COPY database ./database
RUN pnpm run build

ENTRYPOINT ["doppler", "run", "--"]
CMD ["pnpm", "run", "start"]


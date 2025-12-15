FROM node:20.10.0-alpine

WORKDIR app

# Allow passing ZWIBBLER_NODE_URL at build time
ARG ZWIBBLER_NODE_URL

# Install build dependencies
# cairo-dev pango-dev for `canvas` node module used for rendering the zwibbler whiteboard in subway
RUN apk add --no-cache python3 make g++ wget cairo-dev pango-dev

# Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY server ./server
COPY database ./database

# Download zwibbler-node if URL is provided
RUN if [ -n "$ZWIBBLER_NODE_URL" ]; then \
      mkdir -p vendors && \
      wget -q "$ZWIBBLER_NODE_URL" -O vendors/zwibbler-node.js; \
    fi

RUN npm run build

ENTRYPOINT ["doppler", "run", "--"]
CMD ["npm", "run", "start"]


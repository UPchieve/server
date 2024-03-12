FROM node:20-alpine

WORKDIR app

# Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

COPY package*.json ./
RUN npm install

COPY tsconfig*.json ./
COPY server ./server
COPY database ./database
RUN npm run build:tsc

ENTRYPOINT ["doppler", "run", "--"]
CMD ["npm", "run", "start"]


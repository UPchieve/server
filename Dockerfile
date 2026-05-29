FROM node:24.15.0-slim AS base

# Enable pnpm.
RUN corepack enable pnpm

WORKDIR /app

# Install runtime dependencies.
# cairo and pango are required for canvas, which is used to render Zwibbler whiteboard in subway.
RUN apt-get update && apt-get install -y libcairo2-dev libpango1.0-dev

# Install Doppler CLI.
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get -y install doppler

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig*.json ./
COPY server ./server
COPY database ./database
RUN pnpm run build

ENTRYPOINT ["doppler", "run", "--"]
CMD ["pnpm", "run", "start"]

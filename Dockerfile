FROM node:12.20.1-buster-slim
ENV NODE_ENV dev
ENV NEW_RELIC_NO_CONFIG_FILE true
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
EXPOSE 3000 3001
COPY . .
RUN npm install
CMD bin/docker_run.sh

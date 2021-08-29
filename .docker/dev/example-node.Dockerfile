FROM node:alpine AS builder

WORKDIR /app

ADD ./services/node/lerna.json .
ADD ./services/node/package.json .
ADD ./services/node/.npmrc .

ADD services/node/packages/common/package.json packages/common/package.json
ADD services/node/packages/example/package.json packages/example/package.json

RUN yarn

ADD services/node/ .

CMD ["yarn", "workspace", "@monorepotag/example", "start"]

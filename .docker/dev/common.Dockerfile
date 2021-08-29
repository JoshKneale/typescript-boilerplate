FROM node:alpine AS builder

WORKDIR /app

ADD ./services/node/lerna.json .
ADD ./services/node/package.json .
ADD ./services/node/.npmrc .

ADD services/node/packages/common/package.json packages/common/package.json

RUN yarn

ADD services/node/ .

FROM node:alpine

WORKDIR /usr/app

COPY services/node/ .

RUN yarn

RUN yarn build

RUN yarn # Create sim link

EXPOSE 80

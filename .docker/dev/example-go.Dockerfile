FROM golang:1.15-alpine as builder

# Pull packages that dont come with alpine
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Add the module files and download dependencies.
ENV GO111MODULE=on

WORKDIR /app

ADD services/go/go.mod .
ADD services/go/go.sum .

RUN go mod download

COPY services/go/common /app/common
COPY services/go/example /app/example

RUN go get github.com/githubnemo/CompileDaemon@master

ENTRYPOINT CompileDaemon -log-prefix=false -build="go build -o build ./example" -command="./build" -polling=true


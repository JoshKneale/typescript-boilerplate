#!/bin/bash

export AWS_SECRET_ACCESS_KEY="secret"
export AWS_ACCESS_KEY_ID="key"
export AWS_DEFAULT_REGION="eu-west-1"

echo "Initialising localstack..."
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name "queue1" --region eu-west-1
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name "queue1" --region eu-west-1

aws --endpoint-url=http://localhost:4566 sns create-topic --name "sns1" --region eu-west-1

aws --endpoint-url=http://localhost:4566 sqs list-queues
aws --endpoint-url=http://localhost:4566 sns list-topics


#!/bin/bash -x

mkdir -p go-grpc/proto
mkdir -p nodejs-grpc/proto
mkdir -p python-grpc/proto

rm go-grpc/proto/*.proto
rm nodejs-grpc/proto/*.proto
rm python-grpc/proto/*.proto

cp -r ../proto/*.proto go-grpc/proto
cp -r ../proto/*.proto nodejs-grpc/proto
cp -r ../proto/*.proto python-grpc/proto

docker run --rm \
    -u $(id -u):$(id -g) \
  -v $(pwd)/go-grpc/proto:/proto \
  -v $(pwd)/go-grpc/generated:/generated \
  grpc-go-generator:latest

docker run --rm \
    -u $(id -u):$(id -g) \
  -v $(pwd)/nodejs-grpc/proto:/proto \
  -v $(pwd)/nodejs-grpc/generated:/generated \
  grpc-nodejs-generator:latest

docker run --rm \
    -u $(id -u):$(id -g) \
  -v $(pwd)/python-grpc/proto:/proto \
  -v $(pwd)/python-grpc/generated:/generated \
  grpc-python-generator:latest

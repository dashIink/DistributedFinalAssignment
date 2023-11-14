#!/bin/sh
# Generate gRPC files for Python using the environment variable
mkdir -p /generated

for proto in ${PROTO_FILES_DIR}/*.proto; do
    protoc \
        -I${PROTO_FILES_DIR} \
        --go_out=/generated \
        --go-grpc_out=/generated \
        --plugin=protoc-gen-go=/go/bin/protoc-gen-go \
        --plugin=protoc-gen-go-grpc=/go/bin/protoc-gen-go-grpc \
        "$proto"
done

#!/bin/sh
# Generate gRPC files for Python using the environment variable
mkdir -p /generated

for proto in ${PROTO_FILES_DIR}/*.proto; do
    python -m grpc_tools.protoc -I${PROTO_FILES_DIR} --python_out=/generated --grpc_python_out=/generated --pyi_out=/generated "$proto"
done

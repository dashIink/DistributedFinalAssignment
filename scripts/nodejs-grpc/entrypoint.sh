#!/bin/sh
# Iterate over each .proto file and generate gRPC files for Node.js
for proto_file in ${PROTO_FILES_DIR}/*.proto; do
  grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:/generated \
    --grpc_out=grpc_js:/generated \
    --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
    -I${PROTO_FILES_DIR} \
    "${proto_file}"
done

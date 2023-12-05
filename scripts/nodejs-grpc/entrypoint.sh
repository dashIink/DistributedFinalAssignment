#!/bin/sh
# Iterate over each .proto file and generate gRPC files for Node.js
for proto_file in ${PROTO_FILES_DIR}/*.proto; do
  # grpc_tools_node_protoc \
  #   --js_out=import_style=commonjs,binary:/generated \
  #   --grpc_out=grpc_js:/generated \
  #   --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
  #   -I${PROTO_FILES_DIR} \
  #   "${proto_file}"
  
  # protoc \
  #   --plugin=$(npm root)/.bin/protoc-gen-ts_proto \
  #   --ts_proto_out=/generated \
  #   --ts_proto_opt=outputServices=generic-definitions,outputClientImpl=false,oneof=unions,snakeToCamel=false,esModuleInterop=true \
  #   --proto_path=${PROTO_FILES_DIR} \
  #   "${proto_file}"

  protoc --plugin=$(npm root)/.bin/protoc-gen-ts_proto \
    --ts_proto_out=/generated \
    --ts_proto_opt=outputServices=grpc-js \
    --ts_proto_opt=esModuleInterop=true \
    -I=${PROTO_FILES_DIR} ${proto_file}
done

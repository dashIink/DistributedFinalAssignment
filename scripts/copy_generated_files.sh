#!/bin/bash -x

cp -r go-grpc/generated/.pb/* ../metadata-service/.pb

cp -r nodejs-grpc/generated/*.ts ../datastore-service/src/gen

cp -r python-grpc/generated/*.py ../file-handler-server/gen
cp -r python-grpc/generated/*.pyi ../file-handler-server/gen

sudo chown -R $USER:$USER ../metadata-service/.pb
sudo chown -R $USER:$USER ../datastore-service/src/gen
sudo chown -R $USER:$USER ../file-handler-server/gen
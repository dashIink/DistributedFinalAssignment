# Python gRPC Files Generator

## Building the Docker Image

To build the Docker image, run the following command:

```sh
docker build -t grpc-python-generator .

mkdir -p ./proto

cp -r path/to/proto/files ./proto

docker run --rm \
  -v $(pwd)/proto:/proto \
  -v $(pwd)/generated:/generated \
  grpc-python-generator:latest

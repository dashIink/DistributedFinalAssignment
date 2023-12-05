# Start from the latest golang base image
FROM golang:1.21.4

# Install protoc
RUN apt-get update && apt-get install -y protobuf-compiler

# Initialize a new module (this creates a go.mod file in your directory)
# RUN go mod init grpcgenerator

# Install the necessary dependencies
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28

# Set the working directory in the container
WORKDIR /app

# Set an environment variable for the proto files directory
ENV PROTO_FILES_DIR=/proto

# Copy the entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

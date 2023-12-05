# Second stage: Use the official Golang image
FROM golang:latest

# Install CA certificates, useful for making TLS connections
RUN apt-get update && apt-get install -y ca-certificates libzmq3-dev libczmq-dev && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod .
RUN go mod download
RUN go mod tidy

# Copy the Go source files
COPY . .

# Build the Go gRPC server
RUN go build -o metadata_grpc_server 

CMD [ "/app/metadata_grpc_server" ]
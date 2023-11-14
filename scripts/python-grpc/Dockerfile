# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /app

# Install protoc and gRPC tools for Python
RUN apt-get update && apt-get install -y protobuf-compiler

RUN pip install --upgrade pip
RUN pip install grpcio-tools

# Set an environment variable for the proto files directory
ENV PROTO_FILES_DIR=/proto

# Copy the entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

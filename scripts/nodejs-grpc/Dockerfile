# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install the Protocol Buffers compiler
RUN apt-get update && apt-get install -y protobuf-compiler

# Set the working directory in the container
WORKDIR /app

# Install grpc-tools globally
RUN npm install ts-proto

ENV PROTO_FILES_DIR=/proto

# Copy the entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

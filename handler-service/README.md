docker build -t handler-service .

docker run -d -p 8080:8080 handler-service
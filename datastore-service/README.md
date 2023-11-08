docker build -t datastore-service .

docker run -d -p 6969:6969 datastore-service

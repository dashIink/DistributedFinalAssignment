package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	gen "metadata-service/.pb"

	"google.golang.org/grpc"

	clientv3 "go.etcd.io/etcd/client/v3"
)

type MetadataServiceServer struct {
	cli *clientv3.Client
	gen.UnimplementedMetadataServiceServer
}

func (s *MetadataServiceServer) GetTopKDatastores(ctx context.Context, req *gen.GetTopKDatastoresRequest) (*gen.GetTopKDatastoresResponse, error) {
	panic("implement me")
}

func (s *MetadataServiceServer) GetFileChunkLocations(req *gen.GetFileChunkLocationsRequest, stream gen.MetadataService_GetFileChunkLocationsServer) error {
	panic("implement me")
}

func (s *MetadataServiceServer) RegisterFileChunk(ctx context.Context, req *gen.RegisterFileChunkRequest) (*gen.RegisterFileChunkResponse, error) {
	panic("implement me")
}

func main() {
	etcdClusterHostname := os.Getenv("ETCD_CLUSTER_HOSTNAME")
	etcdClusterPort := os.Getenv("ETCD_CLUSTER_PORT")

	fmt.Println("ETCD_CLUSTER_HOSTNAME: " + etcdClusterHostname)
	fmt.Println("ETCD_CLUSTER_PORT: " + etcdClusterPort)

	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{"http://" + etcdClusterHostname + ":" + etcdClusterPort},
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer cli.Close()

	// get the port from the environment variable
	port := os.Getenv("PORT")

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	gen.RegisterMetadataServiceServer(grpcServer, &MetadataServiceServer{cli: cli})
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}

}

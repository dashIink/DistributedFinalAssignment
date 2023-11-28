package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"strings"
	"time"

	gen "metadata-service/.pb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	// "github.com/zeromq/goczmq"
	zmq "github.com/pebbe/zmq4"

	"github.com/redis/go-redis/v9"
)

type MetadataServiceServer struct {
	rds        *redis.Client
	pt         *PrefixTree
	datastores *DatastoreHeap
	kv         KeyValueStore
	gen.UnimplementedMetadataServiceServer
}

func (s *MetadataServiceServer) GetTopKDatastores(ctx context.Context, req *gen.GetTopKDatastoresRequest) (*gen.GetTopKDatastoresResponse, error) {
	topKDatastores := s.datastores.TopK(req.K)
	log.Println("Received request for top", req.K, "datastores")
	datastores := make([]*gen.DatastoreInfo, 0)
	for i, datastore := range topKDatastores {
		log.Println("Datastore", i, ":", datastore.Datastore.String())
		log.Println("Datastore", i, ":", datastore.SystemStatus.String())
		freeSpace, err := parseBytes(datastore.SystemStatus.FreeSpace)
		if err != nil {
			log.Println("Error parsing freeSpace:", err)
			return nil, err
		}
		databaseSize, err := parseBytes(datastore.SystemStatus.DatabaseSize)
		if err != nil {
			log.Println("Error parsing databaseSize:", err)
			return nil, err
		}
		datastores = append(datastores, &gen.DatastoreInfo{
			DatastoreId: datastore.String(),
			Hostname:    datastore.Hostname,
			Capacity:    int64(freeSpace),    // TODO: change the capacity type to uint64
			Used:        int64(databaseSize), // TODO: change the used type to uint64
		})
	}
	status := status.New(codes.OK, "Success")
	return &gen.GetTopKDatastoresResponse{
		Datastores: datastores,
		Status: &gen.Status{
			Code:    int32(status.Code()),
			Message: "Success",
			Details: []string{"Success"},
		},
	}, nil
}

func (s *MetadataServiceServer) GetFileChunkLocations(req *gen.GetFileChunkLocationsRequest, stream gen.MetadataService_GetFileChunkLocationsServer) error {
	fileId := req.FileId
	key := fmt.Sprintf("file:metadata:%s", fileId)
	chunkMetadataKeys, err := s.rds.ZRange(context.Background(), key, 0, -1).Result()
	if err != nil {
		return err
	}

	for _, chunkMetadataKey := range chunkMetadataKeys {
		fileChunkMetadata, err := s.rds.HGetAll(context.Background(), chunkMetadataKey).Result()
		if err != nil {
			return err
		}
		datastoreId := fileChunkMetadata["datastore_id"]
		chunkId := fileChunkMetadata["chunk_id"]
		chunkSize, err := strconv.Atoi(fileChunkMetadata["chunk_size"])
		if err != nil {
			return err
		}
		chunkHash := fileChunkMetadata["chunk_hash"]
		chunkSequenceNumber, err := strconv.ParseUint(fileChunkMetadata["chunk_sequence_number"], 10, 64)
		if err != nil {
			return err
		}

		hostname := strings.Split(datastoreId, ":")[0]
		port, err := strconv.Atoi(strings.Split(datastoreId, ":")[1])
		if err != nil {
			return err
		}
		status := status.New(codes.OK, "Success")
		stream.Send(&gen.GetFileChunkLocationResponse{
			ChunkId:       chunkId,
			ChunkSequence: chunkSequenceNumber,
			ChunkSize:     int64(chunkSize),
			ChunkHash:     chunkHash,
			Datastores: &gen.DatastoreInfo{
				DatastoreId: datastoreId,
				Hostname:    hostname,
				Port:        int32(port),
			},
			Status: &gen.Status{
				Code:    int32(status.Code()),
				Message: "Success",
				Details: []string{"Success"},
			},
		})

	}
	return nil
}

type FileChunkMetadata struct {
	ChunkId             string    `redis:"chunk_id"`
	DatastoreId         string    `redis:"datastore_id"`
	ChunkSize           int64     `redis:"chunk_size"`
	ChunkHash           string    `redis:"chunk_hash"`
	CreatedAt           time.Time `redis:"created_at"`
	ChunkSequenceNumber uint64    `redis:"chunk_sequence_number"`
}

func (s *MetadataServiceServer) RegisterFileChunk(ctx context.Context, req *gen.RegisterFileChunkRequest) (*gen.RegisterFileChunkResponse, error) {
	key := fmt.Sprintf("file:metadata:%s", req.FileId)
	log.Println("Received request to register file chunk:", req.FileChunkId)
	_, err := s.rds.ZAdd(ctx, key, redis.Z{
		Score:  float64(req.Sequence),
		Member: fmt.Sprintf("chunk:metadata:%s", req.FileChunkId),
	}).Result()
	if err != nil {
		return nil, err
	}

	fileChunkMetadata := FileChunkMetadata{
		ChunkId:             req.FileChunkId,
		DatastoreId:         req.DatastoreId,
		ChunkSize:           req.ChunkSize,
		ChunkHash:           req.ChunkHash,
		CreatedAt:           time.Now(),
		ChunkSequenceNumber: req.Sequence,
	}
	key2 := fmt.Sprintf("chunk:metadata:%s", req.FileChunkId)
	fmt.Printf("Chunk metadata key: %s\n", key2)
	_, err = s.rds.HSet(ctx, fmt.Sprintf(key2, req.FileChunkId), fileChunkMetadata).Result()
	if err != nil {
		return nil, err
	}

	status := status.New(codes.OK, "Success")
	return &gen.RegisterFileChunkResponse{
		FileChunkId: key2,
		Status: &gen.Status{
			Code:    int32(status.Code()),
			Message: "Success",
			Details: []string{"Success"},
		},
	}, nil
}

func main() {

	storageHostname, ok := os.LookupEnv("STORAGE_HOSTNAME")
	if !ok {
		log.Fatalf("STORAGE_HOSTNAME environment variable not set")
	}
	storagePort, ok := os.LookupEnv("STORAGE_PORT")
	if !ok {
		log.Fatalf("STORAGE_PORT environment variable not set")
	}
	storagePassword, ok := os.LookupEnv("STORAGE_PASSWORD")
	if !ok {
		log.Fatalf("STORAGE_PASSWORD environment variable not set")
	}
	storageDBstr, ok := os.LookupEnv("STORAGE_DB")
	if !ok {
		log.Fatalf("STORAGE_DB environment variable not set")
	}
	storageDB, err := strconv.Atoi(storageDBstr)
	if err != nil {
		log.Fatalf("Error converting STORAGE_DB to int: %s", err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", storageHostname, storagePort),
		Password: storagePassword,
		DB:       storageDB,
	})
	defer redisClient.Close()
	status := redisClient.Ping(context.Background())
	if status.Err() != nil {
		log.Fatalf("Error connecting to redis: %s", status.Err())
	}

	pt := NewPrefixTree()
	datastores := NewDatastoreHeap()
	kv := NewInMemoryKeyValueStore()
	metadataServiceServer := &MetadataServiceServer{datastores: datastores, kv: kv, pt: pt, rds: redisClient}

	go func() {

		// zeromqProxyHostname := os.Getenv("ZEROMQ_PROXY_HOSTNAME")
		zeromqProxyPort := os.Getenv("ZEROMQ_PROXY_PORT")

		zmqContext, err := zmq.NewContext()
		if err != nil {
			log.Fatalf("Error creating zmq context: %s", err)
		}
		defer zmqContext.Term()

		// create a new subscriber
		subscriber, err := zmqContext.NewSocket(zmq.XSUB)
		if err != nil {
			log.Fatalf("Error creating zmq subscriber: %s", err)
		}
		defer subscriber.Close()

		err = subscriber.Bind(fmt.Sprintf("tcp://*:%s", zeromqProxyPort))
		if err != nil {
			log.Fatalf("Error binding zmq subscriber: %s", err)
		}

		// subscribe the XSUB socket to all messages
		_, err = subscriber.SendBytes([]byte{0x01}, 0)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("Subscriber started. Waiting for messages...")
		// listen for messages forever
		// message order is as follows:
		// 1. topic name
		// 2. HOSTNAME:PORT
		// 3. databaseSize string
		// 4. diskSpace custom type
		// 5. ramUsage custom type
		// 6. systemStatus custom type
		for {
			msg, err := subscriber.RecvMessage(0)
			if err != nil {
				log.Println("Error receiving message:", err)
				// fmt.Println("Error receiving message:", err)
				// time.Sleep(time.Duration(5) * time.Second)
				continue
			}

			topic := string(msg[0])
			if topic != "datastore_heartbeats" {
				log.Println("Received message on unexpected topic:", topic)
				continue
			}

			hostnamePort := string(msg[1])
			fmt.Printf("Received message from %s\n", hostnamePort)
			hostname := strings.Split(hostnamePort, ":")[0]
			port, _ := strconv.Atoi(strings.Split(hostnamePort, ":")[1])
			var systemStatus SystemStatusHeartbeat
			err = json.Unmarshal([]byte(msg[2]), &systemStatus)
			if err != nil {
				fmt.Println("Error unmarshalling systemStatus:", err)
				// handle error properly
			}

			datastores.AddOrUpdateDatastore(Datastore{
				Hostname:     hostname,
				Port:         port,
				SystemStatus: systemStatus,
			})

		}
	}()

	//
	go PeriodicCheck(datastores, time.Duration(13)*time.Second)

	// get the port from the environment variable
	port := os.Getenv("PORT")

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	gen.RegisterMetadataServiceServer(grpcServer, metadataServiceServer)
	fmt.Println("Starting server on port", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}

	fmt.Println("Server started on port", port)
}

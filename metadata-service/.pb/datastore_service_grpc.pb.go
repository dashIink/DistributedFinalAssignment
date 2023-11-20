// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.21.12
// source: datastore_service.proto

package gen

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// DatastoreServiceClient is the client API for DatastoreService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type DatastoreServiceClient interface {
	// Store uploads data chunks to the storage system.
	Store(ctx context.Context, opts ...grpc.CallOption) (DatastoreService_StoreClient, error)
	// Retrieve downloads data chunks from the storage system based on a chunk identifier.
	Retrieve(ctx context.Context, in *RetrieveRequest, opts ...grpc.CallOption) (DatastoreService_RetrieveClient, error)
}

type datastoreServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewDatastoreServiceClient(cc grpc.ClientConnInterface) DatastoreServiceClient {
	return &datastoreServiceClient{cc}
}

func (c *datastoreServiceClient) Store(ctx context.Context, opts ...grpc.CallOption) (DatastoreService_StoreClient, error) {
	stream, err := c.cc.NewStream(ctx, &DatastoreService_ServiceDesc.Streams[0], "/datastore_service.DatastoreService/Store", opts...)
	if err != nil {
		return nil, err
	}
	x := &datastoreServiceStoreClient{stream}
	return x, nil
}

type DatastoreService_StoreClient interface {
	Send(*StoreRequest) error
	CloseAndRecv() (*StoreResponse, error)
	grpc.ClientStream
}

type datastoreServiceStoreClient struct {
	grpc.ClientStream
}

func (x *datastoreServiceStoreClient) Send(m *StoreRequest) error {
	return x.ClientStream.SendMsg(m)
}

func (x *datastoreServiceStoreClient) CloseAndRecv() (*StoreResponse, error) {
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	m := new(StoreResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *datastoreServiceClient) Retrieve(ctx context.Context, in *RetrieveRequest, opts ...grpc.CallOption) (DatastoreService_RetrieveClient, error) {
	stream, err := c.cc.NewStream(ctx, &DatastoreService_ServiceDesc.Streams[1], "/datastore_service.DatastoreService/Retrieve", opts...)
	if err != nil {
		return nil, err
	}
	x := &datastoreServiceRetrieveClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type DatastoreService_RetrieveClient interface {
	Recv() (*RetrieveResponse, error)
	grpc.ClientStream
}

type datastoreServiceRetrieveClient struct {
	grpc.ClientStream
}

func (x *datastoreServiceRetrieveClient) Recv() (*RetrieveResponse, error) {
	m := new(RetrieveResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

// DatastoreServiceServer is the server API for DatastoreService service.
// All implementations must embed UnimplementedDatastoreServiceServer
// for forward compatibility
type DatastoreServiceServer interface {
	// Store uploads data chunks to the storage system.
	Store(DatastoreService_StoreServer) error
	// Retrieve downloads data chunks from the storage system based on a chunk identifier.
	Retrieve(*RetrieveRequest, DatastoreService_RetrieveServer) error
	mustEmbedUnimplementedDatastoreServiceServer()
}

// UnimplementedDatastoreServiceServer must be embedded to have forward compatible implementations.
type UnimplementedDatastoreServiceServer struct {
}

func (UnimplementedDatastoreServiceServer) Store(DatastoreService_StoreServer) error {
	return status.Errorf(codes.Unimplemented, "method Store not implemented")
}
func (UnimplementedDatastoreServiceServer) Retrieve(*RetrieveRequest, DatastoreService_RetrieveServer) error {
	return status.Errorf(codes.Unimplemented, "method Retrieve not implemented")
}
func (UnimplementedDatastoreServiceServer) mustEmbedUnimplementedDatastoreServiceServer() {}

// UnsafeDatastoreServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to DatastoreServiceServer will
// result in compilation errors.
type UnsafeDatastoreServiceServer interface {
	mustEmbedUnimplementedDatastoreServiceServer()
}

func RegisterDatastoreServiceServer(s grpc.ServiceRegistrar, srv DatastoreServiceServer) {
	s.RegisterService(&DatastoreService_ServiceDesc, srv)
}

func _DatastoreService_Store_Handler(srv interface{}, stream grpc.ServerStream) error {
	return srv.(DatastoreServiceServer).Store(&datastoreServiceStoreServer{stream})
}

type DatastoreService_StoreServer interface {
	SendAndClose(*StoreResponse) error
	Recv() (*StoreRequest, error)
	grpc.ServerStream
}

type datastoreServiceStoreServer struct {
	grpc.ServerStream
}

func (x *datastoreServiceStoreServer) SendAndClose(m *StoreResponse) error {
	return x.ServerStream.SendMsg(m)
}

func (x *datastoreServiceStoreServer) Recv() (*StoreRequest, error) {
	m := new(StoreRequest)
	if err := x.ServerStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func _DatastoreService_Retrieve_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(RetrieveRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(DatastoreServiceServer).Retrieve(m, &datastoreServiceRetrieveServer{stream})
}

type DatastoreService_RetrieveServer interface {
	Send(*RetrieveResponse) error
	grpc.ServerStream
}

type datastoreServiceRetrieveServer struct {
	grpc.ServerStream
}

func (x *datastoreServiceRetrieveServer) Send(m *RetrieveResponse) error {
	return x.ServerStream.SendMsg(m)
}

// DatastoreService_ServiceDesc is the grpc.ServiceDesc for DatastoreService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var DatastoreService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "datastore_service.DatastoreService",
	HandlerType: (*DatastoreServiceServer)(nil),
	Methods:     []grpc.MethodDesc{},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "Store",
			Handler:       _DatastoreService_Store_Handler,
			ClientStreams: true,
		},
		{
			StreamName:    "Retrieve",
			Handler:       _DatastoreService_Retrieve_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "datastore_service.proto",
}

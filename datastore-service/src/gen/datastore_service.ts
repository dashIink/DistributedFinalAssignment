/* eslint-disable */
import {
  ChannelCredentials,
  Client,
  ClientReadableStream,
  ClientWritableStream,
  handleClientStreamingCall,
  handleServerStreamingCall,
  makeGenericClientConstructor,
  Metadata,
} from "@grpc/grpc-js";
import type { CallOptions, ClientOptions, ServiceError, UntypedServiceImplementation } from "@grpc/grpc-js";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "datastore_service";

/** StoreRequest represents a request to store a data chunk with associated metadata. */
export interface StoreRequest {
  /** The unique identifier for the file */
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  chunk: Uint8Array;
  hash: string;
  /** The length of the chunk in bytes */
  chunkSize: number;
  /** The sequence number of the chunk */
  chunkSequence: number;
}

/** StoreResponse is the response to a StoreRequest indicating the status of the operation. */
export interface StoreResponse {
  /** The status code (e.g., 0 for success) */
  code: number;
  /** A message associated with the status code */
  message: string;
  /** The unique identifier for the stored chunk */
  chunkId: string;
  /** The hash of the stored data for verification */
  hash: string;
  /** The sequence number of the chunk */
  chunkSequence: number;
}

/** RetrieveRequest is a request for retrieving a data chunk based on its unique identifier. */
export interface RetrieveRequest {
  /** The unique identifier for the data chunk */
  chunkId: string;
}

/** RetrieveResponse is the streamed response containing the requested data chunk. */
export interface RetrieveResponse {
  chunk: Uint8Array;
  hash: string;
  /** The length of the chunk in bytes */
  chunkSize: number;
  /** The sequence number of the chunk */
  chunkSequence: number;
}

function createBaseStoreRequest(): StoreRequest {
  return {
    fileId: "",
    fileName: "",
    fileSize: 0,
    fileType: "",
    chunk: new Uint8Array(0),
    hash: "",
    chunkSize: 0,
    chunkSequence: 0,
  };
}

export const StoreRequest = {
  encode(message: StoreRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fileId !== "") {
      writer.uint32(10).string(message.fileId);
    }
    if (message.fileName !== "") {
      writer.uint32(18).string(message.fileName);
    }
    if (message.fileSize !== 0) {
      writer.uint32(24).int64(message.fileSize);
    }
    if (message.fileType !== "") {
      writer.uint32(34).string(message.fileType);
    }
    if (message.chunk.length !== 0) {
      writer.uint32(42).bytes(message.chunk);
    }
    if (message.hash !== "") {
      writer.uint32(50).string(message.hash);
    }
    if (message.chunkSize !== 0) {
      writer.uint32(56).int64(message.chunkSize);
    }
    if (message.chunkSequence !== 0) {
      writer.uint32(64).uint64(message.chunkSequence);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StoreRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStoreRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.fileId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fileName = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.fileSize = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.fileType = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.chunk = reader.bytes();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.hash = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.chunkSize = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.chunkSequence = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StoreRequest {
    return {
      fileId: isSet(object.fileId) ? globalThis.String(object.fileId) : "",
      fileName: isSet(object.fileName) ? globalThis.String(object.fileName) : "",
      fileSize: isSet(object.fileSize) ? globalThis.Number(object.fileSize) : 0,
      fileType: isSet(object.fileType) ? globalThis.String(object.fileType) : "",
      chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array(0),
      hash: isSet(object.hash) ? globalThis.String(object.hash) : "",
      chunkSize: isSet(object.chunkSize) ? globalThis.Number(object.chunkSize) : 0,
      chunkSequence: isSet(object.chunkSequence) ? globalThis.Number(object.chunkSequence) : 0,
    };
  },

  toJSON(message: StoreRequest): unknown {
    const obj: any = {};
    if (message.fileId !== "") {
      obj.fileId = message.fileId;
    }
    if (message.fileName !== "") {
      obj.fileName = message.fileName;
    }
    if (message.fileSize !== 0) {
      obj.fileSize = Math.round(message.fileSize);
    }
    if (message.fileType !== "") {
      obj.fileType = message.fileType;
    }
    if (message.chunk.length !== 0) {
      obj.chunk = base64FromBytes(message.chunk);
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    if (message.chunkSize !== 0) {
      obj.chunkSize = Math.round(message.chunkSize);
    }
    if (message.chunkSequence !== 0) {
      obj.chunkSequence = Math.round(message.chunkSequence);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StoreRequest>, I>>(base?: I): StoreRequest {
    return StoreRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StoreRequest>, I>>(object: I): StoreRequest {
    const message = createBaseStoreRequest();
    message.fileId = object.fileId ?? "";
    message.fileName = object.fileName ?? "";
    message.fileSize = object.fileSize ?? 0;
    message.fileType = object.fileType ?? "";
    message.chunk = object.chunk ?? new Uint8Array(0);
    message.hash = object.hash ?? "";
    message.chunkSize = object.chunkSize ?? 0;
    message.chunkSequence = object.chunkSequence ?? 0;
    return message;
  },
};

function createBaseStoreResponse(): StoreResponse {
  return { code: 0, message: "", chunkId: "", hash: "", chunkSequence: 0 };
}

export const StoreResponse = {
  encode(message: StoreResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.chunkId !== "") {
      writer.uint32(26).string(message.chunkId);
    }
    if (message.hash !== "") {
      writer.uint32(34).string(message.hash);
    }
    if (message.chunkSequence !== 0) {
      writer.uint32(40).uint64(message.chunkSequence);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StoreResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStoreResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.chunkId = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.hash = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.chunkSequence = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StoreResponse {
    return {
      code: isSet(object.code) ? globalThis.Number(object.code) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      chunkId: isSet(object.chunkId) ? globalThis.String(object.chunkId) : "",
      hash: isSet(object.hash) ? globalThis.String(object.hash) : "",
      chunkSequence: isSet(object.chunkSequence) ? globalThis.Number(object.chunkSequence) : 0,
    };
  },

  toJSON(message: StoreResponse): unknown {
    const obj: any = {};
    if (message.code !== 0) {
      obj.code = Math.round(message.code);
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.chunkId !== "") {
      obj.chunkId = message.chunkId;
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    if (message.chunkSequence !== 0) {
      obj.chunkSequence = Math.round(message.chunkSequence);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StoreResponse>, I>>(base?: I): StoreResponse {
    return StoreResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StoreResponse>, I>>(object: I): StoreResponse {
    const message = createBaseStoreResponse();
    message.code = object.code ?? 0;
    message.message = object.message ?? "";
    message.chunkId = object.chunkId ?? "";
    message.hash = object.hash ?? "";
    message.chunkSequence = object.chunkSequence ?? 0;
    return message;
  },
};

function createBaseRetrieveRequest(): RetrieveRequest {
  return { chunkId: "" };
}

export const RetrieveRequest = {
  encode(message: RetrieveRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chunkId !== "") {
      writer.uint32(10).string(message.chunkId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetrieveRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetrieveRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chunkId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetrieveRequest {
    return { chunkId: isSet(object.chunkId) ? globalThis.String(object.chunkId) : "" };
  },

  toJSON(message: RetrieveRequest): unknown {
    const obj: any = {};
    if (message.chunkId !== "") {
      obj.chunkId = message.chunkId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RetrieveRequest>, I>>(base?: I): RetrieveRequest {
    return RetrieveRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RetrieveRequest>, I>>(object: I): RetrieveRequest {
    const message = createBaseRetrieveRequest();
    message.chunkId = object.chunkId ?? "";
    return message;
  },
};

function createBaseRetrieveResponse(): RetrieveResponse {
  return { chunk: new Uint8Array(0), hash: "", chunkSize: 0, chunkSequence: 0 };
}

export const RetrieveResponse = {
  encode(message: RetrieveResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chunk.length !== 0) {
      writer.uint32(10).bytes(message.chunk);
    }
    if (message.hash !== "") {
      writer.uint32(18).string(message.hash);
    }
    if (message.chunkSize !== 0) {
      writer.uint32(24).int64(message.chunkSize);
    }
    if (message.chunkSequence !== 0) {
      writer.uint32(32).uint64(message.chunkSequence);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetrieveResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRetrieveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chunk = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.hash = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.chunkSize = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.chunkSequence = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RetrieveResponse {
    return {
      chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array(0),
      hash: isSet(object.hash) ? globalThis.String(object.hash) : "",
      chunkSize: isSet(object.chunkSize) ? globalThis.Number(object.chunkSize) : 0,
      chunkSequence: isSet(object.chunkSequence) ? globalThis.Number(object.chunkSequence) : 0,
    };
  },

  toJSON(message: RetrieveResponse): unknown {
    const obj: any = {};
    if (message.chunk.length !== 0) {
      obj.chunk = base64FromBytes(message.chunk);
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    if (message.chunkSize !== 0) {
      obj.chunkSize = Math.round(message.chunkSize);
    }
    if (message.chunkSequence !== 0) {
      obj.chunkSequence = Math.round(message.chunkSequence);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RetrieveResponse>, I>>(base?: I): RetrieveResponse {
    return RetrieveResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RetrieveResponse>, I>>(object: I): RetrieveResponse {
    const message = createBaseRetrieveResponse();
    message.chunk = object.chunk ?? new Uint8Array(0);
    message.hash = object.hash ?? "";
    message.chunkSize = object.chunkSize ?? 0;
    message.chunkSequence = object.chunkSequence ?? 0;
    return message;
  },
};

/** DatastoreService is responsible for storing and retrieving raw binary data. */
export type DatastoreServiceService = typeof DatastoreServiceService;
export const DatastoreServiceService = {
  /** Store uploads data chunks to the storage system. */
  store: {
    path: "/datastore_service.DatastoreService/Store",
    requestStream: true,
    responseStream: false,
    requestSerialize: (value: StoreRequest) => Buffer.from(StoreRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StoreRequest.decode(value),
    responseSerialize: (value: StoreResponse) => Buffer.from(StoreResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => StoreResponse.decode(value),
  },
  /** Retrieve downloads data chunks from the storage system based on a chunk identifier. */
  retrieve: {
    path: "/datastore_service.DatastoreService/Retrieve",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: RetrieveRequest) => Buffer.from(RetrieveRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => RetrieveRequest.decode(value),
    responseSerialize: (value: RetrieveResponse) => Buffer.from(RetrieveResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => RetrieveResponse.decode(value),
  },
} as const;

export interface DatastoreServiceServer extends UntypedServiceImplementation {
  /** Store uploads data chunks to the storage system. */
  store: handleClientStreamingCall<StoreRequest, StoreResponse>;
  /** Retrieve downloads data chunks from the storage system based on a chunk identifier. */
  retrieve: handleServerStreamingCall<RetrieveRequest, RetrieveResponse>;
}

export interface DatastoreServiceClient extends Client {
  /** Store uploads data chunks to the storage system. */
  store(callback: (error: ServiceError | null, response: StoreResponse) => void): ClientWritableStream<StoreRequest>;
  store(
    metadata: Metadata,
    callback: (error: ServiceError | null, response: StoreResponse) => void,
  ): ClientWritableStream<StoreRequest>;
  store(
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: StoreResponse) => void,
  ): ClientWritableStream<StoreRequest>;
  store(
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: StoreResponse) => void,
  ): ClientWritableStream<StoreRequest>;
  /** Retrieve downloads data chunks from the storage system based on a chunk identifier. */
  retrieve(request: RetrieveRequest, options?: Partial<CallOptions>): ClientReadableStream<RetrieveResponse>;
  retrieve(
    request: RetrieveRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<RetrieveResponse>;
}

export const DatastoreServiceClient = makeGenericClientConstructor(
  DatastoreServiceService,
  "datastore_service.DatastoreService",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): DatastoreServiceClient;
  service: typeof DatastoreServiceService;
};

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

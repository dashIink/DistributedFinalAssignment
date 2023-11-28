/* eslint-disable */
import {
  ChannelCredentials,
  Client,
  ClientReadableStream,
  handleServerStreamingCall,
  makeGenericClientConstructor,
  Metadata,
} from "@grpc/grpc-js";
import type {
  CallOptions,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "metadata_service";

/** Custom enum for operation status. */
export enum OperationStatus {
  /** SUCCESS - Operation was successful. */
  SUCCESS = 0,
  /** ERROR - Operation encountered an error. */
  ERROR = 1,
  /** NOT_FOUND - The requested item was not found. */
  NOT_FOUND = 2,
  /** ALREADY_EXISTS - The item already exists. */
  ALREADY_EXISTS = 3,
  /** INVALID_ARGUMENT - The request contained an invalid argument. */
  INVALID_ARGUMENT = 4,
  UNRECOGNIZED = -1,
}

export function operationStatusFromJSON(object: any): OperationStatus {
  switch (object) {
    case 0:
    case "SUCCESS":
      return OperationStatus.SUCCESS;
    case 1:
    case "ERROR":
      return OperationStatus.ERROR;
    case 2:
    case "NOT_FOUND":
      return OperationStatus.NOT_FOUND;
    case 3:
    case "ALREADY_EXISTS":
      return OperationStatus.ALREADY_EXISTS;
    case 4:
    case "INVALID_ARGUMENT":
      return OperationStatus.INVALID_ARGUMENT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return OperationStatus.UNRECOGNIZED;
  }
}

export function operationStatusToJSON(object: OperationStatus): string {
  switch (object) {
    case OperationStatus.SUCCESS:
      return "SUCCESS";
    case OperationStatus.ERROR:
      return "ERROR";
    case OperationStatus.NOT_FOUND:
      return "NOT_FOUND";
    case OperationStatus.ALREADY_EXISTS:
      return "ALREADY_EXISTS";
    case OperationStatus.INVALID_ARGUMENT:
      return "INVALID_ARGUMENT";
    case OperationStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Custom Status is used to provide detailed error statuses in response messages. */
export interface Status {
  /** The numeric error code, which should follow an established error code convention. */
  code: number;
  /** A developer-facing error message, which should be descriptive and human-readable. */
  message: string;
  /** A list of strings providing additional error details. This field is optional. */
  details: string[];
}

/** Request to retrieve the top K datastores. */
export interface GetTopKDatastoresRequest {
  k: number;
}

/** Response with a list of datastore information. */
export interface GetTopKDatastoresResponse {
  datastores: DatastoreInfo[];
  /** Use standard Status message for error handling. */
  status: Status | undefined;
}

/** Detailed information about a datastore. */
export interface DatastoreInfo {
  /** A unique identifier for the datastore, such as a UUID. */
  datastoreId: string;
  /** The network hostname or IP address of the datastore. */
  hostname: string;
  /** The network port of the datastore. */
  port: number;
  /** Total capacity of the datastore. */
  capacity: number;
  /** Space used within the datastore. */
  used: number;
}

/** Request to get locations of chunks for a file. */
export interface GetFileChunkLocationsRequest {
  fileId: string;
  /** For pagination. */
  pageSize: number;
  /** For pagination. */
  pageToken: number;
}

/** Response with locations of a file chunk. */
export interface GetFileChunkLocationResponse {
  chunkId: string;
  chunkSequence: number;
  datastores: DatastoreInfo | undefined;
  chunkSize: number;
  chunkHash: string;
  /** Include status in each streamed response. */
  status: Status | undefined;
}

/** Request to register a file chunk. */
export interface RegisterFileChunkRequest {
  datastoreId: string;
  fileId: string;
  sequence: number;
  chunkSize: number;
  chunkHash: string;
  timestamp: number;
  fileChunkId: string;
}

/** Response for registering a file chunk. */
export interface RegisterFileChunkResponse {
  fileChunkId: string;
  status: Status | undefined;
}

function createBaseStatus(): Status {
  return { code: 0, message: "", details: [] };
}

export const Status = {
  encode(message: Status, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    for (const v of message.details) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Status {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatus();
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

          message.details.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Status {
    return {
      code: isSet(object.code) ? globalThis.Number(object.code) : 0,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      details: globalThis.Array.isArray(object?.details) ? object.details.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    if (message.code !== 0) {
      obj.code = Math.round(message.code);
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.details?.length) {
      obj.details = message.details;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Status>, I>>(base?: I): Status {
    return Status.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.code = object.code ?? 0;
    message.message = object.message ?? "";
    message.details = object.details?.map((e) => e) || [];
    return message;
  },
};

function createBaseGetTopKDatastoresRequest(): GetTopKDatastoresRequest {
  return { k: 0 };
}

export const GetTopKDatastoresRequest = {
  encode(message: GetTopKDatastoresRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.k !== 0) {
      writer.uint32(8).uint64(message.k);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetTopKDatastoresRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTopKDatastoresRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.k = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetTopKDatastoresRequest {
    return { k: isSet(object.k) ? globalThis.Number(object.k) : 0 };
  },

  toJSON(message: GetTopKDatastoresRequest): unknown {
    const obj: any = {};
    if (message.k !== 0) {
      obj.k = Math.round(message.k);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetTopKDatastoresRequest>, I>>(base?: I): GetTopKDatastoresRequest {
    return GetTopKDatastoresRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GetTopKDatastoresRequest>, I>>(object: I): GetTopKDatastoresRequest {
    const message = createBaseGetTopKDatastoresRequest();
    message.k = object.k ?? 0;
    return message;
  },
};

function createBaseGetTopKDatastoresResponse(): GetTopKDatastoresResponse {
  return { datastores: [], status: undefined };
}

export const GetTopKDatastoresResponse = {
  encode(message: GetTopKDatastoresResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.datastores) {
      DatastoreInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetTopKDatastoresResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTopKDatastoresResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.datastores.push(DatastoreInfo.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.status = Status.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetTopKDatastoresResponse {
    return {
      datastores: globalThis.Array.isArray(object?.datastores)
        ? object.datastores.map((e: any) => DatastoreInfo.fromJSON(e))
        : [],
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: GetTopKDatastoresResponse): unknown {
    const obj: any = {};
    if (message.datastores?.length) {
      obj.datastores = message.datastores.map((e) => DatastoreInfo.toJSON(e));
    }
    if (message.status !== undefined) {
      obj.status = Status.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetTopKDatastoresResponse>, I>>(base?: I): GetTopKDatastoresResponse {
    return GetTopKDatastoresResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GetTopKDatastoresResponse>, I>>(object: I): GetTopKDatastoresResponse {
    const message = createBaseGetTopKDatastoresResponse();
    message.datastores = object.datastores?.map((e) => DatastoreInfo.fromPartial(e)) || [];
    message.status = (object.status !== undefined && object.status !== null)
      ? Status.fromPartial(object.status)
      : undefined;
    return message;
  },
};

function createBaseDatastoreInfo(): DatastoreInfo {
  return { datastoreId: "", hostname: "", port: 0, capacity: 0, used: 0 };
}

export const DatastoreInfo = {
  encode(message: DatastoreInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.datastoreId !== "") {
      writer.uint32(10).string(message.datastoreId);
    }
    if (message.hostname !== "") {
      writer.uint32(18).string(message.hostname);
    }
    if (message.port !== 0) {
      writer.uint32(24).int32(message.port);
    }
    if (message.capacity !== 0) {
      writer.uint32(32).int64(message.capacity);
    }
    if (message.used !== 0) {
      writer.uint32(40).int64(message.used);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DatastoreInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDatastoreInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.datastoreId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.hostname = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.capacity = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.used = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DatastoreInfo {
    return {
      datastoreId: isSet(object.datastoreId) ? globalThis.String(object.datastoreId) : "",
      hostname: isSet(object.hostname) ? globalThis.String(object.hostname) : "",
      port: isSet(object.port) ? globalThis.Number(object.port) : 0,
      capacity: isSet(object.capacity) ? globalThis.Number(object.capacity) : 0,
      used: isSet(object.used) ? globalThis.Number(object.used) : 0,
    };
  },

  toJSON(message: DatastoreInfo): unknown {
    const obj: any = {};
    if (message.datastoreId !== "") {
      obj.datastoreId = message.datastoreId;
    }
    if (message.hostname !== "") {
      obj.hostname = message.hostname;
    }
    if (message.port !== 0) {
      obj.port = Math.round(message.port);
    }
    if (message.capacity !== 0) {
      obj.capacity = Math.round(message.capacity);
    }
    if (message.used !== 0) {
      obj.used = Math.round(message.used);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DatastoreInfo>, I>>(base?: I): DatastoreInfo {
    return DatastoreInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DatastoreInfo>, I>>(object: I): DatastoreInfo {
    const message = createBaseDatastoreInfo();
    message.datastoreId = object.datastoreId ?? "";
    message.hostname = object.hostname ?? "";
    message.port = object.port ?? 0;
    message.capacity = object.capacity ?? 0;
    message.used = object.used ?? 0;
    return message;
  },
};

function createBaseGetFileChunkLocationsRequest(): GetFileChunkLocationsRequest {
  return { fileId: "", pageSize: 0, pageToken: 0 };
}

export const GetFileChunkLocationsRequest = {
  encode(message: GetFileChunkLocationsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fileId !== "") {
      writer.uint32(10).string(message.fileId);
    }
    if (message.pageSize !== 0) {
      writer.uint32(16).uint64(message.pageSize);
    }
    if (message.pageToken !== 0) {
      writer.uint32(24).uint64(message.pageToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetFileChunkLocationsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFileChunkLocationsRequest();
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
          if (tag !== 16) {
            break;
          }

          message.pageSize = longToNumber(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.pageToken = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetFileChunkLocationsRequest {
    return {
      fileId: isSet(object.fileId) ? globalThis.String(object.fileId) : "",
      pageSize: isSet(object.pageSize) ? globalThis.Number(object.pageSize) : 0,
      pageToken: isSet(object.pageToken) ? globalThis.Number(object.pageToken) : 0,
    };
  },

  toJSON(message: GetFileChunkLocationsRequest): unknown {
    const obj: any = {};
    if (message.fileId !== "") {
      obj.fileId = message.fileId;
    }
    if (message.pageSize !== 0) {
      obj.pageSize = Math.round(message.pageSize);
    }
    if (message.pageToken !== 0) {
      obj.pageToken = Math.round(message.pageToken);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetFileChunkLocationsRequest>, I>>(base?: I): GetFileChunkLocationsRequest {
    return GetFileChunkLocationsRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GetFileChunkLocationsRequest>, I>>(object: I): GetFileChunkLocationsRequest {
    const message = createBaseGetFileChunkLocationsRequest();
    message.fileId = object.fileId ?? "";
    message.pageSize = object.pageSize ?? 0;
    message.pageToken = object.pageToken ?? 0;
    return message;
  },
};

function createBaseGetFileChunkLocationResponse(): GetFileChunkLocationResponse {
  return { chunkId: "", chunkSequence: 0, datastores: undefined, chunkSize: 0, chunkHash: "", status: undefined };
}

export const GetFileChunkLocationResponse = {
  encode(message: GetFileChunkLocationResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chunkId !== "") {
      writer.uint32(10).string(message.chunkId);
    }
    if (message.chunkSequence !== 0) {
      writer.uint32(16).uint64(message.chunkSequence);
    }
    if (message.datastores !== undefined) {
      DatastoreInfo.encode(message.datastores, writer.uint32(26).fork()).ldelim();
    }
    if (message.chunkSize !== 0) {
      writer.uint32(32).int64(message.chunkSize);
    }
    if (message.chunkHash !== "") {
      writer.uint32(42).string(message.chunkHash);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetFileChunkLocationResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFileChunkLocationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.chunkId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.chunkSequence = longToNumber(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.datastores = DatastoreInfo.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.chunkSize = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.chunkHash = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.status = Status.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetFileChunkLocationResponse {
    return {
      chunkId: isSet(object.chunkId) ? globalThis.String(object.chunkId) : "",
      chunkSequence: isSet(object.chunkSequence) ? globalThis.Number(object.chunkSequence) : 0,
      datastores: isSet(object.datastores) ? DatastoreInfo.fromJSON(object.datastores) : undefined,
      chunkSize: isSet(object.chunkSize) ? globalThis.Number(object.chunkSize) : 0,
      chunkHash: isSet(object.chunkHash) ? globalThis.String(object.chunkHash) : "",
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: GetFileChunkLocationResponse): unknown {
    const obj: any = {};
    if (message.chunkId !== "") {
      obj.chunkId = message.chunkId;
    }
    if (message.chunkSequence !== 0) {
      obj.chunkSequence = Math.round(message.chunkSequence);
    }
    if (message.datastores !== undefined) {
      obj.datastores = DatastoreInfo.toJSON(message.datastores);
    }
    if (message.chunkSize !== 0) {
      obj.chunkSize = Math.round(message.chunkSize);
    }
    if (message.chunkHash !== "") {
      obj.chunkHash = message.chunkHash;
    }
    if (message.status !== undefined) {
      obj.status = Status.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetFileChunkLocationResponse>, I>>(base?: I): GetFileChunkLocationResponse {
    return GetFileChunkLocationResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<GetFileChunkLocationResponse>, I>>(object: I): GetFileChunkLocationResponse {
    const message = createBaseGetFileChunkLocationResponse();
    message.chunkId = object.chunkId ?? "";
    message.chunkSequence = object.chunkSequence ?? 0;
    message.datastores = (object.datastores !== undefined && object.datastores !== null)
      ? DatastoreInfo.fromPartial(object.datastores)
      : undefined;
    message.chunkSize = object.chunkSize ?? 0;
    message.chunkHash = object.chunkHash ?? "";
    message.status = (object.status !== undefined && object.status !== null)
      ? Status.fromPartial(object.status)
      : undefined;
    return message;
  },
};

function createBaseRegisterFileChunkRequest(): RegisterFileChunkRequest {
  return { datastoreId: "", fileId: "", sequence: 0, chunkSize: 0, chunkHash: "", timestamp: 0, fileChunkId: "" };
}

export const RegisterFileChunkRequest = {
  encode(message: RegisterFileChunkRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.datastoreId !== "") {
      writer.uint32(10).string(message.datastoreId);
    }
    if (message.fileId !== "") {
      writer.uint32(18).string(message.fileId);
    }
    if (message.sequence !== 0) {
      writer.uint32(24).uint64(message.sequence);
    }
    if (message.chunkSize !== 0) {
      writer.uint32(32).int64(message.chunkSize);
    }
    if (message.chunkHash !== "") {
      writer.uint32(42).string(message.chunkHash);
    }
    if (message.timestamp !== 0) {
      writer.uint32(48).int64(message.timestamp);
    }
    if (message.fileChunkId !== "") {
      writer.uint32(58).string(message.fileChunkId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterFileChunkRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisterFileChunkRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.datastoreId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.fileId = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.sequence = longToNumber(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.chunkSize = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.chunkHash = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.timestamp = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.fileChunkId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RegisterFileChunkRequest {
    return {
      datastoreId: isSet(object.datastoreId) ? globalThis.String(object.datastoreId) : "",
      fileId: isSet(object.fileId) ? globalThis.String(object.fileId) : "",
      sequence: isSet(object.sequence) ? globalThis.Number(object.sequence) : 0,
      chunkSize: isSet(object.chunkSize) ? globalThis.Number(object.chunkSize) : 0,
      chunkHash: isSet(object.chunkHash) ? globalThis.String(object.chunkHash) : "",
      timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      fileChunkId: isSet(object.fileChunkId) ? globalThis.String(object.fileChunkId) : "",
    };
  },

  toJSON(message: RegisterFileChunkRequest): unknown {
    const obj: any = {};
    if (message.datastoreId !== "") {
      obj.datastoreId = message.datastoreId;
    }
    if (message.fileId !== "") {
      obj.fileId = message.fileId;
    }
    if (message.sequence !== 0) {
      obj.sequence = Math.round(message.sequence);
    }
    if (message.chunkSize !== 0) {
      obj.chunkSize = Math.round(message.chunkSize);
    }
    if (message.chunkHash !== "") {
      obj.chunkHash = message.chunkHash;
    }
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp);
    }
    if (message.fileChunkId !== "") {
      obj.fileChunkId = message.fileChunkId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RegisterFileChunkRequest>, I>>(base?: I): RegisterFileChunkRequest {
    return RegisterFileChunkRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RegisterFileChunkRequest>, I>>(object: I): RegisterFileChunkRequest {
    const message = createBaseRegisterFileChunkRequest();
    message.datastoreId = object.datastoreId ?? "";
    message.fileId = object.fileId ?? "";
    message.sequence = object.sequence ?? 0;
    message.chunkSize = object.chunkSize ?? 0;
    message.chunkHash = object.chunkHash ?? "";
    message.timestamp = object.timestamp ?? 0;
    message.fileChunkId = object.fileChunkId ?? "";
    return message;
  },
};

function createBaseRegisterFileChunkResponse(): RegisterFileChunkResponse {
  return { fileChunkId: "", status: undefined };
}

export const RegisterFileChunkResponse = {
  encode(message: RegisterFileChunkResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fileChunkId !== "") {
      writer.uint32(10).string(message.fileChunkId);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterFileChunkResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisterFileChunkResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.fileChunkId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.status = Status.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): RegisterFileChunkResponse {
    return {
      fileChunkId: isSet(object.fileChunkId) ? globalThis.String(object.fileChunkId) : "",
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: RegisterFileChunkResponse): unknown {
    const obj: any = {};
    if (message.fileChunkId !== "") {
      obj.fileChunkId = message.fileChunkId;
    }
    if (message.status !== undefined) {
      obj.status = Status.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RegisterFileChunkResponse>, I>>(base?: I): RegisterFileChunkResponse {
    return RegisterFileChunkResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<RegisterFileChunkResponse>, I>>(object: I): RegisterFileChunkResponse {
    const message = createBaseRegisterFileChunkResponse();
    message.fileChunkId = object.fileChunkId ?? "";
    message.status = (object.status !== undefined && object.status !== null)
      ? Status.fromPartial(object.status)
      : undefined;
    return message;
  },
};

/** MetadataService provides metadata management for the distributed storage system. */
export type MetadataServiceService = typeof MetadataServiceService;
export const MetadataServiceService = {
  getTopKDatastores: {
    path: "/metadata_service.MetadataService/GetTopKDatastores",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetTopKDatastoresRequest) => Buffer.from(GetTopKDatastoresRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetTopKDatastoresRequest.decode(value),
    responseSerialize: (value: GetTopKDatastoresResponse) =>
      Buffer.from(GetTopKDatastoresResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GetTopKDatastoresResponse.decode(value),
  },
  getFileChunkLocations: {
    path: "/metadata_service.MetadataService/GetFileChunkLocations",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: GetFileChunkLocationsRequest) =>
      Buffer.from(GetFileChunkLocationsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetFileChunkLocationsRequest.decode(value),
    responseSerialize: (value: GetFileChunkLocationResponse) =>
      Buffer.from(GetFileChunkLocationResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GetFileChunkLocationResponse.decode(value),
  },
  registerFileChunk: {
    path: "/metadata_service.MetadataService/RegisterFileChunk",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: RegisterFileChunkRequest) => Buffer.from(RegisterFileChunkRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => RegisterFileChunkRequest.decode(value),
    responseSerialize: (value: RegisterFileChunkResponse) =>
      Buffer.from(RegisterFileChunkResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => RegisterFileChunkResponse.decode(value),
  },
} as const;

export interface MetadataServiceServer extends UntypedServiceImplementation {
  getTopKDatastores: handleUnaryCall<GetTopKDatastoresRequest, GetTopKDatastoresResponse>;
  getFileChunkLocations: handleServerStreamingCall<GetFileChunkLocationsRequest, GetFileChunkLocationResponse>;
  registerFileChunk: handleUnaryCall<RegisterFileChunkRequest, RegisterFileChunkResponse>;
}

export interface MetadataServiceClient extends Client {
  getTopKDatastores(
    request: GetTopKDatastoresRequest,
    callback: (error: ServiceError | null, response: GetTopKDatastoresResponse) => void,
  ): ClientUnaryCall;
  getTopKDatastores(
    request: GetTopKDatastoresRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GetTopKDatastoresResponse) => void,
  ): ClientUnaryCall;
  getTopKDatastores(
    request: GetTopKDatastoresRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GetTopKDatastoresResponse) => void,
  ): ClientUnaryCall;
  getFileChunkLocations(
    request: GetFileChunkLocationsRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<GetFileChunkLocationResponse>;
  getFileChunkLocations(
    request: GetFileChunkLocationsRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<GetFileChunkLocationResponse>;
  registerFileChunk(
    request: RegisterFileChunkRequest,
    callback: (error: ServiceError | null, response: RegisterFileChunkResponse) => void,
  ): ClientUnaryCall;
  registerFileChunk(
    request: RegisterFileChunkRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: RegisterFileChunkResponse) => void,
  ): ClientUnaryCall;
  registerFileChunk(
    request: RegisterFileChunkRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: RegisterFileChunkResponse) => void,
  ): ClientUnaryCall;
}

export const MetadataServiceClient = makeGenericClientConstructor(
  MetadataServiceService,
  "metadata_service.MetadataService",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): MetadataServiceClient;
  service: typeof MetadataServiceService;
};

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

import { ServerWritableStream, sendUnaryData, status } from '@grpc/grpc-js';

import * as crypto from 'crypto';

import { ServerReadableStream, } from '@grpc/grpc-js';

import { DatastoreServiceServer, RetrieveRequest, RetrieveResponse, StoreRequest, StoreResponse } from './gen/datastore_service';

import { storeChunk, retrieveChunk } from './filechunk';

import metadataClient from './metadata_service_client';
import { HOSTNAME, PORT } from './config';

function checkStoreRequestValues(request: StoreRequest): boolean {
    return Object.entries(request).every(([_, value]) => {
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'string' && value.length === 0) {
            return false;
        }
        if (typeof value === 'number' && isNaN(value)) {
            return false;
        }
        return true;
    });
}

function getDatastoreServer(): DatastoreServiceServer {
    function store(
        call: ServerReadableStream<StoreRequest, StoreResponse>, 
        callback: sendUnaryData<StoreResponse>
    ): void {
        // let storeOperationWasSuccessful = false;
        let data: Uint8Array[] = [];
        let lastChunk: StoreRequest | null = null;
        call.on('data', (request: StoreRequest) => {
            data.push(request.chunk);
            lastChunk = request;
        });
        call.on('end', () => {
            if (!lastChunk || !checkStoreRequestValues(lastChunk)) {
                callback({ code: status.INTERNAL, message: 'Last chunk not found or invalid' });
                return;
            }

            // combine the chunks into a single Uint8Array
            let combined = new Uint8Array(data.reduce((acc, chunk) => acc + chunk.length, 0));

            let length = 0;

            for (let chunk of data) {
                combined.set(chunk, length);
                length += chunk.length;
            }

            let buffer = Buffer.from(combined);

            storeChunk({
                data: buffer,
                metadata: {
                    fileId: lastChunk.fileId,
                    filename: lastChunk.fileName,
                    fileSize: lastChunk.fileSize,
                    fileType: lastChunk.fileType,
                    hash: lastChunk.hash,
                    chunkSize: lastChunk.chunkSize,
                    chunkSequence: lastChunk.chunkSequence
                }
            }).then((response) => {
                if (!lastChunk) {
                    callback({ code: status.INTERNAL, message: 'Last chunk not found' });
                    return;
                }

                const hash_buffer = crypto.createHash('sha256').update(buffer).digest('hex');
                if (hash_buffer !== lastChunk.hash) {
                    callback({ code: status.INTERNAL, message: 'Hashes do not match' });
                    return;
                }
                const cliResp: StoreResponse = {
                    chunkId: response.chunkId,
                    hash: hash_buffer,
                    code: status.OK,
                    message: 'Chunk stored',
                    chunkSequence: response.chunkSequence
                };
                metadataClient.registerFileChunk({
                    fileId: lastChunk!.fileId,
                    sequence: response.chunkSequence,
                    fileChunkId: response.chunkId,
                    datastoreId: `${HOSTNAME}:${PORT}`,
                    chunkSize: lastChunk!.chunkSize,
                    chunkHash: lastChunk!.hash,
                   timestamp: Date.now(), 
                }, (err, registerFileChunkResponse) => {
                    registerFileChunkResponse; // TODO: do something with this
                    if (err) {
                        callback({ code: status.ABORTED, message: err.message, details: "Error registering file chunk" });
                    } else {
                        callback(null, cliResp);
                    }
                });
                // storeOperationWasSuccessful = true;
            }).catch((err) => {
                callback({ code: status.INTERNAL, message: err.message });
                // storeOperationWasSuccessful = false;
            });
        });
    }

    function retrieve(
        call: ServerWritableStream<RetrieveRequest, RetrieveResponse>
    ): void {
        const request: RetrieveRequest = call.request;
        const { chunkId } = request;

        retrieveChunk({
            chunkId
        }).then((retrieveChunkResponse) => {
            const { chunk, chunkSize, hash, chunkSequence } = retrieveChunkResponse;
            // chunk can be large, so we need to split it into even smaller chunks
            // and stream it to the client
            const chunkBuffer = Buffer.from(chunk);
            const chunkBufferLength = chunkBuffer.length;
            const chunkBufferMaxSize = 1024 * 1024; // 1MB
            let offset = 0;
            while (offset < chunkBufferLength) {
                const end = Math.min(offset + chunkBufferMaxSize, chunkBufferLength);
                const smallerChunk = chunkBuffer.subarray(offset, end);
                const chunkResponse: RetrieveResponse = {
                    chunk: smallerChunk,
                    chunkSize,
                    hash,
                    chunkSequence
                };
                call.write(chunkResponse);
                offset = end;
            }
            call.end();
        }).catch((err) => {
            call.emit('error', { code: status.INTERNAL, message: err.message });
        });
    }

    return {
        store,
        retrieve
    };
}

export default getDatastoreServer;
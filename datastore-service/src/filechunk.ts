import db, { CHUNKS_TABLE_COLUMNS } from "./database";

import { v4 as uuidv4 } from 'uuid';

export enum ChunkStatus {
    STORED = 'stored',
    FAILED = 'failed'
}

export type CreateChunkRequest = {
    data: Buffer;
    metadata: {
        fileId: string;
        filename: string;
        fileSize: number;
        fileType: string;
        hash: string;
        chunkSize: number;
        chunkSequence: number;
    }
};

export type CreateChunkResponse = {
    chunkId: string;
    status: ChunkStatus;
    chunkSequence: number;
};

export async function storeChunk(req: CreateChunkRequest): Promise<CreateChunkResponse> {

    const uid = uuidv4();
    const { data, metadata } = req;
    const { fileId, filename, fileSize, fileType, hash, chunkSize, chunkSequence } = metadata;

    const query = `INSERT INTO chunks (fileId, filename, fileSize, fileType, hash, chunkSize, chunkSequence, chunkId, chunk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [fileId, filename, fileSize, fileType, hash, chunkSize, chunkSequence, uid, data];

    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                console.error('Error storing chunk', err);
                reject(err);
            } else {
                console.log(`Stored chunk ${uid} for file ${fileId} with sequence ${chunkSequence}`);

                resolve({
                    chunkId: uid,
                    status: ChunkStatus.STORED,
                    chunkSequence: chunkSequence
                });
            }
        });
    });
}

export type RetrieveChunkRequest = {
    chunkId: string;
};

export type RetrieveChunkResponse = {
    chunk: Buffer;
    chunkSize: number;
    hash: string;
    chunkSequence: number;
    fileName: string;
    fileType: string;
};

export async function retrieveChunk(req: RetrieveChunkRequest): Promise<RetrieveChunkResponse> {
    const { chunkId } = req;

    const query = `SELECT chunk, chunkSize, hash, chunkSequence, filename, fileType FROM chunks WHERE chunkId = ?`;
    const params = [chunkId];
    
    return new Promise((resolve, reject) => {
        db.get<CHUNKS_TABLE_COLUMNS>(query, params, (err, row) => {
            if (err) {
                console.error('Error retrieving chunk', err);
                reject(err);
            } else {
                if (row) {
                    const { chunk, chunkSize, hash, chunkSequence, filename, fileType } = row;
                    resolve({
                        chunk,
                        chunkSize,
                        hash,
                        chunkSequence,
                        fileName: filename,
                        fileType: fileType
                    });
                } else {
                    reject(new Error('Chunk not found'));
                }
            }
        });
    });
}
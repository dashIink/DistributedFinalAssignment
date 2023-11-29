import path from "path";

import sqlite3 from "sqlite3";

import { DB_FILE_NAME } from "./config";

export const dbFilePath: string = path.join(__dirname, "..", DB_FILE_NAME);

const db: sqlite3.Database = new sqlite3.Database(dbFilePath, (err: Error | null) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to database");
    initializeDb();
  }
});


export type CHUNKS_TABLE_COLUMNS = {
    fileId: string;
    filename: string;
    chunkId: string;
    chunkSize: number;
    hash: string;
    fileType: string;
    fileSize: number;
    chunk: Buffer;
    chunkSequence: number;
    createdAt: string;
};

function createTables() {
    console.log("Creating tables");
    // chunks table filename, chunkId ( uuid, unique ), chunkSize, hash, fileType, chunk (actual data), chunkSequence, createdAt
    for (const table of ["chunks"]) {
        db.run(`CREATE TABLE IF NOT EXISTS ${table} (
            fileId TEXT NOT NULL,
            filename TEXT NOT NULL,
            chunkId TEXT NOT NULL UNIQUE PRIMARY KEY,
            chunkSize INTEGER NOT NULL,
            hash TEXT NOT NULL,
            fileType TEXT NOT NULL,
            fileSize INTEGER NOT NULL,
            chunk BLOB NOT NULL,
            chunkSequence INTEGER NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`, (err: Error | null) => {
            if (err) {
                console.error(`Could not create table ${table}`, err);
            } else {
                console.log(`Created table ${table}`);
            }
        });
    }

}

export function initializeDb() {
    createTables();
}

console.log("DB_FILE_NAME", DB_FILE_NAME);
export default db;

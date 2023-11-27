import os from "os";
import * as diskusage from 'diskusage';
// import { exec } from 'child_process';
import { stat } from 'fs';

import { promisify } from 'util';
// const execAsync = promisify(exec);
const statAsync = promisify(stat);

/**
 *  Format a number of bytes in a human-readable format
 * 
 * @param bytes  The number of bytes to format
 * @param decimals The number of decimals to use
 * @returns  A string representation of the number of bytes in a human-readable format. Example: 1024 -> 1 KB
 */
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export type RamUsageStatus = {
    totalRam: number;
    freeRam: number;
};

// Get the total and free RAM on the server
export async function getRamUsage(): Promise<RamUsageStatus> {
  const totalRam = os.totalmem();
  const freeRam = os.freemem();
  return {
    totalRam,
    freeRam
  };
}

// Get the size of the SQLite database file
export async function getDatabaseSize(filePath: string): Promise<number> {
  try {
    const stats = await statAsync(filePath);
    return stats.size; // size in bytes
  } catch (err) {
    console.error('Could not get database file size', err);
    throw err;
  }
}

export type DiskSpaceStatus = {
    freeSpace: number;
    totalSpace: number;
    availableSpace: number;
};

// Get the available disk space on the server
export async function getDiskSpace(): Promise<DiskSpaceStatus> {
  try {
    const { free, total, available } = await diskusage.check('/');
    return {
      freeSpace: free,
      totalSpace: total,
      availableSpace: available
    };
  } catch (err) {
    console.error('Could not get disk space', err);
    throw err;
  }
}


export type SystemStatus = {
    totalRam: string;
    freeRam: string;
    databaseSize: string;
    freeSpace: string;
    totalSpace: string;
    availableSpace: string;
};

export async function getSystemStatus({ dbFilePath }: { dbFilePath: string }): Promise<SystemStatus> {
    const { totalRam, freeRam } = await getRamUsage();
    const databaseSize = await getDatabaseSize(dbFilePath);
    const { freeSpace, totalSpace, availableSpace } = await getDiskSpace();
    return {
        totalRam: formatBytes(totalRam),
        freeRam: formatBytes(freeRam),
        databaseSize: formatBytes(databaseSize),
        freeSpace: formatBytes(freeSpace),
        totalSpace: formatBytes(totalSpace),
        availableSpace: formatBytes(availableSpace)
    };
}

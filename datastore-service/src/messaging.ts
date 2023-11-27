import * as zmq from 'zeromq';

import { DiskSpaceStatus, RamUsageStatus, SystemStatus, getDatabaseSize, getDiskSpace, getRamUsage, getSystemStatus } from "./utils";

import { dbFilePath } from "./database";

import { ZEROMQ_PROXY_HOSTNAME, ZEROMQ_PROXY_PORT, HOSTNAME, PORT } from "./config";

/**
 * 
 * Start the publisher that sends data to the monitoring infrastructure
 * 
 * @param interval The interval in seconds at which to publish the data
 * 
 */
async function startPublisher(interval: number): Promise<NodeJS.Timeout> {
    try {
        console.log('Creating ZeroMQ publisher socket');
        const sock = new zmq.Publisher;
        console.log(`Binding to tcp://${ZEROMQ_PROXY_HOSTNAME}:${ZEROMQ_PROXY_PORT}`);
        // Connect to the messaging infrastructure
        sock.connect(`tcp://${ZEROMQ_PROXY_HOSTNAME}:${ZEROMQ_PROXY_PORT}`);
        console.log(`Publisher connected to tcp://${ZEROMQ_PROXY_HOSTNAME}:${ZEROMQ_PROXY_PORT}`);

        const intrvl = setInterval(async () => {

            const [databaseSize, diskSpace, ramUsage, systemStatus]: [number, DiskSpaceStatus, RamUsageStatus, SystemStatus] = await Promise.all([
                getDatabaseSize(dbFilePath),
                getDiskSpace(),
                getRamUsage(),
                getSystemStatus({ dbFilePath })
            ]);


            // TODO: Send the following data to the monitoring infrastructure:
            databaseSize;
            diskSpace;
            ramUsage;

            console.log(`Sending heartbeat from ${HOSTNAME}:${PORT}`);
            console.log(systemStatus)

            // Send the message
            await sock.send(['datastore_heartbeats',
                HOSTNAME + ':' + PORT,
                // databaseSize.toString(),
                // JSON.stringify(diskSpace),
                // JSON.stringify(ramUsage),
                JSON.stringify(systemStatus)]);

        }, interval * 1000);
        return intrvl;
    } catch (err) {
        console.log('Could not connect to messaging infrastructure', err);
        process.exit(1);
    }
}

export default startPublisher;


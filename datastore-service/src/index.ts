console.log("Starting datastore service");

import { Deadline as _, Deadline, Server, ServerCredentials } from "@grpc/grpc-js";
import getDatastoreServer from "./server";
import { DatastoreServiceService } from "./gen/datastore_service";

import startPublisher from "./messaging";

import { PORT as port } from "./config";
import metadataClient from "./metadata_service_client";

const PUBLISH_INTERVAL = Number(process.env.PUBLISH_INTERVAL) || 10;


const server = new Server();

server.addService(DatastoreServiceService, getDatastoreServer());

console.log(`Create gRPC server on port ${port}`);
server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (err) => {
    if (err) {
        console.error("Error starting server", err);
    } else {
        console.log(`Server started on port ${port}`);

        setTimeout(() => {
            const deadline: Deadline = new Date(Date.now() + 10000);
            metadataClient.waitForReady(deadline, (err) => {
                if (err) {
                    console.error('Error connecting to metadata service', err);
                    console.error(err.stack);
                    console.error(err.message);
                    console.error(err.cause);
                } else {
                    console.log('Connected to METADATA Service');
                }
            });
        }, 10000);

        (async () => {
            try {
                const intrvl = await startPublisher(PUBLISH_INTERVAL);

                console.log(`Publisher will publish data every ${PUBLISH_INTERVAL} seconds`);
                console.log(`setInterval returned ${intrvl}`);
            } catch (err) {
                console.log('Could not connect to messaging infrastructure', err);
                process.exit(1);
            }
        })();

        server.start();
    }
});

import { credentials } from '@grpc/grpc-js';
import { 
    MetadataServiceClient,
} from './gen/metadata_service';

import { METADATA_SERVICE_HOSTNAME, METADATA_SERVICE_PORT } from './config';

const METADATA_SERVICE_URL = `${METADATA_SERVICE_HOSTNAME}:${METADATA_SERVICE_PORT}`;

const metadataClient = new MetadataServiceClient(METADATA_SERVICE_URL, credentials.createInsecure(), undefined);
// {
//     'grpc.keepalive_time_ms': 5000,
//     'grpc.keepalive_timeout_ms': 5000,
//     'grpc.keepalive_permit_without_calls': 1
// });

export default metadataClient;
const ZEROMQ_PROXY_HOSTNAME = process.env.ZEROMQ_PROXY_HOSTNAME;
if (!ZEROMQ_PROXY_HOSTNAME) {
    throw new Error("ZEROMQ_PROXY_HOSTNAME environment variable not set");
}
const ZEROMQ_PROXY_PORT = process.env.ZEROMQ_PROXY_PORT;
if (!ZEROMQ_PROXY_PORT) {
    throw new Error("ZEROMQ_PROXY_PORT environment variable not set");
}

const HOSTNAME = process.env.HOSTNAME;
if (!HOSTNAME) {
    throw new Error("HOSTNAME environment variable not set");
}
const PORT = process.env.PORT;
if (!PORT) {
    throw new Error("PORT environment variable not set");
}

const DB_FILE_NAME: string = process.env.NODE_ENV === "test" ? "test.sqlite" : (process.env.DB_FILE_NAME || "db.sqlite");

const METADATA_SERVICE_HOSTNAME = process.env.METADATA_SERVICE_HOSTNAME;
if (!METADATA_SERVICE_HOSTNAME) {
    throw new Error("METADATA_SERVICE_HOSTNAME environment variable not set");
}
const METADATA_SERVICE_PORT = process.env.METADATA_SERVICE_PORT;
if (!METADATA_SERVICE_PORT) {
    throw new Error("METADATA_SERVICE_PORT environment variable not set");
}

export {
    HOSTNAME,
    PORT,
    ZEROMQ_PROXY_HOSTNAME,
    ZEROMQ_PROXY_PORT,
    DB_FILE_NAME,
    METADATA_SERVICE_HOSTNAME,
    METADATA_SERVICE_PORT
}
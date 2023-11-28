import os
import logging

logger = logging.getLogger(__name__)

upload_server_url = "http://127.0.0.1:6001"
download_server_url = "http://127.0.0.1:6002"

num_segments = 13
metadata_server_url = "http://127.0.0.1:4000"
UPLOAD_FOLDER = 'files_inbound'
DOWNLOAD_FOLDER = 'file_segments'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

# env variables
server_port = int(os.environ.get("SERVER_PORT", 6000))

metadata_service_host = os.environ.get("METADATA_SERVICE_HOST")
if metadata_service_host == None:
    logger.error("METADATA_SERVICE_HOST env variable not set")
    exit(1)
metadata_service_port = os.environ.get("METADATA_SERVICE_PORT")
if metadata_service_port == None:
    logger.error("METADATA_SERVICE_PORT env variable not set")
    exit(1)
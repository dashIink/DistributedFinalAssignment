import os

upload_server_url = "http://127.0.0.1:6001"
download_server_url = "http://127.0.0.1:6002"

num_segments = 3
metadata_server_url = "http://127.0.0.1:4000"
UPLOAD_FOLDER = 'files_inbound'
DOWNLOAD_FOLDER = 'file_segments'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)
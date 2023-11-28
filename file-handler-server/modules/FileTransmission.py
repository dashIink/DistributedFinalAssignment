from io import BufferedReader
import os
from typing import Iterator, Optional
import requests
import Config
import grpc

from modules.Errors import DatastoreServiceError
from gen.datastore_service_pb2_grpc import DatastoreServiceStub
from gen.datastore_service_pb2 import StoreRequest, StoreResponse

from modules.Utils import hash_file

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

#  iterator 
def store_request_iterator(
    file: BufferedReader,
    file_id: str, 
    file_name: str,
    file_size: int,
    file_type: str,
    chunk_hash: str,
    chunk_sequence: int,
) -> Iterator[StoreRequest]:
    while True:
        chunk = file.read(1024)
        if not chunk:
            break
        yield StoreRequest(
            file_id=file_id,
            file_name=file_name,
            file_size=file_size,
            file_type=file_type,
            chunk=chunk,
            chunk_size=len(chunk),
            chunk_sequence=chunk_sequence,
            hash=chunk_hash
        )

def send_segment_to_ip(
    file_id: str, 
    file_name: str,
    file_size: int,
    file_type: str,
    chunk_sequence: int,
    segment_name: str, 
    destination_ip: str
) -> Optional[DatastoreServiceError]:
    with open(os.path.join(Config.DOWNLOAD_FOLDER, segment_name), 'rb') as f:
        with grpc.insecure_channel(destination_ip) as channel:
            try:
                grpc.channel_ready_future(channel).result(timeout=10)
            except grpc.FutureTimeoutError:
                return DatastoreServiceError("Connection timeout")
            else:
                stub = DatastoreServiceStub(channel)
                segment_hash = hash_file(f)
                request_iterator = store_request_iterator(
                    file=f,
                    file_id=file_id,
                    file_name=file_name,
                    file_size=file_size,
                    file_type=file_type,
                    chunk_sequence=chunk_sequence,
                    chunk_hash=segment_hash
                )
                response: StoreResponse = stub.Store(request_iterator)
                logger.debug(f"code={response.code}")
                logger.debug(f"chunk_id={response.chunk_id}")
                logger.debug(f"hash={response.hash}")
                logger.debug(f"chunk_sequence={response.chunk_sequence}")
                logger.debug(f"message={response.message}")

                    


def receive_segment_from_ip(file_id, source_ip):
    segment_filename = f"{file_id}"
    response = requests.get(f"http://{source_ip}/download/{file_id}")
    with open(os.path.join(Config.DOWNLOAD_FOLDER, segment_filename), 'wb') as f:
        f.write(response.content)

from io import BufferedReader
import os
import sys
from typing import Iterator, List, Optional, Tuple
import requests
import Config
import grpc

from modules.Errors import DatastoreServiceError
from gen.datastore_service_pb2_grpc import DatastoreServiceStub
from gen.datastore_service_pb2 import (
    StoreRequest,
    StoreResponse,
    RetrieveRequest,
    RetrieveResponse
)

from modules.Utils import hash_file

from flask import current_app

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
        chunk = file.read(4096 * 1024)
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
) -> Tuple[Optional[str], Optional[DatastoreServiceError]]:
    current_app.logger.debug(f"file_id={file_id}")
    segment_path = os.path.join(Config.DOWNLOAD_FOLDER, segment_name)
    segment_hash = hash_file(segment_path)
    with open(segment_path, 'rb') as f:
        with grpc.insecure_channel(destination_ip) as channel:
            try:
                grpc.channel_ready_future(channel).result(timeout=10)
            except grpc.FutureTimeoutError:
                current_app.logger.error("Connection timeout")
                return None, DatastoreServiceError("Connection timeout")
            else:
                stub = DatastoreServiceStub(channel)
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
                current_app.logger.debug(f"code={response.code}")
                current_app.logger.debug(f"chunk_id={response.chunk_id}")
                current_app.logger.debug(f"hash={response.hash}")
                current_app.logger.debug(f"chunk_sequence={response.chunk_sequence}")
                current_app.logger.debug(f"message={response.message}")

    # TODO: remove segment file after sending it to datastore
    # if os.path.exists(segment_path):
    #     os.remove(segment_path)
    return segment_path, None


                    


def receive_segment_from_ip(file_id: str, file_chunk_id, source_ip) -> Tuple[Optional[Tuple[str, str]], Optional[DatastoreServiceError]]:
    print(f"RECEIVE_SEGMENT_FROM_IP: file_chunk_id={file_chunk_id}, source_ip={source_ip}", flush=True, file=sys.stderr)
    with grpc.insecure_channel(source_ip) as channel:
        try:
            grpc.channel_ready_future(channel).result(timeout=10)
        except grpc.FutureTimeoutError:
            current_app.logger.error("Connection timeout")
            return None, DatastoreServiceError("Connection timeout")
        else:
            stub = DatastoreServiceStub(channel)
            request = RetrieveRequest(chunk_id=file_chunk_id)

            data: bytes = b''

            response: Iterator[RetrieveResponse] = stub.Retrieve(request)

            print(f"response={response}", flush=True, file=sys.stderr)
            
            last_response = None
            for resp in response:
                data += resp.chunk
                last_response = resp

            if last_response:
                
                segment_filename = f"{file_id}_segment_{last_response.chunk_sequence}.dat"

                with open(os.path.join(Config.DOWNLOAD_FOLDER, segment_filename), 'wb') as f:
                    f.write(data)

                return (last_response.file_name, last_response.file_type), None

            return None, DatastoreServiceError("Error retrieving chunk from datastore")
            
            



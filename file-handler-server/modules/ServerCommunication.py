import sys
from typing import Dict, Iterator, List, Optional, Tuple
import grpc
import requests
import Config
from gen.metadata_service_pb2_grpc import MetadataServiceStub
from gen.metadata_service_pb2 import (
    GetTopKDatastoresRequest,
    GetTopKDatastoresResponse,
    GetFileChunkLocationResponse,
    DatastoreInfo,
    GetFileChunkLocationsRequest
)

from modules.Errors import MetadataServiceError

from flask import current_app


def get_ip_list(size: int) -> Tuple[Optional[List[str]], Optional[MetadataServiceError]]:
    metadata_service_url = f"{Config.metadata_service_host}:{Config.metadata_service_port}"
    with grpc.insecure_channel(metadata_service_url) as channel:
        try:
            grpc.channel_ready_future(channel).result(timeout=10)
        except grpc.FutureTimeoutError:
            current_app.logger.error("Connection timeout")
            return None, MetadataServiceError("Connection timeout")
        else:
            stub = MetadataServiceStub(channel)
            request = GetTopKDatastoresRequest(k=size)
            response: GetTopKDatastoresResponse = stub.GetTopKDatastores(request)

            print(f"response={response}", flush=True, file=sys.stderr)
            print(f"response.status={response.status}", flush=True, file=sys.stderr)

            # TODO: Somehow status.code field of response is not set
            if response and response.datastores and len(response.datastores) > 0:
                return [datastore.datastore_id for datastore in response.datastores], None
            return None, MetadataServiceError("No datastores available")


class GetIpsForUUIDReturn:
    def __init__(self, ip: str, chunk_sequence: int, chunk_size: int, chunk_hash: str, chunk_id: str) -> None:
        self.ip = ip
        self.chunk_sequence = chunk_sequence
        self.chunk_size = chunk_size
        self.chunk_hash = chunk_hash
        self.chunk_id = chunk_id

def get_ips_for_uuid(file_uid: str) -> Tuple[Optional[List[GetIpsForUUIDReturn]], Optional[MetadataServiceError]]:
    metadata_service_url = f"{Config.metadata_service_host}:{Config.metadata_service_port}"
    with grpc.insecure_channel(metadata_service_url) as channel:
        try:
            grpc.channel_ready_future(channel).result(timeout=10)
        except grpc.FutureTimeoutError:
            current_app.logger.error("Connection timeout")
            return None, MetadataServiceError("Connection timeout")
        else:
            stub = MetadataServiceStub(channel)
            request = GetFileChunkLocationsRequest(file_id=file_uid)
            response: Iterator[GetFileChunkLocationResponse] = stub.GetFileChunkLocations(request)

            current_app.logger.error(f"response={response}")

            datastores_for_file_uid: List[GetIpsForUUIDReturn] = []
            for file_chunk_location in response:
                print(f"file_chunk_location={file_chunk_location}", flush=True, file=sys.stderr)
                # current_app.logger.error(f"file_chunk_location_response={file_chunk_location}")
                datastore_info: DatastoreInfo = file_chunk_location.datastores
                # current_app.logger.error(f"datastore_info={datastore_info}")
                # current_app.logger.error(f"chunk_size={file_chunk_location.chunk_size}")
                # current_app.logger.error(f"chunk_hash={file_chunk_location.chunk_hash}")
                # current_app.logger.error(f"chunk_id={file_chunk_location.chunk_id}")
                # current_app.logger.error(f"chunk_sequence={file_chunk_location.chunk_sequence}")
                # current_app.logger.error(f"status={file_chunk_location.status}")
                # current_app.logger.error(f"status.code={file_chunk_location.status.code}")
                # current_app.logger.error(f"status.message={file_chunk_location.status.message}")
                # current_app.logger.error(f"status.details={file_chunk_location.status.details}")
                
                if file_chunk_location.status.code != 0:
                    error_message = "There was an error getting the file chunk location"
                    return None, MetadataServiceError(f"{error_message}: {file_chunk_location.status.message}")
                datastores_for_file_uid.append(
                    GetIpsForUUIDReturn(
                        ip=datastore_info.datastore_id,
                        chunk_sequence=file_chunk_location.chunk_sequence,
                        chunk_size=file_chunk_location.chunk_size,
                        chunk_hash=file_chunk_location.chunk_hash,
                        chunk_id=file_chunk_location.chunk_id))
            
            return datastores_for_file_uid, None

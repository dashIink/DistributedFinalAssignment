import sys
from typing import List, Optional, Tuple
import grpc
import requests
import Config
from gen.metadata_service_pb2_grpc import MetadataServiceStub
from gen.metadata_service_pb2 import GetTopKDatastoresRequest, GetTopKDatastoresResponse
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

            
        

def get_ips_for_uuid(uuid):
    payload = {"uuid": uuid}
    response = requests.post(f"{Config.metadata_server_url}/get_ips_for_uuid", json=payload)
    if response.status_code == 200:
        ip_list = response.json()
        return ip_list
    else:
        return None

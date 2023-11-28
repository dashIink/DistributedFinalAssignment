from typing import List, Optional, Tuple
import grpc
import requests
import Config
from gen.metadata_service_pb2_grpc import MetadataServiceStub
from gen.metadata_service_pb2 import GetTopKDatastoresRequest, GetTopKDatastoresResponse
from modules.Errors import MetadataServiceError


def get_ip_list(size: int) -> Tuple[Optional[List[str]], Optional[MetadataServiceError]]:
    metadata_service_url = f"{Config.metadata_service_host}:{Config.metadata_service_port}"
    with grpc.insecure_channel(metadata_service_url) as channel:
        try:
            grpc.channel_ready_future(channel).result(timeout=10)
        except grpc.FutureTimeoutError:
            return None, MetadataServiceError("Connection timeout")
        else:
            stub = MetadataServiceStub(channel)
            request = GetTopKDatastoresRequest(k=size)
            response: GetTopKDatastoresResponse = stub.GetTopKDatastores(request)
            if response.status.code == grpc.StatusCode.OK:
                return [datastore.datastore_id for datastore in response.datastores], None
            else:
                return None, MetadataServiceError(response.status.message)
        

def get_ips_for_uuid(uuid):
    payload = {"uuid": uuid}
    response = requests.post(f"{Config.metadata_server_url}/get_ips_for_uuid", json=payload)
    if response.status_code == 200:
        ip_list = response.json()
        return ip_list
    else:
        return None

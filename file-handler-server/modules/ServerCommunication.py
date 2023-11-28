import requests
import Config
def get_ip_list(size):
    response = requests.post(f"{Config.metadata_server_url}/get_ip_list", json={"size": size})
    if response.status_code == 200:
        ip_list = response.json()
        return ip_list
    else:
        return None

def get_ips_for_uuid(uuid):
    payload = {"uuid": uuid}
    response = requests.post(f"{Config.metadata_server_url}/get_ips_for_uuid", json=payload)
    if response.status_code == 200:
        ip_list = response.json()
        return ip_list
    else:
        return None

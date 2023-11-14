import os
import requests
import Config
def send_segment_to_ip(segment_name, destination_ip):
    segment_path = os.path.join(Config.DOWNLOAD_FOLDER, f"{segment_name}")
    requests.post(f"http://{destination_ip}/upload", files={'file': (segment_path, open(segment_path, 'rb'))})

def receive_segment_from_ip(file_id, source_ip):
    segment_filename = f"{file_id}"
    response = requests.get(f"http://{source_ip}/download/{file_id}")
    with open(os.path.join(Config.DOWNLOAD_FOLDER, segment_filename), 'wb') as f:
        f.write(response.content)

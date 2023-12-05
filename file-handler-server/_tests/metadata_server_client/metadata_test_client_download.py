import requests
import json

# The URL of your Flask server
server_url = "http://127.0.0.1:4000/get_ips_for_uuid"

# Define the UUID for which you want to retrieve IP addresses
request_data = {
    'uuid': 'uuid1'  # Replace 'your_uuid_here' with the UUID you want to query
}

# Send a POST request to the get_ips_for_uuid endpoint
response = requests.post(server_url, json=request_data)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    data = response.json()
    ips = data['ips']
    print(f"IPs for UUID '{request_data['uuid']}':")
    for ip in ips:
        print(ip)
else:
    # Print the response status code and any error message
    print(f"Response Status Code: {response.status_code}")
    print(response.text)

import requests
import json

# The URL of your Flask server
server_url = "http://127.0.0.1:4000/get_ip_list"

# Define the size of the IP list you want to request
request_data = {
    'size': 5  # Change this number to the desired size
}

# Send a POST request to the get_ip_list endpoint
response = requests.post(server_url, json=request_data)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    data = response.json()
    ips = data['ips']
    print("Received IP list:")
    for ip in ips:
        print(ip)
else:
    # Print the response status code and any error message
    print(f"Response Status Code: {response.status_code}")
    print(response.text)

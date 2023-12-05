import requests

# Specify the URL of your Flask server
server_url = "http://127.0.0.1:6001/upload"

# Specify the file to upload
files = {'file': ('test_file.txt', open('test_file.txt', 'rb'))}

# Send a POST request to upload the file
response = requests.post(server_url, files=files)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Print the response status code and the uploaded ID
    print(f"Response Status Code: {response.status_code}")
else:
    # Print the response status code and any error message
    print(f"Response Status Code: {response.status_code}")
    print(response.text)

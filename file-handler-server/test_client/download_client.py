import requests

# Specify the URL of your Flask server
server_url = "http://127.0.0.1:5000/download/segment_1.dat"  # Specify the segment filename you want to download

# Send a GET request to download the segment
response = requests.get(server_url)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Save the downloaded segment to a file
    with open("downloaded_segment.dat", "wb") as f:
        f.write(response.content)

    print("Segment downloaded successfully.")
else:
    # Print the response status code and any error message
    print(f"Response Status Code: {response.status_code}")
    print(response.text)

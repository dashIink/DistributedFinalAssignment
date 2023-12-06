# Centralized Distributed File Storage System

Alden O’Cain - 100558599  
Ahmet Karapinar -100750048  
Saaransh Sharma - 100701820  
Liam Rea - 100743012  
Jalen Duggan - 100713924  

## Setup

__Note:__ Ensure that you have Docker and Docker Compose installed on your machine. Postman is also recommended for sending API requests.

All services of the system are containerized. Their images were built and published to the Docker Hub container registery.

1. Clone this repository using: `git clone https://github.com/dashIink/DistributedFinalAssignment.git`
2. In a terminal, navigate to the project directory.
3. To run the project, enter the following command: `docker compose up`

## Testing

Sample files used for tests can be found in the `tests` folder of this project.

### File Upload

1. Using Postman, create a POST request with the localhost address and port number, followed by the /upload endpoint. By default this should be `http://localhost:55353/upload`.
2. In the 'Body' tab of Postman, select the option 'form-data' from the dropdown. In the 'key' column, enter the text `files[]`. 
3. In the key column, select the 'File' option from the dropdown (this should be beside the files[] text entry).
4. In the value column, select the file that you want to upload.
5. Click the 'Send' button in Postman to send the request. Verify that the response returns the file id and name.

### File Download

1. Using Postman, create a GET request with the localhost address and port number, followed by the /download/file-id. By default this should be `http://localhost:55353/download/file-id`. Replace 'file-id' with the file id from the upload.
2. At the 'Send' button, click the dropdown and select 'Send and Download'
3. Select the desired location to save the file

### Additional Notes

For reference, the images that were published to Docker Hub can be found here:

File Handler Service: https://hub.docker.com/repository/docker/ahmetk/file-handler-service/general  
Metadata Service: https://hub.docker.com/repository/docker/ahmetk/metadata-service/general  
Datastore Service: https://hub.docker.com/repository/docker/ahmetk/datastore-service/general




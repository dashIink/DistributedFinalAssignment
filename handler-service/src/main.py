import os
import shutil
import uuid
from flask import Flask, request, send_from_directory, send_file

app = Flask(__name__)

# Set the upload and download directories
UPLOAD_FOLDER = 'inbound'
DOWNLOAD_FOLDER = 'segments'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER

# Create the upload directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def reassemble_file(input_directory, output_file, num_segments):
    with open(output_file, 'wb') as outfile:
        for i in range(num_segments):
            segment_name = f"segment_{i + 1}.dat"
            segment_path = os.path.join(input_directory, segment_name)

            with open(segment_path, 'rb') as infile:
                shutil.copyfileobj(infile, outfile)
def split_file(input_file, output_directory, num_segments):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    with open(input_file, 'rb') as infile:
        file_size = os.path.getsize(input_file)
        segment_size = file_size // num_segments

        for i in range(num_segments):
            segment_name = f"segment_{i + 1}.dat"
            output_path = os.path.join(output_directory, segment_name)

            with open(output_path, 'wb') as outfile:
                shutil.copyfileobj(infile, outfile, segment_size)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']

    if file.filename == '':
        return "No selected file", 400

    if file:
        # Generate a unique ID for the uploaded file
        unique_id = str(uuid.uuid4())

        # Save the uploaded file with the unique ID as the filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_id)
        file.save(file_path)

        # Split the uploaded file into parts
        split_file(file_path, app.config['DOWNLOAD_FOLDER'], num_segments=3)

        return f"File uploaded with ID: {unique_id}", 200

@app.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    output_file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], f"{file_id}.dat")
    reassemble_file(app.config['DOWNLOAD_FOLDER'], output_file_path, num_segments=3)
    return send_file(output_file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
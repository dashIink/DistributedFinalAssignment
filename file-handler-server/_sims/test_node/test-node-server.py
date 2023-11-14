import argparse
from flask import Flask, request, send_from_directory
import os

app = Flask(__name__)

# Define the directory where uploaded files will be stored
UPLOAD_FOLDER = 'file_segments'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create the upload directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part"

    file = request.files['file']

    if file.filename == '':
        return "No selected file"

    if file:
        file.save(file.filename)
        return "File uploaded successfully"

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=6000, help='Port to run the server on')
    args = parser.parse_args()

    app.run(debug=True, port=args.port)

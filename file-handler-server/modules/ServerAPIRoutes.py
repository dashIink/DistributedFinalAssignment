import json
import os
import uuid
import Config
from flask import Blueprint, jsonify, request, send_file
from modules.FileSegmentation import split_file, reassemble_file
from modules.FileTransmission import send_segment_to_ip, receive_segment_from_ip
from modules.ServerCommunication import get_ip_list, get_ips_for_uuid

server_routes = Blueprint('server_routes', __name__)

@server_routes.route('/upload', methods=['POST'])
def upload_file():
    if 'files[]' not in request.files:
        return jsonify({"error": "No files part"}), 400

    files = request.files.getlist('files[]')

    if not files or any(file.filename == '' for file in files):
        return jsonify({"error": "No selected file"}), 400
    
    uploaded_files = []
    for file in files:
        if file:
            unique_id = str(uuid.uuid4())
            file_path = os.path.join(Config.UPLOAD_FOLDER, unique_id)
            file.save(file_path)
            split_file(file_path, Config.DOWNLOAD_FOLDER, num_segments=Config.num_segments)

            # TODO: get list of destination ips from metadata service
            destination_ips = get_ip_list(Config.num_segments)

            ips_list = destination_ips['ips']
            for i, ip in enumerate(ips_list):
                segment_name = f"{unique_id}_segment_{i + 1}.dat"

                # TODO: send segment to destination ip using datastore service
                send_segment_to_ip(segment_name=segment_name, destination_ip=ip)

            uploaded_files.append({
                "id": unique_id,
                "name": file.filename
            })
    return jsonify({"files": uploaded_files}), 200

@server_routes.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    source_ips = get_ips_for_uuid(file_id)
    ips_list = source_ips['ips']
    for i, ip in enumerate(ips_list):
        segment_name = f"{file_id}_segment_{i + 1}.dat"
        receive_segment_from_ip(file_id=segment_name, source_ip=ip)
    output_file_path = os.path.join(Config.UPLOAD_FOLDER, file_id)
    reassemble_file(file_id, Config.DOWNLOAD_FOLDER, output_file_path, num_segments=Config.num_segments)
    return send_file(output_file_path, as_attachment=True)

import json
import sys
import time
from flask import current_app
import os
from typing import List, Optional, Tuple
import uuid
import Config
from flask import Blueprint, jsonify, request, send_file
from modules.FileSegmentation import split_file, reassemble_file
from modules.FileTransmission import send_segment_to_ip, receive_segment_from_ip
from modules.ServerCommunication import get_ip_list, get_ips_for_uuid

from modules.Utils import distribute_chunks_with_sequence, even_chunk_iterator, hash_file

server_routes = Blueprint('server_routes', __name__)

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler(sys.stdout))

@server_routes.route('/upload', methods=['POST'])
def upload_file():
    # tp std.err
    print(f"request.files={request.files}", flush=True, file=sys.stderr)
    current_app.logger.debug(f"request.files={request.files}")
    if 'files[]' not in request.files:
        return jsonify({"error": "No files part"}), 400

    files = request.files.getlist('files[]')

    if not files or any(file.filename == '' for file in files):
        return jsonify({"error": "No selected file"}), 400
    
    uploaded_files = []
    for file in files:
        print(f"file={file}", flush=True, file=sys.stderr)
        logger.debug(f"file={file}")
        
        if file and file.filename != '' and file.filename != None:
            logger.debug(f"file.content_type={file.content_type}")
            current_app.logger.debug(f"file.filename={file.filename}")
            unique_id = str(uuid.uuid4())
            file_path = os.path.join(Config.UPLOAD_FOLDER, unique_id)
            file.save(file_path)

            # TODO: use this hash to verify integrity of the file ???
            file_hash = hash_file(file_path)

            size_of_file = os.path.getsize(file_path)

            segment_filenames = split_file(file_path, Config.DOWNLOAD_FOLDER, num_segments=Config.num_segments)

            print(f"segment_filenames={segment_filenames}", flush=True, file=sys.stderr)

            # TODO: get list of destination ips from metadata service
            destination_ips, error = get_ip_list(size=Config.num_segments)

            current_app.logger.error(f"destination_ips={destination_ips}")

            if error:
                return jsonify({"error": error.message}), 500

            ips_list = destination_ips
            if not ips_list:
                return jsonify({"error": "No datastores available"}), 500
            
            # key = datastore_id, value = list of segments
            segment_datastore_map = distribute_chunks_with_sequence(segment_filenames, ips_list)

            print(f"segment_datastore_map={segment_datastore_map}", flush=True, file=sys.stderr)

            current_app.logger.error(f"segment_datastore_map={segment_datastore_map}")

            segment_paths: List[str] = []
            for datastore_id, [segment_name, chunk_sequence] in even_chunk_iterator(segment_datastore_map):
                print(f"datastore_id={datastore_id}, chunk_sequence={chunk_sequence}, segment_name={segment_name}", flush=True, file=sys.stderr)

                # time.sleep(1)

                segment_path, send_segment_error = send_segment_to_ip(
                        file_id=unique_id,
                        file_name=file.filename,
                        file_size=os.path.getsize(file_path),
                        file_type=file.content_type,
                        chunk_sequence=chunk_sequence,
                        segment_name=segment_name,
                        destination_ip=datastore_id
                    )
                if send_segment_error:
                    return jsonify({"error": "Error sending segment to datastore"}), 500
                if segment_path:
                    segment_paths.append(segment_path)

            uploaded_files.append({
                "id": unique_id,
                "name": file.filename
            })
            # TODO: delete file after upload
            if os.path.exists(file_path):
                os.remove(file_path)
            else:
                print(f"The file does not exist {file_path}", flush=True, file=sys.stderr)
                current_app.logger.error(f"The file does not exist {file_path}")
            for segment_path in segment_paths:
                if os.path.exists(segment_path):
                    os.remove(segment_path)
                else:
                    print(f"The file does not exist {segment_path}", flush=True, file=sys.stderr)
                    current_app.logger.error(f"The file does not exist {segment_path}")
            

    return jsonify({"files": uploaded_files}), 200

@server_routes.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    source_ips, error = get_ips_for_uuid(file_id)
    if error:
        return jsonify({"error": error.message}), 500
    
    if not source_ips:
        return jsonify({"error": "No datastores available"}), 500
    
    fileName: Optional[str] = None
    fileType: Optional[str] = None

    for chunk_location_info in source_ips:
        fileInfo, err = receive_segment_from_ip(file_id= file_id ,file_chunk_id=chunk_location_info.chunk_id, source_ip=chunk_location_info.ip)
        if err:
            return jsonify({"error": err.message}), 500
        if fileInfo:
            fileName = fileInfo[0]
            fileType = fileInfo[1]

    if not fileName or not fileType:
        current_app.logger.error(f"File chunks didn't properly stored with the file metadata such as file name and file type")
        return jsonify({"error": "Error receiving file from datastore"}), 500

    output_file_path = os.path.join(Config.UPLOAD_FOLDER, file_id)
    noutput_file_path = f"{output_file_path}.{fileName.split('.')[-1]}"
    reassemble_file(file_id, fileType, fileName, Config.DOWNLOAD_FOLDER, noutput_file_path, num_segments=Config.num_segments)
    return send_file(noutput_file_path, download_name=fileName, as_attachment=True, mimetype=fileType)

    return jsonify({"ips": source_ips}), 200
    # ips_list = source_ips['ips']
    # for i, ip in enumerate(ips_list):
    #     segment_name = f"{file_id}_segment_{i + 1}.dat"
    #     receive_segment_from_ip(file_id=segment_name, source_ip=ip)
    # output_file_path = os.path.join(Config.UPLOAD_FOLDER, file_id)
    # reassemble_file(file_id, Config.DOWNLOAD_FOLDER, output_file_path, num_segments=Config.num_segments)
    # return send_file(output_file_path, as_attachment=True)

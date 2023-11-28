import json

# Load available IP addresses from a file
with open('ip_addresses.json', 'r') as ip_file:
    available_ips = json.load(ip_file)

# Load UUID to IP mapping from a file
with open('uuid_mapping.json', 'r') as uuid_file:
    uuid_ip_mapping = json.load(uuid_file)

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/get_ip_list', methods=['POST'])
def get_ip_list():
    size = int(request.json['size'])
    ips = available_ips[:size]
    return jsonify({'ips': ips})

@app.route('/get_ips_for_uuid', methods=['POST'])
def get_ips_for_uuid():
    uuid = request.json['uuid']
    ips = uuid_ip_mapping.get(uuid, [])
    return jsonify({'ips': ips})

if __name__ == '__main__':
    app.run(debug=True, port=4000)

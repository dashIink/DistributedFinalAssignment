import Config
from flask import Flask
from modules.ServerAPIRoutes import server_routes

# IT-1: Rest servers
# IT-2: gRPC
# IT-3: Remove file writing
# IT-4: Dynamically set segmentation size
# IT-5: System implementation

app = Flask(__name__)
app.register_blueprint(server_routes)

app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = Config.DOWNLOAD_FOLDER

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.server_port, debug=True)

from flask import Flask, render_template, request, send_file
import os
from datetime import datetime
from util import *


app = Flask(__name__)

# Directory to save uploaded files
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def upload_form():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return {
            "status": "failed",
            "message": "No file part in the request"
        }

    file = request.files['file']

    if file.filename == '':
        return {
            "status": "failed",
            "message": "No selected file"
        }

    if file:
        try:
            # Save the file to the server
            filename, file_ext = file.filename.rsplit(".", 1)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filecode = generate_filecode()

            output_filename = f"{filename}_{timestamp}___{filecode}___.{file_ext}"

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            file.save(file_path)
            return {
                "status": "ok",
                "message": f"File {filename} uploaded successfully!",
                "filecode": filecode
            }
        except Exception as e:
            return {
                "status": "failed",
                "message": f"Server error occurred. {e}"
            }


@app.route('/download', methods=['POST'])
def download_file():
    download_code = request.form.get('download-code')

    file_path, filename = find_my_file(UPLOAD_FOLDER, download_code)

    if (file_path is None) or (filename is None):
        return {
            "status": "failed",
            "message": f"Invalid code: {download_code}"
        }

    return send_file(file_path, as_attachment=True, download_name=filename, mimetype="application/octet-stream")



if __name__ == "__main__":
    app.run(debug=True)

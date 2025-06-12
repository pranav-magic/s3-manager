from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)
load_dotenv()

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_Access_ID"),
    aws_secret_access_key=os.getenv("AWS_Secret_Access_Key"),
    region_name=os.getenv("AWS_Region")
)
BUCKET_NAME = os.getenv("S3_Bucket_Name")

@app.route('/api/list', methods=['GET'])
def list_objects():
    prefix = request.args.get('prefix', '')
    try:
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix,
            Delimiter='/'
        )
        
        files = []
        folders = []
        
        if 'CommonPrefixes' in response:
            folders = [p['Prefix'] for p in response['CommonPrefixes']]
            
        if 'Contents' in response:
            for obj in response['Contents']:
                if not obj['Key'].endswith('/'):
                    metadata = {}
                    try:
                        head_response = s3.head_object(Bucket=BUCKET_NAME, Key=obj['Key'])
                        metadata = head_response.get('Metadata', {})
                    except ClientError:
                        metadata = {}
                    
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'lastModified': obj['LastModified'].isoformat(),
                        'metadata': metadata
                    })
            
        return jsonify({
            'files': files,
            'folders': folders
        })
        
    except ClientError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    prefix = request.form.get('prefix', '')
    
    if file:
        try:
            key = f"{prefix}{file.filename}"
            s3.upload_fileobj(file, BUCKET_NAME, key)
            return jsonify({'message': 'File uploaded successfully'})
        except ClientError as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'No file provided'}), 400

@app.route('/api/upload-folder', methods=['POST'])
def upload_folder():
    files = request.files.getlist('files')
    prefix = request.form.get('prefix', '')
    
    if not files:
        return jsonify({'error': 'No files provided'}), 400
    
    try:
        for file in files:
            key = f"{prefix}{file.filename}"
            s3.upload_fileobj(file, BUCKET_NAME, key)
        return jsonify({'message': 'Folder uploaded successfully'})
    except ClientError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['DELETE'])
def delete_object():
    key = request.args.get('key')
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=key)
        return jsonify({'message': 'Object deleted successfully'})
    except ClientError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-folder', methods=['POST'])
def create_folder():
    folder_name = request.json.get('folderName')
    prefix = request.json.get('prefix', '')
    
    if not folder_name:
        return jsonify({'error': 'Folder name is required'}), 400
        
    try:
        key = f"{prefix}{folder_name}/"
        s3.put_object(Bucket=BUCKET_NAME, Key=key)
        return jsonify({'message': 'Folder created successfully'})
    except ClientError as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
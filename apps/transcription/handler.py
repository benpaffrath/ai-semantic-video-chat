import json
import subprocess

def lambda_handler(event, context):
    input_path = "/tmp/input.mp4"
    output_path = "/tmp/output.mp3"
    code, out, err = extract_audio(input_path, output_path)

    if code == 0:
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Audio extrahiert', 'output': output_path})
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': err.decode()})
        }

def extract_audio(input_path, output_path):
    command = [
        "/opt/bin/ffmpeg",
        "-i", input_path,
        "-vn",
        "-acodec", "mp3",
        output_path
    ]

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    return result.returncode, result.stdout, result.stderr

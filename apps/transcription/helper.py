import os
import json
import logging
import subprocess
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from openai import OpenAI

# Initialize logger and AWS clients
logger = logging.getLogger()
s3 = boto3.client("s3")
sqs = boto3.client("sqs")
dynamodb = boto3.client("dynamodb")


def get_openai_api_key(secret_arn: str) -> str:
    """
    Retrieves the OpenAI API key from AWS Secrets Manager.
    """
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_arn)

    if "SecretString" in response:
        return response["SecretString"]

    raise ValueError("Secret not found or invalid format")


# Environment setup
api_key = get_openai_api_key(os.environ["OPENAI_SECRET_ARN"])
openai_client = OpenAI(api_key=api_key)
SQS_QUEUE_URL = os.environ["EMBEDDINGS_SQS_QUEUE_URL"]
DDB_TABLE_NAME = os.environ["SEMANTIC_VIDEO_CHAT_TABLE_NAME"]


def download_from_s3(bucket: str, key: str, local_path: str) -> None:
    """
    Downloads a file from S3 to a local path.
    """
    try:
        logger.info(f"Downloading s3://{bucket}/{key} to {local_path}")
        s3.download_file(bucket, key, local_path)
    except ClientError as e:
        logger.error(f"Failed to download file from S3: {e}")
        raise


def extract_audio(input_path: str, output_path: str) -> None:
    """
    Extracts audio from a video file using ffmpeg.
    """
    command = [
        "/opt/bin/ffmpeg",
        "-i", input_path,
        "-vn",
        "-acodec", "mp3",
        output_path
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.decode()}")


def replace_extension(filename: str, new_ext: str) -> str:
    """
    Replaces the file extension.
    """
    return str(Path(filename).with_suffix(new_ext))


def success_response(body_dict: dict) -> dict:
    """
    Returns a standard 200 success HTTP response.
    """
    return {
        "statusCode": 200,
        "body": json.dumps(body_dict)
    }


def error_response(error_message: str) -> dict:
    """
    Returns a standard 500 error HTTP response.
    """
    return {
        "statusCode": 500,
        "body": json.dumps({"error": error_message})
    }


def send_to_sqs(message_body: dict) -> dict:
    """
    Sends a message to the configured SQS queue.
    """
    return sqs.send_message(
        QueueUrl=SQS_QUEUE_URL,
        MessageBody=json.dumps(message_body)
    )


def transcribe_audio(audio_file_path: str) -> dict:
    """
    Transcribes audio using OpenAI Whisper model.
    """
    with open(audio_file_path, "rb") as f:
        transcript = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json"
        )

    segments = [
        {
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip()
        }
        for seg in transcript.segments
    ]

    return {
        "text": transcript.text.strip(),
        "segments": segments
    }


def update_video_status(knowledge_room_id: str, video_id: str, new_status: str) -> dict:
    """
    Updates the video status in DynamoDB.
    """
    try:
        return dynamodb.update_item(
            TableName=DDB_TABLE_NAME,
            Key={
                "PK": {"S": f"ROOM#{knowledge_room_id}"},
                "SK": {"S": f"VIDEO#{video_id}"}
            },
            UpdateExpression="SET metadata.#status = :new_status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":new_status": {"S": new_status}}
        )
    except ClientError as e:
        logger.error(f"Error updating video status: {e}")
        raise

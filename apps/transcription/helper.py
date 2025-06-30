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
        logger.info("Download done!")
    except ClientError as e:
        logger.error(f"Failed to download file from S3: {e}")
        raise


def extract_audio(input_path: str, output_path: str) -> None:
    """
    Extracts audio from a video file using ffmpeg.
    """

    command = [
        "/opt/bin/ffmpeg",
        "-nostdin",
        "-threads", "0",
        "-i", input_path,
        "-f", "s16le",
        "-ac", "1",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-",
        output_path
    ]

    command2 = [
        "/opt/bin/ffmpeg",
        "-i", input_path,
        "-vn",                   # Kein Video
        "-acodec", "libmp3lame", # MP3-Codec explizit setzen
        "-b:a", "16k",           # Niedrigste sinnvolle Bitrate für Sprache
        "-ar", "16000",          # Samplingrate 16 kHz
        "-ac", "1",              # Mono
        output_path
    ]

    logger.info(f"Extracting audio from {input_path} to {output_path}")
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr.decode()}")

    size_bytes = os.path.getsize(output_path)
    size_mb = size_bytes / (1024 * 1024)
    logger.info(f"Extracted audio file size: {size_mb:.2f} MB")    


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
    logger.info(f"Sending message to SQS: {message_body}")

    return sqs.send_message(
        QueueUrl=SQS_QUEUE_URL,
        MessageBody=json.dumps(message_body)
    )


def transcribe_audio(audio_file_path: str) -> dict:
    """
    Transcribes audio using OpenAI Whisper model.
    """
    logger.info(f"Transcribing audio: {audio_file_path}")
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

    logger.info(f"Transcription done!")
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

import re

import math

def split_audio_on_silence_ffmpeg(input_path, video_id, silence_thresh="-40dB", min_silence_dur=1.0, max_chunks=10):
    """
    Splits an audio file into chunks based on silence using ffmpeg.
    Reduces number of chunks to max_chunks by grouping.
    Returns a list of dicts: [{path, start, duration}]
    """
    logger.info(f"Splitting audio file: {input_path}")

    # Step 1: Detect silence
    command = [
        "/opt/bin/ffmpeg",
        "-i", input_path,
        "-af", f"silencedetect=noise={silence_thresh}:d={min_silence_dur},ametadata=mode=print",
        "-f", "null",
        "-"
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg silencedetect failed: {result.stderr.strip()}")

    # Step 2: Parse silence times
    lines = result.stderr.splitlines()
    silence_times = []
    for line in lines:
        if "silence_start:" in line:
            silence_times.append(("start", float(line.split("silence_start:")[1].strip())))
        elif "silence_end:" in line:
            parts = line.split("silence_end:")[1].strip().split(" | ")
            silence_times.append(("end", float(parts[0])))

    # Step 3: Create speech segments (between silence)
    speech_segments = []
    last_end = 0.0
    for i in range(0, len(silence_times), 2):
        if i + 1 >= len(silence_times):
            break
        _, start = silence_times[i]
        _, end = silence_times[i + 1]
        speech_segments.append((last_end, start))
        last_end = end

    # Add final speech segment
    # Use ffmpeg to get total duration (since no ffprobe)
    duration_cmd = [
        "/opt/bin/ffmpeg",
        "-i", input_path
    ]
    dur_result = subprocess.run(duration_cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    dur_lines = dur_result.stderr.splitlines()
    total_duration = None
    for line in dur_lines:
        if "Duration:" in line:
            dur_text = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = dur_text.split(":")
            total_duration = int(h) * 3600 + int(m) * 60 + float(s)
            break

    if total_duration is None:
        raise RuntimeError("Could not determine total audio duration.")

    if last_end < total_duration:
        speech_segments.append((last_end, total_duration))

    # Step 4: Group segments to max_chunks
    if len(speech_segments) <= max_chunks:
        grouped = speech_segments
    else:
        group_size = math.ceil(len(speech_segments) / max_chunks)
        grouped = []
        for i in range(0, len(speech_segments), group_size):
            group = speech_segments[i:i + group_size]
            start = group[0][0]
            end = group[-1][1]
            grouped.append((start, end))

    # Step 5: Export grouped segments
    chunk_infos = []
    for chunk_index, (start, end) in enumerate(grouped):
        duration = end - start
        output_path = f"/tmp/{video_id}/chunk_{chunk_index:03}.mp3"
        logger.info(f"Creating chunk {chunk_index}: {start:.2f}s to {end:.2f}s")

        export_cmd = [
            "/opt/bin/ffmpeg",
            "-ss", str(start),
            "-t", str(duration),
            "-i", input_path,
            "-acodec", "libmp3lame",
            "-ar", "16000",
            "-ac", "1",
            output_path
        ]
        subprocess.run(export_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        chunk_infos.append({
            "path": output_path,
            "start": start,
            "duration": duration
        })

    return chunk_infos

def upload_json_to_s3(bucket: str, key: str, data: dict) -> None:
    """
    Uploads a JSON file to S3.
    """
    json_bytes = json.dumps(data, indent=2).encode("utf-8")
    s3.put_object(Bucket=bucket, Key=key, Body=json_bytes, ContentType="application/json")
    logger.info(f"Uploaded JSON to s3://{bucket}/{key}")
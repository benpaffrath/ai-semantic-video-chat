import json
import boto3
import os
import logging
from pinecone_client import init_client, upsert_chunks_to_pinecone
from helper import chunk_transcript, update_video_status

logger = logging.getLogger()
logger.setLevel(logging.INFO)

secretsmanager = boto3.client("secretsmanager")

def get_api_key_from_secret(secret_arn: str) -> str:
    """
    Retrieves a secret string (API key) from AWS Secrets Manager.

    Args:
        secret_arn (str): The ARN of the secret in AWS Secrets Manager.

    Returns:
        str: The secret string stored in Secrets Manager.

    Raises:
        ValueError: If the secret is not found or the response format is invalid.
    """
    response = secretsmanager.get_secret_value(SecretId=secret_arn)
    if "SecretString" in response:
        return response["SecretString"]
    raise ValueError("Secret not found or invalid format")


def load_and_set_api_keys() -> None:
    """
    Loads API keys from AWS Secrets Manager based on environment variables
    'PINECONE_SECRET_ARN' and 'OPENAI_SECRET_ARN', then sets them into
    environment variables 'PINECONE_API_KEY' and 'OPENAI_API_KEY' respectively.

    Raises:
        KeyError: If the required environment variables are not set.
        ValueError: If any secret is not found or invalid.
    """
    pinecone_secret_arn = os.environ["PINECONE_SECRET_ARN"]
    openai_secret_arn = os.environ["OPENAI_SECRET_ARN"]
    
    pinecone_api_key = get_api_key_from_secret(pinecone_secret_arn)
    openai_api_key = get_api_key_from_secret(openai_secret_arn)
    
    os.environ["PINECONE_API_KEY"] = pinecone_api_key
    os.environ["OPENAI_API_KEY"] = openai_api_key


def lambda_handler(event: dict, context: object) -> dict:
    """
    AWS Lambda handler function to process incoming records containing video transcripts,
    split the transcripts into chunks, and upsert them into a Pinecone index.
    """
    load_and_set_api_keys()
    init_client()

    for record in event.get("Records", []):
        try:
            body = json.loads(record["body"])
            video_id = body["videoId"]
            user_id = body["userId"]
            knowledge_room_id = body["knowledgeRoomId"]

            transcript_segments = body.get("transcript", {}).get("segments", [])

            chunks = chunk_transcript(transcript_segments, chunk_size=1000, chunk_overlap=100)

            namespace = f"{user_id}_{knowledge_room_id}"
            upsert_chunks_to_pinecone(chunks, namespace, user_id, video_id, knowledge_room_id)

            update_video_status(knowledge_room_id=knowledge_room_id, video_id=video_id, new_status="DONE")
        except Exception as e:
            logger.error(f"Error processing record: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Done!'})
    }

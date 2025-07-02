import os
import logging
import boto3
from typing import List, Dict
from langchain_core.messages import AIMessage, HumanMessage

secretsmanager = boto3.client("secretsmanager")

logger = logging.getLogger()

def convert_history(history: List[Dict]) -> List:
    sorted_history = sorted(history, key=lambda x: x["createdAt"])
    
    msgs = []
    for entry in sorted_history:
        if entry["isUserMessage"]:
            msgs.append(HumanMessage(content=entry["content"]))
        else:
            msgs.append(AIMessage(content=entry["content"]))
    return msgs


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
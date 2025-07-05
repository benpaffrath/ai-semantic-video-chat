"""
Helper module for chat functionality.

This module provides utility functions for managing chat history conversion,
API key retrieval from AWS Secrets Manager, and environment variable setup
for external service integrations like Pinecone and OpenAI.

Functions:
    convert_history: Converts chat history from dictionary format to LangChain message format
    get_api_key_from_secret: Retrieves API keys from AWS Secrets Manager
    load_and_set_api_keys: Loads and sets API keys from secrets into environment variables
"""

import os
import logging
from typing import List, Dict

import boto3
from langchain_core.messages import AIMessage, HumanMessage

secretsmanager = boto3.client("secretsmanager")

logger = logging.getLogger()

def convert_history(history: List[Dict]) -> List:
    """
    Convert chat history from dictionary format to LangChain message format.
    
    Takes a list of chat history dictionaries and converts them into a list
    of LangChain message objects (HumanMessage and AIMessage) sorted by
    creation timestamp.
    
    Args:
        history (List[Dict]): List of chat history dictionaries containing
            'content', 'isUserMessage', and 'createdAt' keys.
            
    Returns:
        List: List of LangChain message objects (HumanMessage, AIMessage)
            sorted by creation timestamp.
            
    """
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
    Retrieve a secret string (API key) from AWS Secrets Manager.

    Fetches the secret value from AWS Secrets Manager using the provided
    secret ARN and returns the secret string content.

    Args:
        secret_arn (str): The ARN of the secret in AWS Secrets Manager.
            Format: arn:aws:secretsmanager:region:account:secret:secret-name

    Returns:
        str: The secret string stored in Secrets Manager.

    Raises:
        ValueError: If the secret is not found or the response format is invalid.
        botocore.exceptions.ClientError: If there's an AWS API error (e.g., 
            secret doesn't exist, insufficient permissions).
    """
    response = secretsmanager.get_secret_value(SecretId=secret_arn)
    if "SecretString" in response:
        return response["SecretString"]
    raise ValueError("Secret not found or invalid format")


def load_and_set_api_keys() -> None:
    """
    Load API keys from AWS Secrets Manager and set them as environment variables.
    
    Retrieves Pinecone and OpenAI API keys from AWS Secrets Manager using
    the ARNs specified in environment variables, then sets them as
    environment variables for use by the application.
    
    Required Environment Variables:
        PINECONE_SECRET_ARN: ARN of the Pinecone API key secret
        OPENAI_SECRET_ARN: ARN of the OpenAI API key secret
        
    Sets Environment Variables:
        PINECONE_API_KEY: The Pinecone API key retrieved from secrets
        OPENAI_API_KEY: The OpenAI API key retrieved from secrets

    Raises:
        KeyError: If the required environment variables (PINECONE_SECRET_ARN,
            OPENAI_SECRET_ARN) are not set.
        ValueError: If any secret is not found or invalid format.
        botocore.exceptions.ClientError: If there's an AWS API error.
    """
    pinecone_secret_arn = os.environ["PINECONE_SECRET_ARN"]
    openai_secret_arn = os.environ["OPENAI_SECRET_ARN"]

    pinecone_api_key = get_api_key_from_secret(pinecone_secret_arn)
    openai_api_key = get_api_key_from_secret(openai_secret_arn)

    os.environ["PINECONE_API_KEY"] = pinecone_api_key
    os.environ["OPENAI_API_KEY"] = openai_api_key

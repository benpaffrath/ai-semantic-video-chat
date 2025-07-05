"""
Pinecone client module for handling vector embeddings and storage.
"""
import os
import logging
from typing import List, Dict, Any
# pylint: disable=import-error
# These imports come from the Lambda layer and are not available during local development
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
# pylint: enable=import-error

logger = logging.getLogger()

PC = None
EMBEDDING_MODEL = None
PINECONE_INDEX = None

PINECONE_INDEX_NAME = os.environ["PINECONE_INDEX_NAME"]


def init_client():
    """Initialize Pinecone client and embedding model."""
    global PC, EMBEDDING_MODEL, PINECONE_INDEX

    if PC is not None and EMBEDDING_MODEL is not None and PINECONE_INDEX is not None:
        # already initialized
        return

    pinecone_api_key = os.environ.get("PINECONE_API_KEY")

    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY not set in environment variables")

    PC = Pinecone(api_key=pinecone_api_key)

    openai_api_key = os.environ.get("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not set in environment variables")

    EMBEDDING_MODEL = OpenAIEmbeddings(openai_api_key=openai_api_key)

    PINECONE_INDEX = PC.Index(PINECONE_INDEX_NAME)


def upsert_chunks_to_pinecone(
    chunks: List[Dict[str, Any]],
    namespace: str,
    user_id: str,
    video_id: str,
    knowledge_room_id: str,
):
    """Upsert text chunks to Pinecone vector store with metadata."""
    docs = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        docs.append(chunk["text"])
        metadatas.append({
            "user_id": user_id,
            "video_id": video_id,
            "knowledge_room_id": knowledge_room_id,
            "start": chunk["start"],
            "end": chunk["end"],
            "chunk_index": i
        })

    PineconeVectorStore.from_texts(
        texts=docs,
        embedding=EMBEDDING_MODEL,
        index_name=PINECONE_INDEX_NAME,
        metadatas=metadatas,
        namespace=namespace
    )

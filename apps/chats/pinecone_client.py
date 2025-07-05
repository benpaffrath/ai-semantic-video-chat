"""
Pinecone client module for semantic search functionality.

This module provides tools for initializing Pinecone vector store,
performing semantic searches, and generating final answers with metadata.
"""

import os
import logging
import json
# These imports are provided by Lambda layers and may not be available during linting
from pinecone import Pinecone  # pylint: disable=import-error
from langchain_pinecone import PineconeVectorStore  # pylint: disable=import-error
from langchain_openai import OpenAIEmbeddings
from langchain_core.tools import tool

logger = logging.getLogger()

PINECONE_VECTORSTORE = None
EMBEDDING_MODEL = None
PINECONE_INDEX = None
PINECONE_API_KEY = None

PINECONE_INDEX_NAME = os.environ["PINECONE_INDEX_NAME"]


def init_embedding_and_pinecone():
    """Initialize embedding model and Pinecone index."""
    global EMBEDDING_MODEL, PINECONE_INDEX, PINECONE_API_KEY

    if EMBEDDING_MODEL is not None and PINECONE_INDEX is not None:
        # already initialized
        return

    PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")

    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY not set in environment variables")

    openai_api_key = os.environ.get("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not set in environment variables")

    EMBEDDING_MODEL = OpenAIEmbeddings(openai_api_key=openai_api_key)

    pc = Pinecone(api_key=PINECONE_API_KEY)
    PINECONE_INDEX = pc.Index(PINECONE_INDEX_NAME)


def init_vectorstore(namespace: str):
    """Initialize Pinecone vector store with given namespace."""
    global PINECONE_VECTORSTORE

    PINECONE_VECTORSTORE = PineconeVectorStore(
        pinecone_api_key=PINECONE_API_KEY,
        index=PINECONE_INDEX,
        embedding=EMBEDDING_MODEL,
        namespace=namespace
    )


@tool
def semantic_search(query: str) -> str:
    """Search for relevant documents using Pinecone and return their content and metadata."""
    docs_with_scores = PINECONE_VECTORSTORE.similarity_search_with_score(query, k=3)
    filtered = [(doc, score) for doc, score in docs_with_scores if score >= 0.75]

    contents = [doc.page_content for doc, score in filtered]
    metadatas = [doc.metadata for doc, score in filtered]

    result = {
        "contents": contents,
        "metadata": metadatas
    }

    print("semantic_search result: ", filtered)

    return json.dumps(result)


@tool
def final_answer(answer: str, metadata=None) -> str:
    """Use this tool to provide a final answer to the user.
    The answer should be in natural language as this will be provided to the user directly.
    The answer could be formatted in Markdown.
    The metadata must include a list of metadata from the tools.
    The metadata must not indluced in the answer string.
    """
    if metadata is None:
        metadata = []

    return json.dumps({
        "answer": answer,
        "metadata": metadata
    })

import os
import logging
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

logger = logging.getLogger()

pc = None
embedding_model = None
pinecone_index = None

PINECONE_INDEX_NAME = os.environ["PINECONE_INDEX_NAME"]

def init_client():
    global pc, embedding_model, pinecone_index
    
    if pc is not None and embedding_model is not None and pinecone_index is not None:
        # already initialized
        return
    
    pinecone_api_key = os.environ.get("PINECONE_API_KEY")

    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY not set in environment variables")
    
    pc = Pinecone(api_key=pinecone_api_key)
    
    openai_api_key = os.environ.get("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not set in environment variables")
    
    embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
    
    pinecone_index = pc.Index(PINECONE_INDEX_NAME)

def upsert_chunks_to_pinecone(
    chunks: List[Dict[str, Any]],
    namespace: str,
    user_id: str,
    video_id: str,
    knowledge_room_id: str,
):
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
        embedding=embedding_model,
        index_name=PINECONE_INDEX_NAME,
        metadatas=metadatas,
        namespace=namespace
    )
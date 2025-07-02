import os
import logging
import json
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_core.tools import tool

logger = logging.getLogger()

pinecone_vectorstore = None
embedding_model = None
pinecone_index = None
pinecone_api_key = None

PINECONE_INDEX_NAME = os.environ["PINECONE_INDEX_NAME"]

def init_embedding_and_pinecone():
    global embedding_model, pinecone_index, pinecone_api_key

    if embedding_model is not None and pinecone_index is not None:
        # already initialized
        return
    
    pinecone_api_key = os.environ.get("PINECONE_API_KEY")

    if not pinecone_api_key:
        raise ValueError("PINECONE_API_KEY not set in environment variables")
        
    openai_api_key = os.environ.get("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not set in environment variables")
    
    
    embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
    
    pc = Pinecone(api_key=pinecone_api_key)
    pinecone_index = pc.Index(PINECONE_INDEX_NAME)

def init_vectorstore(namespace: str):
    global pinecone_vectorstore
   
    pinecone_vectorstore = PineconeVectorStore(
        pinecone_api_key=pinecone_api_key,
        index=pinecone_index,
        embedding=embedding_model,
        namespace=namespace
    )

@tool
def semantic_search(query: str) -> str:
    """Search for relevant documents using Pinecone and return their content and metadata."""
    docs_with_scores = pinecone_vectorstore.similarity_search_with_score(query, k=3)
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
def final_answer(answer: str, metadata: list[dict] = []) -> str:
    """Use this tool to provide a final answer to the user.
    The answer should be in natural language as this will be provided to the user directly.
    The answer could be formatted in Markdown.
    The metadata must include a list of metadata from the tools.
    """

    return json.dumps({
        "answer": answer,
        "metadata": metadata
    })
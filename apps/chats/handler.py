"""
Chat Handler Module

This module provides the main Lambda handler for processing chat messages
in the AI semantic video chat application.
It integrates with OpenAI's GPT models, Pinecone vector database,
and custom agent execution to provide contextual responses based
on video content and conversation history.

The handler processes user messages, maintains conversation context,
and leverages semantic search to retrieve relevant information
from video embeddings stored in Pinecone.

Dependencies:
    - OpenAI GPT-4o-mini for language model processing
    - Pinecone for vector similarity search
    - Custom agent executor for tool-based reasoning
    - LangChain for prompt management and chat history
"""

import json
import logging

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from agent import CustomAgentExecutor
from helper import convert_history, load_and_set_api_keys
from pinecone_client import (
    final_answer,
    init_embedding_and_pinecone,
    init_vectorstore,
    semantic_search
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

prompt = ChatPromptTemplate.from_messages([
    ("system", """\
You are a helpful assistant that answers user questions by using tools.

**Important:**

- You must NEVER call the tool named "final_answer" on the very first step.
- Always call at least one other tool before calling "final_answer".
- If you try to call "final_answer" first, reject this action and pick a different tool.

Your workflow:

1. Use retrieval or processing tools to gather information.
2. After gathering information, call "final_answer" exactly once with the final answer and tools used.

Scratchpad will contain JSON arrays "contents" and "metadata" from previous tools.

Do NOT call "final_answer" first. If you want to give an answer, you need to retrieve information first.
"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])


def lambda_handler(event, _context=None):
    """
    AWS Lambda handler function for processing chat messages.
    
    This function serves as the main entry point for the chat service. It processes incoming
    chat messages, initializes the necessary services (OpenAI, Pinecone), maintains conversation
    context, and returns AI-generated responses based on semantic search of video content.
    
    Args:
        event (dict): AWS Lambda event containing:
            - userId (str): Unique identifier for the user
            - knowledgeRoomId (str): Identifier for the knowledge room/video context
            - message (str): The user's input message
            - history (list, optional): Previous conversation messages
        context: AWS Lambda context object (unused)
    
    Returns:
        dict: Response containing:
            - answer (str): The AI-generated response
            - metadata (list): List of metadata from tools used during processing
            - contents (list): List of content retrieved during processing
    
    Raises:
        json.JSONDecodeError: If the result or metadata cannot be parsed as JSON
        TypeError: If the result is not a string or dictionary
        Exception: For other processing errors
    
    Example:
        >>> event = {
        ...     "userId": "user123",
        ...     "knowledgeRoomId": "room456",
        ...     "message": "What did the video say about AI?",
        ...     "history": [{"role": "user", "content": "Hello"}]
        ... }
        >>> result = lambda_handler(event, None)
        >>> print(result["answer"])
        "Based on the video content..."
    """
    print(event)

    user_id = event["userId"]
    knowledge_room_id = event["knowledgeRoomId"]

    load_and_set_api_keys()
    init_embedding_and_pinecone()
    init_vectorstore(f"{user_id}_{knowledge_room_id}")

    message = event['message']
    history_raw = event.get("history", [])
    chat_history = convert_history(history_raw)

    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    tools = [final_answer, semantic_search]

    executor = CustomAgentExecutor(prompt=prompt, llm=llm, tools=tools, chat_history=chat_history)
    result = executor.invoke(message)

    if isinstance(result, str):
        try:
            result_dict = json.loads(result)
        except json.JSONDecodeError as e:
            print(f"Error decoding result JSON string: {e}")
            raise
    elif isinstance(result, dict):
        result_dict = result
    else:
        raise TypeError(f"Unexpected result type: {type(result)}")

    if "metadata" in result_dict and isinstance(result_dict["metadata"], list):
        try:
            result_dict["metadata"] = [
                json.loads(m) if isinstance(m, str) else m for m in result_dict["metadata"]
            ]
        except json.JSONDecodeError as e:
            print(f"Error decoding metadata items: {e}")
            raise

    return result_dict

# Chats Service

This folder contains the backend logic for the chat and retrieval-augmented generation (RAG) agent in the AI Semantic Video Chat project. The service is designed to answer user questions by leveraging semantic search over vector databases (Pinecone) and orchestrating responses using a custom agent.

## Main Components

- **agent.py**  
  Contains the `CustomAgentExecutor` class, which manages the agent's reasoning loop. It coordinates tool calls (such as semantic search and final answer), maintains chat history, and ensures the agent follows the correct workflow.

- **handler.py**  
  Implements the main entry point (`lambda_handler`) for processing chat events. It initializes the agent, loads user and room context, manages API keys, and returns structured responses. The handler ensures that the agent always performs at least one retrieval step before providing a final answer.

- **helper.py**  
  Provides utility functions for:
    - Converting chat history between formats
    - Loading API keys securely from AWS Secrets Manager
    - Setting up environment variables for downstream services

- **pinecone_client.py**  
  Handles all interactions with Pinecone and embedding models.
    - Initializes embedding and vector store connections
    - Defines tools for semantic search and returning final answers
    - Implements the logic for filtering and formatting search results

## Workflow

1. **Initialization**:  
   API keys are loaded from AWS Secrets Manager and set as environment variables.
2. **Embedding & Vector Store**:  
   The embedding model and Pinecone vector store are initialized for the current user and knowledge room.
3. **Agent Execution**:  
   The agent receives a user message, performs semantic search, and then generates a final answer using the retrieved context.
4. **Response**:  
   The result is returned as a structured JSON object, including the answer and any relevant metadata.

## Requirements

Install dependencies with:

```bash
pip install -r requirements.txt
```

**requirements.txt**:

- pinecone
- pinecone_plugin_interface
- langchain-pinecone

## Notes

- The agent is designed to always perform at least one retrieval step before answering.
- API keys for Pinecone and OpenAI are managed via AWS Secrets Manager for security.
- The service is intended to be deployed as a serverless function (e.g., AWS Lambda).

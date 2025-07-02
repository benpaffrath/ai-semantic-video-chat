# Embeddings Lambda

This module provides the AWS Lambda function for processing video transcripts and storing their semantic embeddings in a Pinecone vector database. It is part of a larger semantic video chat application.

## Overview

- **Purpose:**
    - Processes video transcript files (JSON) uploaded to S3.
    - Splits transcripts into overlapping text chunks.
    - Generates embeddings for each chunk using OpenAI.
    - Stores the embeddings and metadata in a Pinecone vector index for semantic search.
    - Updates video processing status in DynamoDB.

## Main Components

- `handler.py`: Lambda entrypoint. Handles SQS events, downloads transcripts from S3, chunks them, and upserts to Pinecone.
- `helper.py`: Utilities for S3 download, transcript chunking, and DynamoDB status updates.
- `pinecone_client.py`: Handles Pinecone and embedding model initialization, and upserts chunked data.

## Dependencies

- `pinecone`
- `pinecone_plugin_interface`
- `langchain-pinecone`
- `boto3` (AWS SDK for Python)
- `langchain-openai` (for embedding model)

Install dependencies locally:

```bash
pip install -r requirements.txt
```

## Environment Variables

- `S3_VIDEO_BUCKET_NAME`: S3 bucket for transcripts
- `PINECONE_INDEX_NAME`: Pinecone index name
- `SEMANTIC_VIDEO_CHAT_TABLE_NAME`: DynamoDB table name
- `PINECONE_SECRET_ARN`, `OPENAI_SECRET_ARN`: ARNs for API keys in AWS Secrets Manager

## Packaging & Deployment

Use the Makefile to build and package the Lambda:

```bash
make all
```

This will install dependencies in a local folder and create a deployment zip in `dist/lambda.zip`.

## Usage

This Lambda is triggered by SQS messages containing metadata about the video and transcript location. It is designed to run in a serverless AWS environment as part of a video processing pipeline.

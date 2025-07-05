# AI Semantic Video Chat

AI Semantic Video Chat is a modular, serverless platform for semantic search and chat over video content. It leverages modern cloud infrastructure, vector databases, and AI models to enable users to interact with video knowledge bases using natural language.

DEMO: https://dev.semantic-video-chat.realyte.digital/

## Overview

The project is organized into several services and infrastructure modules:

- **Frontend**: Modern Next.js web application for chat, video navigation, file upload, and knowledge room management.
- **GraphQL API**: Central API for managing knowledge rooms, conversations, videos, and chat messages. Integrates with AWS DynamoDB, S3, and SQS.
- **Chats Service**: Backend logic for the retrieval-augmented generation (RAG) agent, performing semantic search and orchestrating AI responses.
- **Embeddings Service**: Lambda function for processing video transcripts, generating semantic embeddings, and storing them in Pinecone.
- **Transcription Service**: Lambda for transcribing audio/video files, providing text for downstream semantic search and chat.
- **Infrastructure**: Terraform code for provisioning all AWS resources, including Lambda, S3, DynamoDB, SQS, API Gateway, and more.

## Architecture

- **Serverless-first**: All backend services are designed as AWS Lambda functions.
- **Semantic Search**: Uses Pinecone vector database and OpenAI embeddings for context retrieval.
- **Modular**: Each service is independently deployable and documented.
- **Secure**: API keys and secrets are managed via AWS Secrets Manager.

## Quick Start

Each service and the infrastructure have their own README files with detailed setup and usage instructions. Please refer to them for more information:

- [Frontend (Next.js)](./apps/frontend/README.md)
- [GraphQL API](./apps/graphql/README.md)
- [Chats Service](./apps/chats/README.md)
- [Embeddings Service](./apps/embeddings/README.md)
- [Transcription Service](./apps/transcription/README.md)
- [Infrastructure (Terraform)](./infrastructure/README.md)

## Main Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Python, Node.js, AWS Lambda, GraphQL
- **AI & Search**: OpenAI, Pinecone, LangChain
- **Cloud**: AWS (Lambda, S3, DynamoDB, SQS, Secrets Manager)
- **Infrastructure as Code**: Terraform

## Repository Structure

- `apps/` — All application services (frontend, backend, lambdas)
- `infrastructure/` — Terraform modules for AWS resources
- `shared/` — Shared Lambda layers (e.g., ffmpeg, LangChain)

---

For detailed instructions, deployment steps, and service-specific information, please see the respective README files in each directory.

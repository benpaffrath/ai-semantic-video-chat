# GraphQL Backend for Semantic Video Chat

This service provides a GraphQL API for managing knowledge rooms, conversations, videos, and chat messages in the Semantic Video Chat application. It is designed to run as an AWS Lambda function and supports local development.

## Features

- **Knowledge Rooms**: Organize conversations and videos by topic or project.
- **Conversations**: Threaded discussions within a knowledge room.
- **Videos**: Upload, manage, and retrieve video files with presigned S3 URLs.
- **Chat Messages**: Send and retrieve chat messages, including references to video segments.
- **AWS Integration**: Uses DynamoDB for storage, S3 for video files, and SQS for event-driven processing.
- **Authentication**: Simple token-based authentication via the `Authorization` header.

## GraphQL Schema

The main types and operations are defined in [`schema.graphql`](./schema.graphql). Key operations include:

### Queries

- `listKnowledgeRooms`: List all knowledge rooms for the authenticated user.
- `listConversations(knowledgeRoomId)`: List conversations in a knowledge room.
- `listVideos(knowledgeRoomId)`: List videos in a knowledge room.
- `listChatMessages(knowledgeRoomId, conversationId)`: List chat messages in a conversation.

### Mutations

- `createKnowledgeRoom(title)`: Create a new knowledge room.
- `createConversation(title, knowledgeRoomId)`: Create a new conversation.
- `createUploadUrls(input)`: Get presigned S3 upload URLs for video files.
- `createVideo(input, knowledgeRoomId)`: Register a new video and trigger processing.
- `sendChatMessage(input, knowledgeRoomId, conversationId)`: Send a chat message.

## Authentication

All requests require an `Authorization` header. The value is used as the `userId` for all operations. (Note: The current implementation is a placeholder and should be replaced with a real authentication system for production.)

## Getting Started

### Prerequisites

- Node.js 20.x
- AWS credentials (for DynamoDB, S3, SQS access)

### Install dependencies

```bash
npm install
```

### Local Development

Start the server locally (with hot-reloading):

```bash
npm run dev
```

The server will be available at [http://localhost:4000/graphql](http://localhost:4000/graphql).

### Build for Lambda

```bash
npm run build
```

This will bundle the code into the `dist/` directory.

### Package for Deployment

```bash
make package
```

This will create a `lambda.zip` file in the `dist/` directory for deployment.

## Environment Variables

- `SEMANTIC_VIDEO_CHAT_TABLE_NAME`: DynamoDB table name
- `S3_VIDEO_BUCKET_NAME`: S3 bucket for video files
- `TRANSCRIPTIONS_SQS_QUEUE_URL`: SQS queue for video processing events
- `IS_LOCAL`: Set to `true` for local development

## Project Structure

- `src/` - Source code (schema, resolvers, helpers)
- `schema.graphql` - GraphQL schema definition
- `dist/` - Build output for Lambda

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build for production/Lambda
- `make package` - Create deployment zip
- `make clean` - Remove build artifacts

## Notes

- The authentication is a placeholder and should be replaced for production use.
- The service is designed for AWS Lambda but can be run locally for development and testing.

---

For more details, see the source files in the `src/` directory and the schema in [`schema.graphql`](./schema.graphql).

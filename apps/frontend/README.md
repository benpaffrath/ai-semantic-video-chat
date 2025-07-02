# Frontend (Next.js)

This directory contains the frontend application for the AI Semantic Video Chat project. It is built with [Next.js](https://nextjs.org/) and uses [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), and modern React best practices.

## Project Structure

- **src/app/**: Main application entry, global styles, layout, and routing.
- **src/components/**: Reusable UI components, organized by feature (e.g., Chat, Sidebar, VideoPlayer, etc.).
- **src/graphql/**: GraphQL client setup, queries, and mutations for API communication.
- **src/helper/**: Utility functions for file uploads, user tokens, and video handling.
- **src/state/**: State management using [Jotai](https://jotai.org/).
- **src/types/**: TypeScript type definitions.
- **public/**: Static assets (SVGs, icons, etc.).

## Key Features

- **Chat Interface**: Real-time chat UI for interacting with the AI agent.
- **Video Player**: Embedded video player with semantic search and navigation.
- **File Upload**: Drag-and-drop file upload for video and data ingestion.
- **Knowledge Rooms**: Organize and manage different knowledge bases or chat rooms.
- **Sidebar Navigation**: Quick access to conversations, videos, and knowledge rooms.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Technologies Used

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Jotai (state management)
- GraphQL (API communication)

## Customization

- Edit UI components in `src/components/`.
- Update GraphQL queries/mutations in `src/graphql/`.
- Add new pages or layouts in `src/app/`.

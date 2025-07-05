import { nanoid } from 'nanoid'
import { Context } from './context'
import {
    insertChatMessage,
    insertConversation,
    insertKnowledgeRoom,
    insertVideo,
    listChatMessagesByConversation,
    listConversationsByKnowledgeRoom,
    listKnowledgeRoomsByUserId,
    listVideosByKnowledgeRoom,
} from './helper/dynamodb'
import { generatePresignedUploadUrl, generatePresignedUrl } from './helper/s3'
import { sendVideoEventToSQS } from './helper/sqs'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { GraphQLError } from 'graphql'

// Lambda client for invoking AI chat processing functions
const lambdaClient = new LambdaClient({ region: 'eu-central-1' })

const clientResolvers = {
    Query: {
        /**
         * Retrieves all knowledge rooms for the authenticated user
         * Uses user context for data isolation and security
         */
        listKnowledgeRooms: async (_, __, context: Context) => {
            try {
                return await listKnowledgeRoomsByUserId(context.userId)
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Lists conversations within a specific knowledge room
         * Ensures user can only access conversations in their own rooms
         */
        listConversations: async (
            _,
            { knowledgeRoomId }: { knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                return await listConversationsByKnowledgeRoom(
                    knowledgeRoomId,
                    context.userId,
                )
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Retrieves videos with presigned URLs for secure access
         * Generates temporary URLs for each video to maintain S3 security
         */
        listVideos: async (
            _,
            { knowledgeRoomId }: { knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                const videos = await listVideosByKnowledgeRoom(
                    knowledgeRoomId,
                    context.userId,
                )

                // Generate presigned URLs for each video to enable secure access
                return await Promise.all(
                    videos.map(async (video) => {
                        const videoUrl = await generatePresignedUrl(
                            `${context.userId}/${video.videoKey}`,
                        )
                        return {
                            ...video,
                            videoUrl,
                        }
                    }),
                )
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Retrieves chat messages in chronological order
         * Maintains conversation flow for context-aware responses
         */
        listChatMessages: async (
            _,
            {
                knowledgeRoomId,
                conversationId,
            }: { knowledgeRoomId: string; conversationId: string },
            context: Context,
        ) => {
            try {
                return await listChatMessagesByConversation(
                    knowledgeRoomId,
                    conversationId,
                    context.userId,
                )
            } catch (e) {
                console.error(e)
            }
        },
    },
    Mutation: {
        /**
         * Creates a new knowledge room for organizing video content
         * Each room acts as a container for related videos and conversations
         */
        createKnowledgeRoom: async (
            _,
            { title }: { title: string },
            context: Context,
        ) => {
            try {
                return await insertKnowledgeRoom(title, context.userId)
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Creates a conversation thread within a knowledge room
         * Enables multiple chat sessions per room for different topics
         */
        createConversation: async (
            _,
            {
                title,
                knowledgeRoomId,
            }: { title: string; knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                return await insertConversation(
                    title,
                    knowledgeRoomId,
                    context.userId,
                )
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Generates presigned URLs for direct file uploads
         * Allows clients to upload large files directly to S3 without server proxying
         */
        createUploadUrls: async (_, { input }, context: Context) => {
            // Create upload promises with user-specific file paths
            const promises = input.map(
                (i: {
                    fileName: string
                    fileType: string
                    id: string
                    key: string
                }) => ({
                    promise: generatePresignedUploadUrl(
                        `${context.userId}/${i.key || i.fileName}`,
                        i.fileType,
                        {
                            createdBy: context.userId,
                            updatedBy: context.userId,
                        },
                    ),
                    fileName: i.fileName,
                    fileType: i.fileType,
                    key: `${i.key || i.fileName}`,
                    id: i.id,
                }),
            )

            const resolvedUploadUrls = await Promise.all(
                promises.map((p) => p.promise),
            )

            // Map resolved URLs back to their corresponding file metadata
            return resolvedUploadUrls.map((url, index) => ({
                uploadUrl: url,
                fileName: promises[index].fileName,
                fileType: promises[index].fileType,
                key: promises[index].key,
                id: promises[index].id,
            }))
        },
        /**
         * Creates video metadata and triggers transcription processing
         * Sends video to SQS queue for asynchronous transcription by Lambda
         */
        createVideo: async (
            _,
            { input, knowledgeRoomId },
            context: Context,
        ) => {
            try {
                const video = await insertVideo(
                    input.id,
                    input.title,
                    input.duration,
                    input.previewImage,
                    input.videoKey,
                    input.type,
                    knowledgeRoomId,
                    context.userId,
                )

                // Trigger asynchronous transcription processing
                const messageId = await sendVideoEventToSQS(
                    video,
                    knowledgeRoomId,
                    context.userId,
                )

                console.log('Message ID', messageId)

                return video
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * Processes chat messages with AI-powered responses
         * Invokes Lambda function for semantic search and response generation
         */
        sendChatMessage: async (
            _,
            { input, knowledgeRoomId, conversationId },
            context: Context,
        ) => {
            try {
                // Retrieve conversation history for context
                const history = await listChatMessagesByConversation(
                    knowledgeRoomId,
                    conversationId,
                    context.userId,
                )

                // Sort history by creation time for proper context ordering
                const sortedHistory = history.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                )

                // Store user message first
                const message = await insertChatMessage(
                    input.id,
                    input.content,
                    [],
                    true,
                    knowledgeRoomId,
                    conversationId,
                    context.userId,
                )

                // Invoke AI processing Lambda with conversation context
                const command = new InvokeCommand({
                    FunctionName: process.env.CHATS_LAMBDA_ARN,
                    Payload: Buffer.from(
                        JSON.stringify({
                            userId: context.userId,
                            knowledgeRoomId: knowledgeRoomId,
                            message: message.content,
                            history: sortedHistory,
                        }),
                    ),
                })

                const response = await lambdaClient.send(command)

                if (response.Payload) {
                    const parsedResponse = JSON.parse(
                        Buffer.from(response.Payload).toString(),
                    )

                    // Extract video segments that were referenced in the response
                    const relatedDocuments =
                        parsedResponse?.metadata?.map((m) => ({
                            videoId: m.video_id,
                            start: m.start,
                            end: m.end,
                        })) || []

                    console.log(parsedResponse)

                    // Store AI response with semantic search references
                    const resMessage = await insertChatMessage(
                        nanoid(),
                        parsedResponse.answer,
                        relatedDocuments,
                        false,
                        knowledgeRoomId,
                        conversationId,
                        context.userId,
                    )

                    return resMessage
                }

                throw Error('No response message')
            } catch (e) {
                console.error(e)
                return Promise.reject(
                    new GraphQLError('Cannot generate response message.'),
                )
            }
        },
    },
}

export default clientResolvers

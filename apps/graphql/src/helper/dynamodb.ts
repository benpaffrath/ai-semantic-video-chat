import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { nanoid } from 'nanoid'
import {
    ChatMessage,
    Conversation,
    KnowledgeRoom,
    RelatedDocuments,
    Video,
} from '../types'

// DynamoDB client configured for eu-central-1 region
const client = new DynamoDBClient({
    region: 'eu-central-1',
})

/**
 * Creates a new knowledge room with unique ID and metadata
 * Uses PK: ROOM#{id}, SK: METADATA pattern for single-table design
 */
export async function insertKnowledgeRoom(
    title: string,
    userId: string,
): Promise<KnowledgeRoom> {
    const id = nanoid()
    const createdAt = new Date().toUTCString()

    const params: PutItemCommandInput = {
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        Item: {
            PK: { S: `ROOM#${id}` },
            SK: { S: 'METADATA' },
            type: { S: 'KnowledgeRoom' },
            title: { S: title },
            userId: { S: userId },
            createdAt: { S: createdAt },
        },
    }

    const command = new PutItemCommand(params)
    await client.send(command)

    return {
        id,
        title,
        createdAt,
    }
}

/**
 * Creates a conversation within a knowledge room
 * Uses PK: ROOM#{knowledgeRoomId}, SK: CONVERSATION#{id} for hierarchical access
 */
export async function insertConversation(
    title: string,
    knowledgeRoomId: string,
    userId: string,
): Promise<KnowledgeRoom> {
    const id = nanoid()
    const createdAt = new Date().toUTCString()

    const params: PutItemCommandInput = {
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        Item: {
            PK: { S: `ROOM#${knowledgeRoomId}` },
            SK: { S: `CONVERSATION#${id}` },
            type: { S: 'Conversation' },
            title: { S: title },
            userId: { S: userId },
            createdAt: { S: createdAt },
        },
    }

    const command = new PutItemCommand(params)
    await client.send(command)

    return {
        id,
        title,
        createdAt,
    }
}

/**
 * Stores video metadata with initial transcription status
 * Video files are stored separately in S3, this contains metadata and processing state
 */
export async function insertVideo(
    id: string,
    title: string,
    duration: number,
    previewImage: string,
    videoKey: string,
    type: string,
    knowledgeRoomId: string,
    userId: string,
) {
    const createdAt = new Date().toUTCString()
    // Initial status indicates transcription is being processed
    const status = 'TRANSCRIPTION_CREATING'

    const params: PutItemCommandInput = {
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        Item: {
            PK: { S: `ROOM#${knowledgeRoomId}` },
            SK: { S: `VIDEO#${id}` },
            type: { S: 'Video' },
            title: { S: title },
            metadata: {
                M: {
                    duration: { N: duration.toString() },
                    previewImage: { S: previewImage },
                    videoKey: { S: videoKey },
                    type: { S: type },
                    status: { S: status },
                },
            },
            userId: { S: userId },
            createdAt: { S: createdAt },
        },
    }

    const command = new PutItemCommand(params)
    await client.send(command)

    return {
        id,
        title,
        duration,
        previewImage,
        videoKey,
        type,
        status,
        createdAt,
    }
}

/**
 * Stores chat messages with semantic search references
 * RelatedDocuments contain video segments that were used to generate the response
 */
export async function insertChatMessage(
    messageId: string,
    content: string,
    relatedDocuments: RelatedDocuments[],
    isUserMessage: boolean,
    knowledgeRoomId: string,
    conversationId: string,
    userId: string,
): Promise<ChatMessage> {
    const createdAt = new Date().toUTCString()

    const params: PutItemCommandInput = {
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        Item: {
            // Composite key allows efficient querying of messages within a conversation
            PK: { S: `ROOM#${knowledgeRoomId}#CONVERSATION#${conversationId}` },
            SK: { S: `MESSAGE#${messageId}` },
            type: { S: 'ChatMessage' },
            metadata: {
                M: {
                    content: { S: content },
                    isUserMessage: { BOOL: isUserMessage },
                    relatedDocuments: {
                        L: relatedDocuments.map((doc) => ({
                            M: {
                                videoId: { S: doc.videoId },
                                start: { N: doc.start.toString() },
                                end: { N: doc.end.toString() },
                            },
                        })),
                    },
                },
            },
            userId: { S: userId },
            createdAt: { S: createdAt },
        },
    }

    const command = new PutItemCommand(params)
    await client.send(command)

    return {
        id: messageId,
        content,
        isUserMessage,
        relatedDocuments,
        createdAt,
    }
}

/**
 * Retrieves all knowledge rooms for a user using GSI
 * Uses UserIdIndex to efficiently query by userId and filter by type
 */
export async function listKnowledgeRoomsByUserId(
    userId: string,
): Promise<KnowledgeRoom[]> {
    const command = new QueryCommand({
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: '#type = :roomType',
        ExpressionAttributeNames: {
            '#type': 'type',
        },
        ExpressionAttributeValues: {
            ':userId': { S: userId },
            ':roomType': { S: 'KnowledgeRoom' },
        },
    })

    const result = await client.send(command)

    return (
        result?.Items?.map((item) => ({
            // Extract room ID from PK (ROOM#{id})
            id: item.PK.S!.split('#')[1],
            title: item.title.S!,
            createdAt: item.createdAt.S!,
        })) || []
    )
}

/**
 * Lists conversations within a knowledge room
 * Uses begins_with to efficiently query all conversation items
 */
export async function listConversationsByKnowledgeRoom(
    knowledgeRoomId: string,
    userId: string,
): Promise<Conversation[]> {
    const command = new QueryCommand({
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':pk': { S: `ROOM#${knowledgeRoomId}` },
            ':skPrefix': { S: 'CONVERSATION#' },
            ':userId': { S: userId },
        },
    })

    const result = await client.send(command)

    return (
        result?.Items?.map((item) => ({
            // Extract conversation ID from SK (CONVERSATION#{id})
            id: item.SK.S!.split('#')[1],
            title: item.title.S!,
            createdAt: item.createdAt.S!,
        })) || []
    )
}

/**
 * Retrieves all videos in a knowledge room with metadata
 * Includes processing status and video file references
 */
export async function listVideosByKnowledgeRoom(
    knowledgeRoomId: string,
    userId: string,
): Promise<Video[]> {
    const command = new QueryCommand({
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':pk': { S: `ROOM#${knowledgeRoomId}` },
            ':skPrefix': { S: 'VIDEO#' },
            ':userId': { S: userId },
        },
    })

    const result = await client.send(command)

    return (
        result?.Items?.map((item) => ({
            // Extract video ID from SK (VIDEO#{id})
            id: item.SK.S!.split('#')[1],
            title: item.title.S!,
            duration: parseFloat(item.metadata?.M?.duration.N || '0'),
            previewImage: item.metadata?.M?.previewImage?.S || '',
            status: item.metadata?.M?.status?.S || '',
            videoKey: item.metadata?.M?.videoKey?.S || '',
            type: item.metadata?.M?.type?.S || '',
            videoUrl: '',
            createdAt: item.createdAt.S!,
        })) || []
    )
}

/**
 * Retrieves chat messages in chronological order
 * Uses ScanIndexForward: true to maintain conversation flow
 */
export async function listChatMessagesByConversation(
    knowledgeRoomId: string,
    conversationId: string,
    userId: string,
): Promise<ChatMessage[]> {
    const command = new QueryCommand({
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':pk': {
                S: `ROOM#${knowledgeRoomId}#CONVERSATION#${conversationId}`,
            },
            ':skPrefix': { S: 'MESSAGE#' },
            ':userId': { S: userId },
        },
        // Ensures messages are returned in chronological order
        ScanIndexForward: true,
    })

    const result = await client.send(command)

    return (
        result?.Items?.map((item) => ({
            // Extract message ID from SK (MESSAGE#{id})
            id: item.SK.S!.split('#')[1],
            content: item.metadata?.M?.content.S || '',
            isUserMessage: item.metadata?.M?.isUserMessage.BOOL || false,
            relatedDocuments:
                item.metadata?.M?.relatedDocuments?.L?.map((doc) => ({
                    videoId: doc.M?.videoId?.S || '',
                    start: parseInt(doc.M?.start.N || '0', 10),
                    end: parseInt(doc.M?.end.N || '0', 10),
                })) || [],
            createdAt: item.createdAt.S!,
        })) || []
    )
}

export default client

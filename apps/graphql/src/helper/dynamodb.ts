import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { nanoid } from 'nanoid'
import { ChatMessage, Conversation, KnowledgeRoom, Video } from '../types'

const client = new DynamoDBClient({
    region: 'eu-central-1',
})

// Function to create knowledge rooms in the dynamodb
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

// Function to create a chat conversation in the dynamodb
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

export async function insertChatMessage(
    messageId: string,
    content: string,
    isUserMessage: boolean,
    knowledgeRoomId: string,
    conversationId: string,
    userId: string,
): Promise<ChatMessage> {
    const createdAt = new Date().toUTCString()

    const params: PutItemCommandInput = {
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        Item: {
            PK: { S: `ROOM#${knowledgeRoomId}#CONVERSATION#${conversationId}` },
            SK: { S: `MESSAGE#${messageId}` },
            type: { S: 'ChatMessage' },
            metadata: {
                M: {
                    content: { S: content },
                    isUserMessage: { BOOL: isUserMessage },
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
        createdAt,
    }
}

// Query all knowledge rooms by userId (secondary index)
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
            id: item.PK.S!.split('#')[1],
            title: item.title.S!,
            createdAt: item.createdAt.S!,
        })) || []
    )
}

// Query all knowledge rooms by knowledeRoomId and userId (secondary index)
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
            id: item.SK.S!.split('#')[1],
            title: item.title.S!,
            createdAt: item.createdAt.S!,
        })) || []
    )
}

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
        ScanIndexForward: true, // sort ascending by SK (i.e., by created order)
    })

    const result = await client.send(command)

    return (
        result?.Items?.map((item) => ({
            id: item.SK.S!.split('#')[1],
            content: item.metadata?.M?.content.S || '',
            isUserMessage: item.metadata?.M?.isUserMessage.BOOL || false,
            createdAt: item.createdAt.S!,
        })) || []
    )
}

export default client

import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { nanoid } from 'nanoid'
import { Conversation, KnowledgeRoom } from '../types'

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

// Query all knowledge rooms by userId (secondary index)
export async function listKnowledgeRoomsByUserId(
    userId: string,
): Promise<KnowledgeRoom[]> {
    const command = new QueryCommand({
        TableName: process.env.SEMANTIC_VIDEO_CHAT_TABLE_NAME,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': { S: userId },
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

export default client

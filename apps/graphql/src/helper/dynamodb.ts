import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import { nanoid } from 'nanoid'
import { KnowledgeRoom } from '../types'

const client = new DynamoDBClient({
    region: 'eu-central-1',
})

export async function insertKnowledeRoom(
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

export default client

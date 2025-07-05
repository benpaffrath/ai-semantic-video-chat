import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

// SQS client configured for eu-central-1 region
const sqsClient = new SQSClient({ region: 'eu-central-1' })

/**
 * Sends video processing events to SQS queue for asynchronous transcription
 * Triggers the transcription Lambda function to process uploaded videos
 */
export async function sendVideoEventToSQS(
    event: object,
    knowledgeRoomId: string,
    userId: string,
) {
    const queueUrl = process.env.TRANSCRIPTIONS_SQS_QUEUE_URL!

    // Combine event data with context for processing
    const messageBody = JSON.stringify({ ...event, knowledgeRoomId, userId })

    const params = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
    }

    const command = new SendMessageCommand(params)
    const response = await sqsClient.send(command)

    return response.MessageId
}

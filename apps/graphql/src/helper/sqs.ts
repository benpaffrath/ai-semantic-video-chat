import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const sqsClient = new SQSClient({ region: 'eu-central-1' })

export async function sendVideoEventToSQS(
    event: object,
    knowledgeRoomId: string,
    userId: string,
) {
    const queueUrl = process.env.TRANSCRIPTIONS_SQS_QUEUE_URL!

    const messageBody = JSON.stringify({ ...event, knowledgeRoomId, userId })

    const params = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
    }

    const command = new SendMessageCommand(params)
    const response = await sqsClient.send(command)

    return response.MessageId
}

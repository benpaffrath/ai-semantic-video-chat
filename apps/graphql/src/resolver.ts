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

const lambdaClient = new LambdaClient({ region: 'eu-central-1' })

const clientResolvers = {
    Query: {
        listKnowledgeRooms: async (_, __, context: Context) => {
            try {
                return await listKnowledgeRoomsByUserId(context.userId)
            } catch (e) {
                console.error(e)
            }
        },
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
        createUploadUrls: async (_, { input }, context: Context) => {
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

            return resolvedUploadUrls.map((url, index) => ({
                uploadUrl: url,
                fileName: promises[index].fileName,
                fileType: promises[index].fileType,
                key: promises[index].key,
                id: promises[index].id,
            }))
        },
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
        sendChatMessage: async (
            _,
            { input, knowledgeRoomId, conversationId },
            context: Context,
        ) => {
            try {
                const history = ''

                const message = insertChatMessage(
                    input.id,
                    input.content,
                    true,
                    knowledgeRoomId,
                    conversationId,
                    context.userId,
                )

                const command = new InvokeCommand({
                    FunctionName: process.env.CHATS_LAMBDA_ARN,
                    Payload: Buffer.from(JSON.stringify({ message, history })),
                })

                const response = await lambdaClient.send(command)

                if (response.Payload) {
                    const parsedResponse = JSON.parse(
                        Buffer.from(response.Payload).toString(),
                    )

                    // Insert response message to DB
                    const resMessage = insertChatMessage(
                        nanoid(),
                        parsedResponse.content,
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
            }
        },
    },
}

export default clientResolvers
